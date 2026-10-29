# Respuestas · Laboratorio 4
Alumno: 20220256
Presupuesto: [8] min  Métrica DORA: [ change failure rate ]

## Parte 1 · Diagnóstico
### Defecto 1
- Job y etapa:  build-push, verificación 
- Problema que causa en el pipeline: se hacía el build y publicación en pull request
- Link al commit: https://github.com/josedelcastillo/INF384-lab4-dev/commit/191568208af67d7236eb7cc74ba26dc26e262d66
- Corrección (una o más: mover de etapa / dejar como informativo / eliminar / ajustar configuración / modificar tests):ajustar configuración 
- Evidencia (dato observado, con link al run o fragmento de la salida local): https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40959969438, corrieron todas, pero ahora se demora más 
### Defecto 2
- Job y etapa: las pruebas corren antes del despliegue
- Problema que causa en el pipeline: no se hace el smoke test después del despliegue
- Link al commit:https://github.com/josedelcastillo/INF384-lab4-dev/commit/4f895429ccf8dab08e045f8dcf3adeaa73ece9c4
- Corrección (una o más: mover de etapa / dejar como informativo / eliminar / ajustar configuración / modificar tests): ajustar configuración
- Evidencia (dato observado, con link al run o fragmento de la salida local):https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40959335661, todo corrió correctamente, pero ahora se demora más 
### Defecto 3
- Job y etapa: integration, integración
- Problema que causa en el pipeline:no necesariamente falla en cada ejecución del pipeline
- Link al commit:https://github.com/josedelcastillo/INF384-lab4-dev/commit/415c21bbe83e1faa35d027f358fef9acab967d46
- Corrección (una o más: mover de etapa / dejar como informativo / eliminar / ajustar configuración / modificar tests): modificar tests
- Evidencia (dato observado, con link al run o fragmento de la salida local):https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40964946398, todo corre bien, pero ahora se demora más 
### Defecto 4
- Job y etapa: load, verificación
- Problema que causa en el pipeline:El pipeline puede aprobar aunque todas las transferencias sean rechazadas
- Link al commit:https://github.com/josedelcastillo/INF384-lab4-dev/commit/490308ca0f464979da260a5e7690e41c925ae35b
- Corrección (una o más: mover de etapa / dejar como informativo / eliminar / ajustar configuración / modificar tests): modificar tests
- Evidencia (dato observado, con link al run o fragmento de la salida local):https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40966883558,  todo corre bien, pero ahora se demora más 
### Defecto 5
- Job y etapa: smoke, verificación
- Problema que causa en el pipeline:smoke comprueba que la API responda, pero podría pasar con una versión anterior
- Link al commit:https://github.com/josedelcastillo/INF384-lab4-dev/commit/9c858720615b3413eedbf445096736318995ba80
- Corrección (una o más: mover de etapa / dejar como informativo / eliminar / ajustar configuración / modificar tests): modificar tests
- Evidencia (dato observado, con link al run o fragmento de la salida local):https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40967235195, todo corre bien, pero ahora se demora más 

## Parte 2 · Implementación
- Link al run en verde en main:https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40966883558
- Link al pull request:https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/pull/1
- Defecto de la aplicación introducido (archivo y descripción): src/db.js: el débito resta un céntimo menos que el monto transferido (monto - 1), lo que desincroniza los saldos y permite transferir aun cuando la cuenta ya no tiene fondos.
- Job que debería detenerlo: integration, porque las pruebas validan los saldos y rechazan transferencias sin fondos.
- Link al run fallido:https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40968043195/job/123777449086?pr=1

## Parte 3 · Decisión bajo restricción
Link al run medido:https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40967235195

| Job | Duración (min:seg) |
|---|---|
| unit | 13|
| integration | 12|
| sast | 22|
| sca |14 |
| build-push |45 |
| deploy |16 |
| smoke |10 |
| e2e |36 |
| load | |
| **Total** | 738|

Resultado de load en ese run:
| Métrica | Valor |
|---|---|
| p90 | 83.24 ms |
| p95 | 85.34 ms |
| Máximo | 394.94 ms |
| Tasa de error | 0.00 % (0 de 34,220 requests) |
| Requests por segundo | 47.46 req/s |

Conclusión sobre el comportamiento bajo carga: con 30 VUs durante 12 minutos, la API procesó 34,220 requests a 47.46 req/s. El p95 fue 85.34 ms, el máximo 394.94 ms y no hubo requests HTTP fallidos. Las 17,110 transferencias fueron exitosas (100 %), por lo que el escenario cumplió sus thresholds en ese run. Es una medición puntual y no garantiza por sí sola el rendimiento sostenido en producción.

SLO propuesto (percentil, valor, ventana) y justificación: p95 de latencia HTTP inferior a 200 ms, medido en una ventana móvil de 30 días. El umbral es más del doble del p95 observado (85.34 ms), lo que deja margen para variaciones y mantiene una meta verificable. Revisar también el error rate con un objetivo inferior a 1 % en la misma ventana.

SLA propuesto y diferencia con el SLO: para clientes, garantizar que al menos el 99.5 % de las requests válidas respondan en menos de 1 s durante cada mes calendario, con exclusiones y compensaciones acordadas por incumplimiento. El SLO es una meta operativa interna más estricta (p95 < 200 ms); el SLA es un compromiso contractual externo, con ventana, alcance y consecuencias definidos.


Cambios para cumplir el presupuesto:
| Cambio | Job | Minutos recuperados |
| Reducir la etapa sostenida de k6 de 10 a 3 minutos; mantiene 3 minutos a 30 VUs y conserva las etapas de subida y bajada. | load | 7 |

Total resultante: Total resultante: estimado 7:02 min (14:02 - 7:00); pendiente de confirmar con un run en `main`.

Link al run en main con los cambios: https://github.com/Gandy-Zinanyuca/INF384-lab4-dev/actions/runs/40970036589

Riesgo aceptado (defecto de la aplicación concreto y efecto en la métrica DORA asignada):
Al reducir la prueba sostenida de carga de 10 a 3 minutos, acepto una menor probabilidad de detectar degradaciones que aparecen tras varios minutos de concurrencia. Por ejemplo, contención progresiva en SQLite podría elevar la latencia o generar errores bajo carga prolongada. Si ese problema llegara a producción, aumentaría la tasa de fallos de cambios (change failure rate). Es un riesgo potencial, no un defecto que esta medición haya demostrado.

Decisión sobre sast (se queda / se mueve a otra etapa o evento / informativo) y razón:
Mantenerlo como bloqueo antes de publicar y desplegar. Busca vulnerabilidades en el código fuente y puede detener un cambio riesgoso; además, en el run observado duró 22 segundos, por lo que moverlo o hacerlo informativo ahorraría poco frente al riesgo de dejar pasar una vulnerabilidad.

## Declaración de uso de IA
Herramientas usadas y para qué: se usó github copilot para responder dudas y aclaraciones
