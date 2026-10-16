import { describe, it, expect } from 'vitest'
import { aplicarCupon, codigoValido, normalizarCodigo, type Cupon } from './cupones'

// Cupón base: 10 %, tope 20 Bs, vence el 16/10/2026
const base: Cupon = { codigo: 'USFX10', porcentaje: 10, topeBs: 20, vence: '2026-10-16' }
const cupon = (cambios: Partial<Cupon> = {}): Cupon => ({ ...base, ...cambios })

// Instantes absolutos en hora de Bolivia (America/La_Paz = UTC-4 fijo, sin horario de verano).
// El desfase explícito hace que el instante sea el mismo en cualquier máquina:
// la suite NO depende de la zona horaria del entorno (local o CI).
const enLaPaz = (fecha: string, hora = '12:00') => new Date(`${fecha}T${hora}:00-04:00`)
const HOY = enLaPaz('2026-10-10')

// ─────────────────────────────────────────────────────────────
// Regla 1: el precio debe ser mayor que cero
// ─────────────────────────────────────────────────────────────
describe('Regla 1: precio mayor que cero', () => {
  const ERROR = { ok: false, motivo: 'El precio original debe ser mayor que cero' }

  it('rechaza un precio negativo (antes del umbral): -0.01', () => {
    expect(aplicarCupon(-0.01, cupon(), HOY)).toEqual(ERROR)
  })

  it('rechaza precio 0 (en el umbral)', () => {
    expect(aplicarCupon(0, cupon(), HOY)).toEqual(ERROR)
  })

  it('acepta 0.01 (justo después del umbral): 10 % de 0.01 = 0.001 -> 0.00', () => {
    expect(aplicarCupon(0.01, cupon(), HOY)).toEqual({
      ok: true,
      descuentoBs: 0,
      precioFinal: 0.01,
    })
  })

  it('rechaza NaN e Infinity', () => {
    expect(aplicarCupon(NaN, cupon(), HOY)).toEqual(ERROR)
    expect(aplicarCupon(Infinity, cupon(), HOY)).toEqual(ERROR)
  })

  it('sin cupón devuelve el mensaje literal', () => {
    expect(aplicarCupon(100, null, HOY)).toEqual({ ok: false, motivo: 'No hay cupón' })
  })
})

// ─────────────────────────────────────────────────────────────
// Regla 2: formato del código (4 mayúsculas + 2 dígitos, trim, minúsculas aceptadas)
// ─────────────────────────────────────────────────────────────
describe('Regla 2: código del cupón', () => {
  const ERROR = { ok: false, motivo: 'El código del cupón no es válido' }

  it('normaliza espacios al inicio y al final, y pasa a mayúsculas', () => {
    expect(normalizarCodigo('  usfx10  ')).toBe('USFX10')
    expect(normalizarCodigo('\tUsFx10\n')).toBe('USFX10')
  })

  it.each(['USFX10', 'usfx10', '  USFX10 ', 'AbCd99'])('acepta "%s"', (c) => {
    expect(codigoValido(c)).toBe(true)
  })

  it.each([
    ['USF10', '3 letras'],
    ['USFXY10', '5 letras'],
    ['USFX1', '1 dígito'],
    ['USFX100', '3 dígitos'],
    ['US FX10', 'espacio interno'],
    ['10USFX', 'orden invertido'],
    ['USFX1A', 'letra en vez de dígito'],
    ['', 'vacío'],
  ])('rechaza "%s" (%s)', (c) => {
    expect(codigoValido(c)).toBe(false)
  })

  it('aplicarCupon acepta un código en minúsculas con espacios: 10 % de 100 = 10', () => {
    expect(aplicarCupon(100, cupon({ codigo: ' usfx10 ' }), HOY)).toEqual({
      ok: true,
      descuentoBs: 10,
      precioFinal: 90,
    })
  })

  it('aplicarCupon rechaza un código inválido con el mensaje literal', () => {
    expect(aplicarCupon(100, cupon({ codigo: 'USFX1' }), HOY)).toEqual(ERROR)
  })
})

