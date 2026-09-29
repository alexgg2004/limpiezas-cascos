package com.app.dto;

import jakarta.validation.constraints.NotBlank;

public class ClienteDtos {
    public record ClienteRequestDto(@NotBlank String nombre, String nifCif, String telefono, String email) {}
    public record ClienteResponseDto(Long id, String nombre, String nifCif, String telefono, String email) {}
}
