# Manual de usuario — Calculadora de Descuentos

*Versión corregida del borrador generado por IA (Práctica 9, Parte B). Cada afirmación se comprobó en la
aplicación real (local: API 1.0.0, commit 532d643); la evidencia está en la tabla de diagnóstico del informe.*

## 1. ¿Para qué sirve?

La Calculadora de Descuentos permite conocer rápidamente el precio final de un producto después de
aplicarle un porcentaje de descuento. Está pensada para vendedores y clientes de cualquier tienda.

## 2. Cómo ingresar

No hace falta crear una cuenta ni iniciar sesión: abra la dirección de la aplicación en el navegador y
la calculadora aparece lista para usar.

## 3. Cómo calcular un descuento

1. Escriba el **Precio original (Bs)** en el primer campo. Debe ser mayor que cero; acepta decimales
   (por ejemplo 33,33).
2. Escriba el **Descuento (%)** en el segundo campo. Puede ir de 0 a 100, ambos incluidos.
3. Pulse el botón **Calcular**. Mientras se hace el cálculo el botón muestra **Calculando…** y no se
   puede volver a pulsar.
4. El resultado aparece debajo del botón con el formato **Precio final: Bs 150,00** (la moneda va
   delante, la coma separa los decimales y siempre hay dos decimales).

El precio final se redondea a dos decimales con la regla de la mitad hacia arriba: si el tercer
decimal es 5 o más, el segundo sube. Por ejemplo, 0,05 Bs con 10 % da 0,045 y se muestra como
**Bs 0,05**; 33,33 Bs con 10 % da 29,997 y se muestra como **Bs 30,00**.

## 4. Si algo sale mal

Si un dato no es correcto, debajo del botón aparece un recuadro rosado con uno de estos mensajes:

| Mensaje | Cuándo aparece | Qué hacer |
|---|---|---|
| **El precio original debe ser mayor que cero** | El precio es 0, negativo o está vacío. | Escriba un precio mayor que cero. |
| **El porcentaje de descuento debe estar entre 0 y 100** | El descuento es negativo o mayor que 100 (por ejemplo 150 o 100,01). | Escriba un descuento entre 0 y 100. |

Corrija el campo y vuelva a pulsar **Calcular**.

## 5. Pie de página

Al final de la tarjeta se muestra el estado de la conexión con el servidor que hace los cálculos:

- **API 1.0.0 · commit 532d643** (o la versión que corresponda): hay conexión y la calculadora funciona.
- **API sin conexión**: el servidor no responde. Si pulsa **Calcular** en ese estado aparece el mensaje
  **Failed to fetch** (en inglés). Espere unos minutos y recargue la página.

## Nota sobre funciones que no existen

La aplicación **no** guarda un historial de cálculos ni tiene un botón *Historial*; tampoco muestra la
fecha de actualización ni el nombre del desarrollador. Si necesita conservar un resultado, anótelo.
