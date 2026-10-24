# Práctica 9 — IA aplicada a la Calidad de Software

| Archivo | Qué es |
|---|---|
| `Practica9_IA_Calidad_David_Lujan.pdf` | Informe completo (capturas 1 a 8, matrices, métricas, revisión, verificación, reto, ejercicios, bitácora) |
| `presentacion.pdf` / `.html` | Diapositivas del Ejercicio 6 (12 láminas) |
| `manual-final.pdf` / `.html` | Manual de usuario final, verificado contra la aplicación |
| `manual-corregido.md` | Manual del reto (Parte B) corregido |
| `inventario.md` | Inventario de la aplicación (Paso 8), la verdad terreno |
| `img/` | Capturas usadas por el manual y la presentación |

Pull request: https://github.com/lujan-99/descuentos-app/pull/6

## Guía de la demostración en vivo (10 minutos)

Preparación (antes de la clase): `git switch practica9 && npm ci && npm --prefix web ci`; abrir
https://descuentos-web-blush.vercel.app y comprobar que el pie dice `API 1.0.0 · commit …` (si Render está dormido,
abrir https://descuentos-api-il43.onrender.com/api/info un minuto antes).

**Demo A — pruebas generadas con IA y su medición (5 min)**

1. Abrir el asistente (Claude) y pegar el prompt de la ronda 1 con `cupones.ts` sin la cabecera. Mostrar la respuesta.
2. Mostrar `web/src/cupones.test.ts` (suite conservada de la ronda 3) y ejecutar, desde `web/`:
   ```
   npm run test:coverage
   TZ=UTC npx stryker run --mutate src/cupones.ts
   ```
   (Stryker tarda ~1 minuto: mientras corre, explicar el defecto de zona horaria.)
3. Mutante a mano en vivo: en `src/cupones.ts` cambiar `>` por `>=` en `fechaIso(hoy) > cupon.vence`, ejecutar
   `npx vitest run src/cupones.test.ts` (falla "el mismo día del vencimiento es válido") y restaurar con
   `git restore src/cupones.ts`.

**Demo B — manual generado frente a la aplicación (5 min)**

1. Abrir `manual-final.pdf` y la aplicación una al lado de la otra.
2. Seguir el paso 3 del manual con 200 y 25 → `Bs 150,00`.
3. Escribir `33,33` con 10 % → `Bs 2999,70`: el error que la IA (y el inventario) no vieron; mostrar el aviso del manual.
4. Escribir 0 en el precio → mensaje literal; comparar con la tabla de la sección 4.

Plan B si falla internet: la API y la web en local (`java -jar api/target/api.jar --server.port=8081` y
`VITE_API_URL=http://localhost:8081 npm --prefix web run build && npm --prefix web run preview`).
