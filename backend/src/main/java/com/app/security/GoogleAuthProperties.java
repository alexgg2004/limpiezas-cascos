package com.app.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuracion del login con Google: el Client ID de la app OAuth. La lista
 * de correos autorizados vive en la tabla correos_permitidos (ver
 * CorreoPermitidoRepository), no aqui, para poder gestionarla sin reiniciar
 * el backend.
 */
@Component
@ConfigurationProperties(prefix = "app.google")
@Getter
@Setter
public class GoogleAuthProperties {

    private String clientId;
}
