package com.app.controller;

import com.app.dto.SitioLimpiezaDtos;
import com.app.model.Usuario;
import com.app.service.SitioLimpiezaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/sitios")
public class SitioLimpiezaController {

    private final SitioLimpiezaService sitioService;

    public SitioLimpiezaController(SitioLimpiezaService sitioService) {
        this.sitioService = sitioService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<SitioLimpiezaDtos.SitioLimpiezaResponseDto> obtenerPorId(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id
    ) {
        SitioLimpiezaDtos.SitioLimpiezaResponseDto sitio = sitioService.obtenerPorId(usuario, id);
        return ResponseEntity.ok(sitio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SitioLimpiezaDtos.SitioLimpiezaResponseDto> actualizarSitio(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @Valid @RequestBody SitioLimpiezaDtos.SitioLimpiezaRequestDto requestDto
    ) {
        SitioLimpiezaDtos.SitioLimpiezaResponseDto sitioActualizado = sitioService.actualizarSitio(usuario, id, requestDto);
        return ResponseEntity.ok(sitioActualizado);
    }
}
