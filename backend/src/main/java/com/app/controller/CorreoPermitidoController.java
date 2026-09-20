package com.app.controller;

import com.app.dto.CorreoPermitidoDtos;
import com.app.model.CorreoPermitido;
import com.app.model.Usuario;
import com.app.repository.CorreoPermitidoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gestión de la lista blanca de correos de Google autorizados a entrar en la
 * app (tabla correos_permitidos). Cualquier cambio aquí surte efecto de
 * inmediato, sin reiniciar el backend.
 */
@RestController
@RequestMapping("/api/correos-permitidos")
@RequiredArgsConstructor
public class CorreoPermitidoController {

    private final CorreoPermitidoRepository correoPermitidoRepository;

    @GetMapping
    public ResponseEntity<List<CorreoPermitidoDtos.CorreoPermitidoResponseDto>> listar() {
        List<CorreoPermitidoDtos.CorreoPermitidoResponseDto> lista = correoPermitidoRepository
                .findAllByOrderByFechaAltaAsc().stream()
                .map(CorreoPermitidoController::aDto)
                .toList();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> anadir(@Valid @RequestBody CorreoPermitidoDtos.CorreoPermitidoRequestDto req) {
        String email = req.email().trim();
        if (correoPermitidoRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.badRequest().body("Error: ese correo ya está en la lista");
        }
        CorreoPermitido guardado = correoPermitidoRepository.save(
                CorreoPermitido.builder().email(email).build());
        return ResponseEntity.ok(aDto(guardado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        CorreoPermitido correo = correoPermitidoRepository.findById(id).orElse(null);
        if (correo == null) {
            return ResponseEntity.notFound().build();
        }
        if (correo.getEmail().equalsIgnoreCase(usuario.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: no puedes quitarte el acceso a ti mismo");
        }
        correoPermitidoRepository.delete(correo);
        return ResponseEntity.noContent().build();
    }

    private static CorreoPermitidoDtos.CorreoPermitidoResponseDto aDto(CorreoPermitido c) {
        return new CorreoPermitidoDtos.CorreoPermitidoResponseDto(c.getId(), c.getEmail(), c.getFechaAlta());
    }
}
