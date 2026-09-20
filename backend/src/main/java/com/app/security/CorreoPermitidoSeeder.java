package com.app.security;

import com.app.model.CorreoPermitido;
import com.app.repository.CorreoPermitidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Migracion de un solo uso: si la tabla correos_permitidos esta vacia y todavia
 * queda configurada la variable de entorno GOOGLE_ALLOWED_EMAILS (el mecanismo
 * anterior, basado en env var), la vuelca en la tabla para no dejar a nadie
 * fuera al desplegar este cambio. En arranques posteriores, con la tabla ya
 * poblada, no hace nada.
 */
@Component
@RequiredArgsConstructor
public class CorreoPermitidoSeeder implements ApplicationRunner {

    private final CorreoPermitidoRepository correoPermitidoRepository;

    @Value("${app.google.allowed-emails-seed:}")
    private String correosSemilla;

    @Override
    public void run(ApplicationArguments args) {
        if (correoPermitidoRepository.count() > 0 || correosSemilla == null || correosSemilla.isBlank()) {
            return;
        }

        Arrays.stream(correosSemilla.split(","))
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .distinct()
                .forEach(email -> correoPermitidoRepository.save(
                        CorreoPermitido.builder().email(email).build()));
    }
}
