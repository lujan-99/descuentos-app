package bo.edu.usfx.descuentos;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Ejercicio 1: como maximo app.limite-tasa.por-minuto solicitudes por minuto e IP; el exceso recibe 429 con
 * Retry-After. Corre despues del filtro de cabeceras, asi que el 429 tambien las lleva. Detras de Render la IP
 * real llega en X-Forwarded-For y server.forward-headers-strategy=native la pone en getRemoteAddr().
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class LimiteTasaFilter extends OncePerRequestFilter {

    private final LimitadorTasa limitador;

    public LimiteTasaFilter(@Value("${app.limite-tasa.por-minuto}") int porMinuto) {
        this.limitador = new LimitadorTasa(porMinuto, System::currentTimeMillis);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().equals("/actuator/health"); // el health check de Render no consume cupo
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (limitador.permite(request.getRemoteAddr())) {
            chain.doFilter(request, response);
            return;
        }
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(limitador.segundosHastaElProximoMinuto()));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"Demasiadas solicitudes\"}");
    }
}
