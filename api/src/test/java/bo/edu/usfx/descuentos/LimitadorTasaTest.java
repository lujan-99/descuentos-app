package bo.edu.usfx.descuentos;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class LimitadorTasaTest {

    @Test
    void alPasarElMinutoElContadorVuelveACero() {
        long[] ahora = {0};
        LimitadorTasa limitador = new LimitadorTasa(2, () -> ahora[0]);
        assertTrue(limitador.permite("1.1.1.1"));
        assertTrue(limitador.permite("1.1.1.1"));
        assertFalse(limitador.permite("1.1.1.1"));
        assertEquals(60, limitador.segundosHastaElProximoMinuto());
        ahora[0] = 59_000;
        assertEquals(1, limitador.segundosHastaElProximoMinuto());
        ahora[0] = 60_000;
        assertTrue(limitador.permite("1.1.1.1"));
    }
}
