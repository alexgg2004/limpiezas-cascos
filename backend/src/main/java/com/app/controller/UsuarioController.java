package com.app.controller;

import com.app.dto.UsuarioDtos;
import com.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

/**
 * Listado de usuarios de la app, usado para elegir a quién asignar un
 * servicio ("quién o quiénes se ocupan de él").
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<UsuarioDtos.UsuarioResumenDto>> listar() {
        List<UsuarioDtos.UsuarioResumenDto> lista = usuarioRepository.findAll().stream()
                .sorted(Comparator.comparing(u -> u.getNombreCompleto() != null ? u.getNombreCompleto() : u.getEmail()))
                .map(u -> new UsuarioDtos.UsuarioResumenDto(u.getId(), u.getNombreCompleto(), u.getEmail()))
                .toList();
        return ResponseEntity.ok(lista);
    }
}
