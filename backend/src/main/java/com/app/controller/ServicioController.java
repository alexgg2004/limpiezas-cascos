package com.app.controller;

import com.app.dto.ServicioDtos;
import com.app.model.Usuario;
import com.app.service.ServicioService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioService servicioService;

    public ServicioController(ServicioService servicioService) {
        this.servicioService = servicioService;
    }

    /**
     * 1. Crear un nuevo parte de servicio
     * POST /api/servicios
     */
    @PostMapping
    public ResponseEntity<ServicioDtos.ServicioResponseDto> crearServicio(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody ServicioDtos.ServicioRequestDto requestDto
    ) {
        ServicioDtos.ServicioResponseDto nuevoServicio = servicioService.crearServicio(usuario, requestDto);
        return ResponseEntity.ok(nuevoServicio);
    }

    /**
     * 2. Listar servicios con filtros opcionales por cliente y rango de fechas
     * GET /api/servicios?clienteId=1&fechaInicio=2026-08-01&fechaFin=2026-08-31
     */
    @GetMapping
    public ResponseEntity<List<ServicioDtos.ServicioResponseDto>> listarServicios(
            @AuthenticationPrincipal Usuario usuario,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false, defaultValue = "false") Boolean cercaniaFecha,
            @RequestParam(required = false, defaultValue = "false") Boolean soloFuturos
    ) {
        List<ServicioDtos.ServicioResponseDto> servicios = servicioService.obtenerServiciosFiltrados(
                usuario,
                clienteId,
                estado,
                fechaInicio,
                fechaFin,
                cercaniaFecha,
                soloFuturos
        );
        return ResponseEntity.ok(servicios);
    }

    /**
     * 3. Obtener el detalle de un servicio por su ID
     * GET /api/servicios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServicioDtos.ServicioResponseDto> obtenerPorId(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id
    ) {
        ServicioDtos.ServicioResponseDto servicio = servicioService.obtenerPorId(usuario, id);
        return ResponseEntity.ok(servicio);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicioDtos.ServicioResponseDto> actualizarServicio(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id,
            @Valid @RequestBody ServicioDtos.ServicioRequestDto requestDto
    ) {
        ServicioDtos.ServicioResponseDto servicioActualizado = servicioService.actualizarServicio(usuario, id, requestDto);
        return ResponseEntity.ok(servicioActualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarServicio(
            @AuthenticationPrincipal Usuario usuario,
            @PathVariable Long id
    ) {
        servicioService.eliminarServicio(usuario, id);
        return ResponseEntity.noContent().build();
    }
}
