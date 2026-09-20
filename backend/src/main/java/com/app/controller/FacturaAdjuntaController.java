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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class FacturaAdjuntaController {

    private final FileStorageService storageService;
    private final ServicioRepository servicioRepository;
    private final FacturaAdjuntaRepository facturaRepository;

    @PostMapping("/{servicioId}/factura")
    public ResponseEntity<FacturaInfoResponseDto> subirFactura(
            @PathVariable Long servicioId,
            @RequestParam("archivo") MultipartFile archivo) throws Exception {

        Servicio servicio = servicioRepository.findById(servicioId)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        facturaRepository.findByServicioId(servicioId).ifPresent(f -> {
            storageService.eliminarArchivo(f.getNombreGuardado());
            facturaRepository.delete(f);
        });

        String nombreGuardado = storageService.guardarArchivo(archivo);

        FacturaAdjunta factura = FacturaAdjunta.builder()
                .nombreOriginal(archivo.getOriginalFilename())
                .nombreGuardado(nombreGuardado)
                .tipoContenido(archivo.getContentType() != null ? archivo.getContentType() : "application/pdf")
                .tamanoBytes(archivo.getSize())
                .servicio(servicio)
                .build();

        FacturaAdjunta guardada = facturaRepository.save(factura);

        return ResponseEntity.ok(new FacturaInfoResponseDto(
                guardada.getId(), guardada.getNombreOriginal(), guardada.getTamanoBytes(), guardada.getFechaSubida()
        ));
    }

    @GetMapping("/{servicioId}/factura")
    public ResponseEntity<Resource> verFactura(@PathVariable Long servicioId) {
        FacturaAdjunta factura = facturaRepository.findByServicioId(servicioId)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada para este servicio"));

        Resource resource = storageService.cargarArchivo(factura.getNombreGuardado());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(factura.getTipoContenido()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + factura.getNombreOriginal() + "\"")
                .body(resource);
    }
}
