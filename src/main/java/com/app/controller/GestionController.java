package com.app.controller;

import com.app.dto.AuthDtos;
import com.app.dto.ClienteDtos;
import com.app.dto.ServicioDtos;
import com.app.dto.SitioLimpiezaDtos;
import com.app.model.Rol;
import com.app.model.Usuario;
import com.app.repository.UsuarioRepository;
import com.app.security.JwtUtils;
import com.app.service.GestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GestionController {

    private final GestionService gestionService;

    // CLIENTES
    @GetMapping("/clientes")
    public ResponseEntity<List<ClienteDtos.ClienteResponseDto>> getClientes(@AuthenticationPrincipal Usuario user) {
        return ResponseEntity.ok(gestionService.listarClientes(user.getId()));
    }

    @PostMapping("/clientes")
    public ResponseEntity<ClienteDtos.ClienteResponseDto> createCliente(@Valid @RequestBody ClienteDtos.ClienteRequestDto dto,
                                                                        @AuthenticationPrincipal Usuario user) {
        return ResponseEntity.ok(gestionService.crearCliente(dto, user));
    }

    // SITIOS DE LIMPIEZA
    @GetMapping("/sitios")
    public ResponseEntity<List<SitioLimpiezaDtos.SitioLimpiezaResponseDto>> getSitios(@AuthenticationPrincipal Usuario user) {
        return ResponseEntity.ok(gestionService.listarSitios(user.getId()));
    }

    @PostMapping("/sitios")
    public ResponseEntity<SitioLimpiezaDtos.SitioLimpiezaResponseDto> createSitio(@Valid @RequestBody SitioLimpiezaDtos.SitioLimpiezaRequestDto dto) {
        return ResponseEntity.ok(gestionService.crearSitio(dto));
    }
}
