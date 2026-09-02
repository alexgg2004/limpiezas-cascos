package com.app.service;

import com.app.dto.SitioLimpiezaDtos;
import com.app.model.SitioLimpieza;
import com.app.model.Cliente;
import com.app.model.Usuario;
import com.app.repository.SitioLimpiezaRepository;
import com.app.repository.ClienteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SitioLimpiezaService {

    private final SitioLimpiezaRepository sitioRepo;
    private final ClienteRepository clienteRepo;

    public SitioLimpiezaService(SitioLimpiezaRepository sitioRepo, ClienteRepository clienteRepo) {
        this.sitioRepo = sitioRepo;
        this.clienteRepo = clienteRepo;
    }

    public SitioLimpiezaDtos.SitioLimpiezaResponseDto obtenerPorId(Usuario usuario, Long id) {
        SitioLimpieza sitio = obtenerSitioVerificado(usuario, id);
        return convertirAResponseDto(sitio);
    }

    @Transactional
    public SitioLimpiezaDtos.SitioLimpiezaResponseDto actualizarSitio(Usuario usuario, Long id, SitioLimpiezaDtos.SitioLimpiezaRequestDto dto) {
        SitioLimpieza sitio = obtenerSitioVerificado(usuario, id);

        // Si cambia el cliente asignado, comprobar pertenencia
        if (!sitio.getCliente().getId().equals(dto.clienteId())) {
            Cliente nuevoCliente = clienteRepo.findById(dto.clienteId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

            if (!nuevoCliente.getUsuario().getId().equals(usuario.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes acceso a este cliente");
            }
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

    private SitioLimpieza obtenerSitioVerificado(Usuario usuario, Long id) {
        SitioLimpieza sitio = sitioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sitio no encontrado"));

        if (!sitio.getCliente().getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso no autorizado al sitio");
        }
        return sitio;
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
