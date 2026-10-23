package bo.edu.usfx.descuentos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class CalculadoraDescuentosTest {

    private final CalculadoraDescuentos calculadora = new CalculadoraDescuentos();

    @ParameterizedTest(name = "{0} con {1} % -> {2}")
    @CsvSource({
        "100.00, 10, 90.00",
        "200.00, 25, 150.00",
        "50.00, 50, 25.00",
        "33.33, 10, 30.00",
        "19.99, 15, 16.99"
    })
    void aplicaElDescuentoYRedondeaADosDecimales(double precio, double porcentaje, double esperado) {
        assertEquals(esperado, calculadora.calcularPrecioFinal(precio, porcentaje), 0.0001);
    }

    @Test
    void descuentoCeroDejaElPrecioIgual() {
        assertEquals(80.0, calculadora.calcularPrecioFinal(80.0, 0), 0.0001);
    }

    @Test
    void descuentoTotalDejaElPrecioEnCero() {
        assertEquals(0.0, calculadora.calcularPrecioFinal(80.0, 100), 0.0001);
    }

    @ParameterizedTest(name = "porcentaje {0} es invalido")
    @CsvSource({"-1", "100.01", "150"})
    void rechazaPorcentajesFueraDeRango(double porcentaje) {
        assertThrows(IllegalArgumentException.class, () -> calculadora.calcularPrecioFinal(100, porcentaje));
    }

    @ParameterizedTest(name = "precio {0} es invalido")
    @CsvSource({"0", "-5", "-0.01"})
    void rechazaPreciosNoPositivos(double precio) {
        IllegalArgumentException e =
                assertThrows(IllegalArgumentException.class, () -> calculadora.calcularPrecioFinal(precio, 10));
        assertEquals("El precio original debe ser mayor que cero", e.getMessage());
    }

    // Practica 10: entrada acotada (fronteras del precio maximo y numeros no finitos)

    @Test
    void aceptaElPrecioMaximoExacto() {
        assertEquals(900_000_000.0, calculadora.calcularPrecioFinal(1_000_000_000d, 10), 0.0001);
    }

    @ParameterizedTest(name = "precio {0} supera el maximo")
    @CsvSource({"1000000000.01", "1000000001", "1e300"})
    void rechazaPreciosMayoresQueElMaximo(double precio) {
        IllegalArgumentException e =
                assertThrows(IllegalArgumentException.class, () -> calculadora.calcularPrecioFinal(precio, 10));
        assertEquals("El precio original no puede superar 1000000000", e.getMessage());
    }

    @Test
    void rechazaValoresNoFinitos() {
        double[][] casos = {
            {Double.POSITIVE_INFINITY, 10}, {Double.NEGATIVE_INFINITY, 10}, {Double.NaN, 10}, {100, Double.NaN}
        };
        for (double[] c : casos) {
            IllegalArgumentException e =
                    assertThrows(IllegalArgumentException.class, () -> calculadora.calcularPrecioFinal(c[0], c[1]));
            assertEquals("Los valores deben ser numeros finitos", e.getMessage());
        }
    }
}