// ─────────────────────────────────────────────────────────────
// Regla 3: vale hasta el día de vencimiento inclusive (día calendario en Bolivia)
// ─────────────────────────────────────────────────────────────
describe('Regla 3: vencimiento inclusive', () => {
  const VENCIDO = { ok: false, motivo: 'El cupón venció' }
  const OK_100 = { ok: true, descuentoBs: 10, precioFinal: 90 }

  it('el día anterior al vencimiento es válido', () => {
    expect(aplicarCupon(100, cupon(), enLaPaz('2026-10-15'))).toEqual(OK_100)
  })

  it('el mismo día del vencimiento es válido', () => {
    expect(aplicarCupon(100, cupon(), enLaPaz('2026-10-16'))).toEqual(OK_100)
  })

  it('el día siguiente al vencimiento está vencido', () => {
    expect(aplicarCupon(100, cupon(), enLaPaz('2026-10-17'))).toEqual(VENCIDO)
  })

  it('el día del vencimiento a las 20:00 en La Paz (00:00 UTC del día siguiente) sigue siendo válido', () => {
    expect(aplicarCupon(100, cupon(), enLaPaz('2026-10-16', '20:00'))).toEqual(OK_100)
  })

  it('el día del vencimiento a las 23:30 en La Paz sigue siendo válido', () => {
    expect(aplicarCupon(100, cupon(), enLaPaz('2026-10-16', '23:30'))).toEqual(OK_100)
  })

  it('el día siguiente a las 00:30 en La Paz ya está vencido', () => {
    expect(aplicarCupon(100, cupon(), enLaPaz('2026-10-17', '00:30'))).toEqual(VENCIDO)
  })

  it('cambio de año: vence 2026-12-31, hoy 2027-01-01 -> vencido', () => {
    expect(aplicarCupon(100, cupon({ vence: '2026-12-31' }), enLaPaz('2027-01-01'))).toEqual(
      VENCIDO,
    )
  })
})

// ─────────────────────────────────────────────────────────────
// Regla 4: descuento = precio x % / 100, redondeo a 2 decimales (mitad arriba), con tope
// ─────────────────────────────────────────────────────────────
describe('Regla 4: cálculo, redondeo y tope del descuento', () => {
  // Tope 20 Bs con 10 %: el umbral está en un precio de 200 Bs
  it('justo antes del tope: 10 % de 199.90 = 19.99', () => {
    expect(aplicarCupon(199.9, cupon(), HOY)).toEqual({
      ok: true,
      descuentoBs: 19.99,
      precioFinal: 179.91,
    })
  })

  it('en el tope: 10 % de 200 = 20', () => {
    expect(aplicarCupon(200, cupon(), HOY)).toEqual({ ok: true, descuentoBs: 20, precioFinal: 180 })
  })

  it('justo después del tope: 10 % de 200.10 = 20.01 -> se limita a 20', () => {
    expect(aplicarCupon(200.1, cupon(), HOY)).toEqual({
      ok: true,
      descuentoBs: 20,
      precioFinal: 180.1,
    })
  })

  it('muy por encima del tope: 10 % de 1000 = 100 -> se limita a 20', () => {
    expect(aplicarCupon(1000, cupon(), HOY)).toEqual({
      ok: true,
      descuentoBs: 20,
      precioFinal: 980,
    })
  })

  it('redondea a dos decimales por debajo de la mitad: 10 % de 12.34 = 1.234 -> 1.23', () => {
    expect(aplicarCupon(12.34, cupon(), HOY)).toEqual({
      ok: true,
      descuentoBs: 1.23,
      precioFinal: 11.11,
    })
  })

  it('mitad hacia arriba: 10 % de 10.05 = 1.005 -> 1.01', () => {
    expect(aplicarCupon(10.05, cupon(), HOY)).toEqual({
      ok: true,
      descuentoBs: 1.01,
      precioFinal: 9.04,
    })
  })

  it('mitad hacia arriba: 25 % de 20.10 = 5.025 -> 5.03', () => {
    expect(aplicarCupon(20.1, cupon({ porcentaje: 25 }), HOY)).toEqual({
      ok: true,
      descuentoBs: 5.03,
      precioFinal: 15.07,
    })
  })

  it('mitad hacia arriba con acarreo: 15 % de 33.33 = 4.9995 -> 5.00', () => {
    expect(aplicarCupon(33.33, cupon({ porcentaje: 15 }), HOY)).toEqual({
      ok: true,
      descuentoBs: 5,
      precioFinal: 28.33,
    })
  })

  it('15 % de 99.99 = 14.9985 -> 15.00 (por debajo de un tope de 20)', () => {
    expect(aplicarCupon(99.99, cupon({ porcentaje: 15 }), HOY)).toEqual({
      ok: true,
      descuentoBs: 15,
      precioFinal: 84.99,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// Regla 5: el precio final nunca es negativo
// ─────────────────────────────────────────────────────────────
describe('Regla 5: precio final no negativo', () => {
  it('100 % de 50 con tope alto: precio final exactamente 0', () => {
    expect(aplicarCupon(50, cupon({ porcentaje: 100, topeBs: 1000 }), HOY)).toEqual({
      ok: true,
      descuentoBs: 50,
      precioFinal: 0,
    })
  })

  it('99 % de 50 = 49.50: precio final 0.50 (justo antes de 0)', () => {
    expect(aplicarCupon(50, cupon({ porcentaje: 99, topeBs: 1000 }), HOY)).toEqual({
      ok: true,
      descuentoBs: 49.5,
      precioFinal: 0.5,
    })
  })

  it('150 % de 100 (descuento 150, bajo el tope de 1000): el precio final queda en 0, no en -50', () => {
    expect(aplicarCupon(100, cupon({ porcentaje: 150, topeBs: 1000 }), HOY)).toEqual({
      ok: true,
      descuentoBs: 150,
      precioFinal: 0,
    })
  })
})
