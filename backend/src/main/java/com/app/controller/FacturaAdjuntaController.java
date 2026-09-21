package com.app.controller;

import com.app.dto.FacturaInfoResponseDto;
import com.app.model.FacturaAdjunta;
import com.app.model.Servicio;
import com.app.repository.FacturaAdjuntaRepository;
import com.app.repository.ServicioRepository;
import com.app.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Facturas adjuntas de un servicio. Un servicio puede tener varias.
 */
@RestController
@RequestMapping("/api/servicios/{servicioId}/facturas")
@RequiredArgsConstructor
public class FacturaAdjuntaController {

    private final FileStorageService storageService;
    private final ServicioRepository servicioRepository;
    private final FacturaAdjuntaRepository facturaRepository;

    @GetMapping
    public ResponseEntity<List<FacturaInfoResponseDto>> listar(@PathVariable Long servicioId) {
        List<FacturaInfoResponseDto> lista = facturaRepository
                .findAllByServicioIdOrderByFechaSubidaDesc(servicioId).stream()
                .map(FacturaAdjuntaController::aDto)
                .toList();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<FacturaInfoResponseDto> subirFactura(
            @PathVariable Long servicioId,
            @RequestParam("archivo") MultipartFile archivo) throws Exception {

        Servicio servicio = servicioRepository.findById(servicioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));

        String nombreGuardado = storageService.guardarArchivo(archivo);

        FacturaAdjunta factura = FacturaAdjunta.builder()
                .nombreOriginal(archivo.getOriginalFilename())
                .nombreGuardado(nombreGuardado)
                .tipoContenido(archivo.getContentType() != null ? archivo.getContentType() : "application/pdf")
                .tamanoBytes(archivo.getSize())
                .servicio(servicio)
                .build();

        FacturaAdjunta guardada = facturaRepository.save(factura);
        return ResponseEntity.ok(aDto(guardada));
    }

    @GetMapping("/{facturaId}")
    public ResponseEntity<Resource> verFactura(@PathVariable Long servicioId, @PathVariable Long facturaId) {
        FacturaAdjunta factura = facturaRepository.findByIdAndServicioId(facturaId, servicioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        Resource resource = storageService.cargarArchivo(factura.getNombreGuardado());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(factura.getTipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + factura.getNombreOriginal() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{facturaId}")
    public ResponseEntity<Void> eliminarFactura(@PathVariable Long servicioId, @PathVariable Long facturaId) {
        FacturaAdjunta factura = facturaRepository.findByIdAndServicioId(facturaId, servicioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura no encontrada"));

        storageService.eliminarArchivo(factura.getNombreGuardado());
        facturaRepository.delete(factura);
        return ResponseEntity.noContent().build();
    }

    private static FacturaInfoResponseDto aDto(FacturaAdjunta f) {
        return new FacturaInfoResponseDto(f.getId(), f.getNombreOriginal(), f.getTamanoBytes(), f.getFechaSubida());
    }
}
