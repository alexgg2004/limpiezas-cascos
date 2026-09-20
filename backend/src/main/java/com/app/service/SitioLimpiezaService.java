package com.app.service;

import com.app.dto.SitioLimpiezaDtos;
import com.app.model.SitioLimpieza;
import com.app.model.Cliente;
import com.app.model.Usuario;
import com.app.repository.SitioLimpiezaRepository;
import com.app.repository.ClienteRepository;
import com.app.repository.ServicioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SitioLimpiezaService {

    private final SitioLimpiezaRepository sitioRepo;
    private final ClienteRepository clienteRepo;
    private final ServicioRepository servicioRepo;

    public SitioLimpiezaService(SitioLimpiezaRepository sitioRepo, ClienteRepository clienteRepo, ServicioRepository servicioRepo) {
        this.sitioRepo = sitioRepo;
        this.clienteRepo = clienteRepo;
        this.servicioRepo = servicioRepo;
    }

    public SitioLimpiezaDtos.SitioLimpiezaResponseDto obtenerPorId(Usuario usuario, Long id) {
        SitioLimpieza sitio = obtenerSitioOr404(id);
        return convertirAResponseDto(sitio);
    }

    @Transactional
    public SitioLimpiezaDtos.SitioLimpiezaResponseDto actualizarSitio(Usuario usuario, Long id, SitioLimpiezaDtos.SitioLimpiezaRequestDto dto) {
        SitioLimpieza sitio = obtenerSitioOr404(id);

        if (!sitio.getCliente().getId().equals(dto.clienteId())) {
            Cliente nuevoCliente = clienteRepo.findById(dto.clienteId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
            sitio.setCliente(nuevoCliente);
        }

        sitio.setNombreDescriptivo(dto.nombreDescriptivo());
        sitio.setDireccion(dto.direccion());
        sitio.setCodigoPostal(dto.codigoPostal());
        sitio.setCiudad(dto.ciudad());
        sitio.setLatitud(dto.latitud());
        sitio.setLongitud(dto.longitud());
        sitio.setInstruccionesAcceso(dto.instruccionesAcceso());

        SitioLimpieza guardado = sitioRepo.save(sitio);
        return convertirAResponseDto(guardado);
    }

    @Transactional
    public void eliminarSitio(Long id) {
        SitioLimpieza sitio = obtenerSitioOr404(id);

        if (servicioRepo.existsBySitioId(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede eliminar un sitio con servicios registrados.");
        }

        sitioRepo.delete(sitio);
    }

    /** Todos los usuarios autenticados pueden ver/editar cualquier sitio: solo se valida que exista. */
    private SitioLimpieza obtenerSitioOr404(Long id) {
        return sitioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sitio no encontrado"));
    }

    private SitioLimpiezaDtos.SitioLimpiezaResponseDto convertirAResponseDto(SitioLimpieza s) {
        return new SitioLimpiezaDtos.SitioLimpiezaResponseDto(
                s.getId(),
                s.getNombreDescriptivo(),
                s.getDireccion(),
                s.getCodigoPostal(),
                s.getCiudad(),
                s.getLatitud(),
                s.getLongitud(),
                s.getInstruccionesAcceso(),
                s.getCliente().getId(),
                s.getCliente().getNombre()
        );
    }
}
