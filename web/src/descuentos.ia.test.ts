// Pruebas "generadas por un asistente de IA" para web/src/descuentos.ts.
// Copia este archivo a web/src/ de descuentos-app. NO lo corrijas a mano al leerlo: primero ejecútalo.
import { describe, expect, it } from 'vitest'
import { formatearBs, validar } from './descuentos'

describe('validar', () => {
  it('acepta un precio y un porcentaje validos', () => {
    expect(validar(100, 10)).toBeNull()
  })

  it('rechaza un precio negativo con el mensaje correcto', () => {
    expect(validar(-5, 10)).toBe('El precio original debe ser mayor que cero')
  })

  it('rechaza el precio cero', () => {
    expect(validar(0, 10)).toBe('El precio original debe ser mayor que cero')
  })

  it('rechaza un porcentaje mayor que 100', () => {
    expect(validar(100, 150)).toBe('El porcentaje de descuento debe estar entre 0 y 100')
  })

  it('rechaza el porcentaje 100.01', () => {
    expect(validar(100, 100.01)).toBe('El porcentaje de descuento debe estar entre 0 y 100')
  })
})

describe('formatearBs', () => {
  it('formatea un valor con coma decimal', () => {
    const valor = 1234.5
    expect(formatearBs(valor)).toBe(`Bs ${valor.toFixed(2).replace('.', ',')}`)
  })
})
