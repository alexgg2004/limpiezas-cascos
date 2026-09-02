package com.app.controller;

import com.app.dto.AuthDtos;
import com.app.model.Rol;
import com.app.model.Usuario;
import com.app.repository.UsuarioRepository;
import com.app.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        Usuario user = usuarioRepo.findByEmail(req.email()).orElseThrow();
        String token = jwtUtils.generateJwtToken(user.getEmail());
        return ResponseEntity.ok(new AuthDtos.AuthResponse(token, user.getEmail(), user.getNombreCompleto()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
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
}
