package com.app.dto;

public class UsuarioDtos {
    public record UsuarioResumenDto(Long id, String nombreCompleto, String email) {}
}
