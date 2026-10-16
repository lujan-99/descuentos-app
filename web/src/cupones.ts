/**
 * Cupones de descuento (modulo nuevo, SIN pruebas: es el objetivo de la Parte A).
 *
 * Reglas de negocio:
 *  1. El precio debe ser mayor que cero.
 *  2. El codigo de un cupon valido tiene 4 letras mayusculas y 2 digitos (USFX10). Se ignoran
 *     espacios al inicio y al final y se acepta en minusculas al escribirlo.
 *  3. Un cupon vale hasta el dia de su vencimiento inclusive (formato AAAA-MM-DD).
 *  4. El descuento es precio x porcentaje / 100, redondeado a dos decimales (mitad hacia arriba)
 *     y nunca supera el tope en Bs del cupon.
 *  5. El precio final nunca es negativo.
 */

export interface Cupon {
  codigo: string
  porcentaje: number
  topeBs: number
  vence: string
}

export type ResultadoCupon =
  { ok: true; descuentoBs: number; precioFinal: number } | { ok: false; motivo: string }

const PATRON_CODIGO = /^[A-Z]{4}[0-9]{2}$/

export function normalizarCodigo(texto: string): string {
  return texto.trim().toUpperCase()
}

export function codigoValido(texto: string): boolean {
  return PATRON_CODIGO.test(normalizarCodigo(texto))
}

export function redondear2(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

function fechaIso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

export function aplicarCupon(precio: number, cupon: Cupon | null, hoy: Date): ResultadoCupon {
  if (!Number.isFinite(precio) || precio <= 0) {
    return { ok: false, motivo: 'El precio original debe ser mayor que cero' }
  }
  if (cupon === null) {
    return { ok: false, motivo: 'No hay cupón' }
  }
  if (!codigoValido(cupon.codigo)) {
    return { ok: false, motivo: 'El código del cupón no es válido' }
  }
  if (fechaIso(hoy) > cupon.vence) {
    return { ok: false, motivo: 'El cupón venció' }
  }
  const bruto = redondear2((precio * cupon.porcentaje) / 100)
  const descuentoBs = Math.min(bruto, cupon.topeBs)
  const precioFinal = Math.max(0, redondear2(precio - descuentoBs))
  return { ok: true, descuentoBs, precioFinal }
}
