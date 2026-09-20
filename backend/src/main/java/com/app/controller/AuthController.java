package com.app.controller;

import com.app.dto.AuthDtos;
import com.app.model.Rol;
import com.app.model.Usuario;
import com.app.repository.CorreoPermitidoRepository;
import com.app.repository.UsuarioRepository;
import com.app.security.GoogleAuthProperties;
import com.app.security.GoogleTokenVerifier;
import com.app.security.JwtUtils;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final GoogleAuthProperties googleAuthProperties;
    private final CorreoPermitidoRepository correoPermitidoRepository;

    @Value("${app.registro.clave-invitacion:}")
    private String claveInvitacionEsperada;

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        Usuario user = usuarioRepo.findByEmail(req.email()).orElseThrow();
        String token = jwtUtils.generateJwtToken(user.getEmail());
        return ResponseEntity.ok(new AuthDtos.AuthResponse(token, user.getEmail(), user.getNombreCompleto()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        if (!claveInvitacionValida(req.claveInvitacion())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: clave de invitación incorrecta");
        }
        if (usuarioRepo.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body("Error: El email ya está registrado");
        }
        Usuario user = Usuario.builder()
                .email(req.email())
                .password(encoder.encode(req.password()))
                .nombreCompleto(req.nombreCompleto())
                .nifCif(req.nifCif())
                .rol(Rol.ROLE_USER)
                .build();
        usuarioRepo.save(user);
        return ResponseEntity.ok("Usuario registrado correctamente");
    }

    /**
     * Compara con la clave de invitación configurada (app.registro.clave-invitacion)
     * en tiempo constante para no filtrar su valor por temporización. Si no hay
     * clave configurada, el registro queda cerrado por defecto.
     */
    private boolean claveInvitacionValida(String recibida) {
        if (claveInvitacionEsperada == null || claveInvitacionEsperada.isBlank() || recibida == null) {
            return false;
        }
        return MessageDigest.isEqual(
                recibida.getBytes(StandardCharsets.UTF_8),
                claveInvitacionEsperada.getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Login con Google. Verifica el ID token emitido por Google Identity Services,
     * comprueba que el email está en la lista blanca (tabla correos_permitidos,
     * gestionable en caliente vía CorreoPermitidoController) y, solo entonces,
     * crea sesión (dando de alta el usuario en el primer acceso).
     */
    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@Valid @RequestBody AuthDtos.GoogleLoginRequest req) {
        if (googleAuthProperties.getClientId() == null || googleAuthProperties.getClientId().isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Error: el login con Google no está configurado en el servidor");
        }

        GoogleIdToken.Payload payload;
        try {
            payload = googleTokenVerifier.verify(req.idToken());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error: token de Google no válido");
        }

        String email = payload.getEmail();
        Boolean emailVerificado = payload.getEmailVerified();
        if (email == null || emailVerificado == null || !emailVerificado) {
            return ResponseEntity.badRequest().body("Error: el email de la cuenta de Google no está verificado");
        }

        if (!correoPermitidoRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Error: esta cuenta de Google no tiene acceso a la aplicación");
        }

        String nombreGoogle = (String) payload.get("name");

        Usuario user = usuarioRepo.findByEmail(email).orElseGet(() -> {
            Usuario nuevo = Usuario.builder()
                    .email(email)
                    .password(encoder.encode(UUID.randomUUID().toString()))
                    .nombreCompleto(nombreGoogle != null ? nombreGoogle : email)
                    .rol(Rol.ROLE_USER)
                    .build();
            return usuarioRepo.save(nuevo);
        });

        String token = jwtUtils.generateJwtToken(user.getEmail());
        return ResponseEntity.ok(new AuthDtos.AuthResponse(token, user.getEmail(), user.getNombreCompleto()));
    }
}
