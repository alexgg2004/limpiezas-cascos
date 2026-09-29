package com.app.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifica la firma, el emisor y la audiencia de un ID token emitido por
 * Google Identity Services antes de confiar en el email que contiene.
 */
@Component
@RequiredArgsConstructor
public class GoogleTokenVerifier {

    private final GoogleAuthProperties googleAuthProperties;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    void init() {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleAuthProperties.getClientId()))
                .build();
    }

    /**
     * Devuelve el payload verificado del token, o lanza IllegalArgumentException
     * si el token no es valido, esta caducado o no fue emitido para esta app.
     */
    public GoogleIdToken.Payload verify(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Token de Google invalido o caducado");
            }
            return idToken.getPayload();
        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalArgumentException("No se pudo verificar el token de Google", e);
        }
    }
}
