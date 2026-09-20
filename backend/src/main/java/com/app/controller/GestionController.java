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
    public ResponseEntity<List<ClienteDtos.ClienteResponseDto>> getClientes() {
        return ResponseEntity.ok(gestionService.listarClientes());
    }

    @PostMapping("/clientes")
    public ResponseEntity<ClienteDtos.ClienteResponseDto> createCliente(@Valid @RequestBody ClienteDtos.ClienteRequestDto dto,
                                                                        @AuthenticationPrincipal Usuario user) {
        return ResponseEntity.ok(gestionService.crearCliente(dto, user));
    }

    @PutMapping("/clientes/{id}")
    public ResponseEntity<ClienteDtos.ClienteResponseDto> updateCliente(@PathVariable Long id,
                                                                        @Valid @RequestBody ClienteDtos.ClienteRequestDto dto) {
        return ResponseEntity.ok(gestionService.actualizarCliente(id, dto));
    }

    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable Long id) {
        gestionService.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    // SITIOS DE LIMPIEZA
    @GetMapping("/sitios")
    public ResponseEntity<List<SitioLimpiezaDtos.SitioLimpiezaResponseDto>> getSitios() {
        return ResponseEntity.ok(gestionService.listarSitios());
    }

    @PostMapping("/sitios")
    public ResponseEntity<SitioLimpiezaDtos.SitioLimpiezaResponseDto> createSitio(@Valid @RequestBody SitioLimpiezaDtos.SitioLimpiezaRequestDto dto) {
        return ResponseEntity.ok(gestionService.crearSitio(dto));
    }
}
