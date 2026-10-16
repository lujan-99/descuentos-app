# Inventario de la aplicación descuentos-app (Paso 8)

Recorrido hecho en el navegador (Chromium) sobre la aplicación real, sin leer el código, el 2026-10-16.
Versión: web de la rama `practica9` + API 1.0.0 (commit 532d643) en local. Las capturas están en
`capturas/inventario/` y `capturas/verificacion/` del informe.

> Corrección del 2026-10-16: la primera versión de este inventario decía que el precio aceptaba `33,33`. El
> recorrido automático escribía `33.33` (con punto); al verificar el manual se probó la coma y el campo la
> descarta. Se corrigió la fila y se agregó la de "Decimal con coma".

| Elemento | Texto exacto / comportamiento | Cómo se comprobó |
|---|---|---|
| Título de la pestaña | `Calculadora de Descuentos · COM450` | Título del navegador |
| Encabezado | `Calculadora de Descuentos`; debajo, `COM450 · Calidad de Software · Práctica 8` | Captura 01 |
| Campo 1 | Etiqueta `Precio original (Bs)`; valor inicial `100`; campo numérico: acepta decimales **solo con punto** (`33.33`); las letras no se escriben | Captura 01; se escribió 33.33 y abc |
| Campo 2 | Etiqueta `Descuento (%)`; valor inicial `10`; campo numérico: acepta decimales solo con punto (`100.01`) | Captura 01; se escribió 100.01 |
| Decimal con coma | Si se escribe `33,33`, el campo descarta la coma y queda `3333` **sin aviso**: el resultado es `Bs 2999,70` en vez de `Bs 30,00` | Chromium en es-BO y en-US (`verificacion/*-coma.png`) |
| Precio máximo | No hay: 999999999999 con 10 % → `Bs 899999999999,10` | `verificacion/*-grande.png` |
| Botón principal | `Calcular`; mientras calcula dice `Calculando…` y queda deshabilitado | Capturas 01 y 14 (API con 2 s de demora) |
| Resultado | Recuadro verde debajo del botón: `Precio final: Bs 150,00` (Bs delante, coma decimal, siempre 2 decimales, sin separador de miles: `Bs 1111,05`) | Capturas 02 y 07 (200 con 25 %; 1234,5 con 10 %) |
| Error de precio | `El precio original debe ser mayor que cero`, en un recuadro rosado con borde rojo debajo del botón; también con el precio vacío | Capturas 08, 09 y 13 (0, -5, vacío) |
| Error de porcentaje | `El porcentaje de descuento debe estar entre 0 y 100`, mismo recuadro | Capturas 10, 11 y 12 (150, -1, 100,01) |
| Rango del porcentaje | 0 a 100, ambos incluidos (0 % → `Bs 100,00`; 100 % → `Bs 0,00`) | Capturas 05 y 06 |
| Precio mínimo | Debe ser mayor que 0 (0 da error; 0,05 se acepta) | Capturas 04 y 08 |
| Redondeo | A dos decimales, la mitad hacia arriba: 33,33 con 10 % → `Bs 30,00` (29,997); 0,05 con 10 % → `Bs 0,05` (0,045) | Capturas 03 y 04 |
| Pie de página con API | `API 1.0.0 · commit 532d643` (versión y commit corto de la API) | Captura 01 |
| Pie de página sin API | `API sin conexión` | Captura 15 (peticiones a la API bloqueadas) |
| Calcular sin API | Recuadro de error con el texto `Failed to fetch` (en inglés) | Captura 16 |
| Estados | Inicial (formulario con 100 y 10), cargando (`Calculando…`), éxito (recuadro verde), error (recuadro rosado), sin conexión (pie `API sin conexión`) | Capturas 01, 14, 02, 08, 15 |
| Otras funciones | No hay inicio de sesión, cuenta, historial, menú ni enlaces: el único botón es `Calcular` | Recorrido de la página |
