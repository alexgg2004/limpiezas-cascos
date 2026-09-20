package com.app.dto;

import com.app.model.EstadoServicio;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class ServicioDtos {
    public record ServicioRequestDto(
            @NotNull LocalDate fecha,
            Double horas,
            Double precioHora,
            String observaciones,
            @NotNull EstadoServicio estado,
            @NotNull Long sitioId,
            List<Long> asignadosIds
    ) {}

    public record ServicioResponseDto(
            Long id,
            LocalDate fecha,
            Double horas,
            Double precioHora,
            Double totalImporte,
            String observaciones,
            EstadoServicio estado,
            Long sitioId,
            String nombreSitio,
            boolean tieneFacturaAdjunta,
            List<UsuarioDtos.UsuarioResumenDto> asignados
    ) {}
}
