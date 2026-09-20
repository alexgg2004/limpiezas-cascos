package com.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SitioLimpiezaDtos {
    public record SitioLimpiezaRequestDto(
            @NotBlank(message = "El nombre descriptivo es obligatorio")
            String nombreDescriptivo,
            String direccion,
            String codigoPostal,
            String ciudad,
            @NotNull(message = "La latitud es obligatoria") Double latitud,
            @NotNull(message = "La longitud es obligatoria") Double longitud,
            String instruccionesAcceso,
            @NotNull(message = "El cliente asociado es obligatorio")
            Long clienteId
    ) {}

    public record SitioLimpiezaResponseDto(
            Long id,
            String nombreDescriptivo,
            String direccion,
            String codigoPostal,
            String ciudad,
            Double latitud,
            Double longitud,
            String instruccionesAcceso,
            Long clienteId,
            String nombreCliente
    ) {}
}
