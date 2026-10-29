import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE = (__ENV.BASE_URL || '').replace(/\/$/, '');
const SLO_P95 = Number(__ENV.SLO_P95 || 500);
const transferSuccessRate = new Rate('transfer_success_rate');

http.setResponseCallback(http.expectedStatuses(200));

export const options = {
  stages: [
    { duration: '1m', target: 30 },
    { duration: '10m', target: 30 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: [`p(95)<${SLO_P95}`],
    http_req_failed: ['rate<0.01'],
    transfer_success_rate: ['rate>0.99'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const origen = (__VU + __ITER) % 2 === 0 ? 'ana' : 'beto';
  const destino = origen === 'ana' ? 'beto' : 'ana';

  const t = http.post(
    `${BASE}/transferir`,
    JSON.stringify({ origen, destino, monto: 1 }),
    { headers: { 'content-type': 'application/json' }, tags: { endpoint: 'transferir' } },
  );
  const transferenciaExitosa = t.status === 200;
  transferSuccessRate.add(transferenciaExitosa);
  check(t, { 'transferencia exitosa 200': () => transferenciaExitosa });

  const s = http.get(`${BASE}/saldo/${origen}`, { tags: { endpoint: 'saldo' } });
  check(s, { 'saldo 200': (r) => r.status === 200 });

  sleep(1);
}
