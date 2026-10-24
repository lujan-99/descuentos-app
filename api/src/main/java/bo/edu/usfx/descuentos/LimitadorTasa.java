package bo.edu.usfx.descuentos;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

/**
 * Ventana fija de un minuto por clave (la IP del cliente). El contador vive en la memoria de ESTA instancia:
 * con varias instancias cada una cuenta por su lado (ver el Ejercicio 1 del informe).
 */
public class LimitadorTasa {

    private static final long MINUTO_MS = 60_000;

    private final int maximoPorMinuto;
    private final LongSupplier reloj;
    private final Map<String, Ventana> ventanas = new ConcurrentHashMap<>();

    private record Ventana(long minuto, int cantidad) {}

    public LimitadorTasa(int maximoPorMinuto, LongSupplier reloj) {
        this.maximoPorMinuto = maximoPorMinuto;
        this.reloj = reloj;
    }

    public boolean permite(String clave) {
        long minuto = reloj.getAsLong() / MINUTO_MS;
        if (ventanas.size() > 10_000) {
            ventanas.values().removeIf(v -> v.minuto() < minuto); // no crece sin limite
        }
        Ventana v = ventanas.merge(clave, new Ventana(minuto, 1),
                (vieja, nueva) -> vieja.minuto() == minuto ? new Ventana(minuto, vieja.cantidad() + 1) : nueva);
        return v.cantidad() <= maximoPorMinuto;
    }

    public long segundosHastaElProximoMinuto() {
        long restante = MINUTO_MS - reloj.getAsLong() % MINUTO_MS;
        return (restante + 999) / 1000;
    }
}
