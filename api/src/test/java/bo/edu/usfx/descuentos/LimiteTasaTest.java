package bo.edu.usfx.descuentos;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

/** Ejercicio 1: como maximo 60 solicitudes por minuto por IP; la 61 recibe 429 con Retry-After. */
@SpringBootTest
@AutoConfigureMockMvc
class LimiteTasaTest {

    @Autowired
    private MockMvc mvc;

    private static RequestPostProcessor desde(String ip) {
        return request -> {
            request.setRemoteAddr(ip);
            return request;
        };
    }

    @Test
    void laSolicitud61DelMismoMinutoRecibe429ConRetryAfter() throws Exception {
        for (int i = 1; i <= 60; i++) {
            mvc.perform(get("/api/info").with(desde("203.0.113.10"))).andExpect(status().isOk());
        }
        mvc.perform(get("/api/info").with(desde("203.0.113.10")))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(jsonPath("$.error").value("Demasiadas solicitudes"));
    }

    @Test
    void cadaIpTieneSuPropioContador() throws Exception {
        for (int i = 1; i <= 61; i++) {
            mvc.perform(get("/api/info").with(desde("203.0.113.20")));
        }
        mvc.perform(get("/api/info").with(desde("203.0.113.21"))).andExpect(status().isOk());
    }
}
