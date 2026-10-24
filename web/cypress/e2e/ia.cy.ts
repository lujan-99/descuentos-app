// cypress/e2e/ia.cy.ts
// Pruebas E2E de descuentos-app (baseUrl: http://localhost:4173, API real).
// Selectores: solo atributos data-cy del inventario.

const sel = (id: string) => `[data-cy="${id}"]`

const llenarFormulario = (precio: string, porcentaje: string): void => {
  cy.get(sel('precio')).clear().type(precio)
  cy.get(sel('porcentaje')).clear().type(porcentaje)
}

describe('Calculadora de Descuentos · COM450', () => {
  // Corrección (Práctica 9, Ej. 2): el estado inicial era parte del beforeEach; si cambiaba un texto
  // fallaban las tres pruebas a la vez sin decir cuál regla se rompió. Ahora es una prueba propia.
  beforeEach(() => {
    cy.visit('/')
  })

  it('estado inicial: título, valores de ejemplo y botón Calcular habilitado', () => {
    cy.title().should('eq', 'Calculadora de Descuentos · COM450')
    cy.get(sel('precio')).should('have.value', '100')
    cy.get(sel('porcentaje')).should('have.value', '10')
    cy.get(sel('calcular')).should('have.text', 'Calcular').and('be.enabled')
  })

  it('flujo feliz: calcula el precio final (200 Bs con 25 %)', () => {
    llenarFormulario('200', '25')
    cy.get(sel('calcular')).click()

    cy.get(sel('resultado'), { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'Precio final: Bs 150,00')

    // Al terminar, el botón vuelve a estar habilitado
    cy.get(sel('calcular')).should('be.enabled')
  })

  it('precio inválido: muestra error con precio 0', () => {
    llenarFormulario('0', '10')
    cy.get(sel('calcular')).click()

    cy.get(sel('error'), { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'El precio original debe ser mayor que cero')
  })

  it('porcentaje fuera de rango: muestra error con 150 %', () => {
    llenarFormulario('100', '150')
    cy.get(sel('calcular')).click()

    cy.get(sel('error'), { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'El porcentaje de descuento debe estar entre 0 y 100')
  })
})
