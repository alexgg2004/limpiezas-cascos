package com.app.service;

import com.app.dto.ClienteDtos;
import com.app.dto.ServicioDtos;
import com.app.dto.ServicioDtos.ServicioResponseDto;
import com.app.dto.SitioLimpiezaDtos;
import com.app.model.Cliente;
import com.app.model.Servicio;
import com.app.model.SitioLimpieza;
import com.app.model.Usuario;
import com.app.repository.ClienteRepository;
import com.app.repository.ServicioRepository;
import com.app.repository.SitioLimpiezaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GestionService {

    private final ClienteRepository clienteRepo;
    private final SitioLimpiezaRepository sitioRepo;
    private final ServicioRepository servicioRepo;

    // --- CLIENTES ---
    @Transactional(readOnly = true)
    public List<ClienteDtos.ClienteResponseDto> listarClientes(Long usuarioId) {
        return clienteRepo.findAllByUsuarioId(usuarioId).stream()
                .map(c -> new ClienteDtos.ClienteResponseDto(c.getId(), c.getNombre(), c.getNifCif(), c.getTelefono(), c.getEmail()))
                .toList();
    }

    @Transactional
    public ClienteDtos.ClienteResponseDto crearCliente(ClienteDtos.ClienteRequestDto dto, Usuario usuario) {
        Cliente c = Cliente.builder()
                .nombre(dto.nombre())
                .nifCif(dto.nifCif())
                .telefono(dto.telefono())
                .email(dto.email())
                .usuario(usuario)
                .build();
        c = clienteRepo.save(c);
        return new ClienteDtos.ClienteResponseDto(c.getId(), c.getNombre(), c.getNifCif(), c.getTelefono(), c.getEmail());
    }

    // --- SITIOS DE LIMPIEZA ---
    @Transactional(readOnly = true)
    public List<SitioLimpiezaDtos.SitioLimpiezaResponseDto> listarSitios(Long usuarioId) {
        return sitioRepo.findAllByClienteUsuarioId(usuarioId).stream()
                .map(this::mapToSitioDto)
                .toList();
    }

    @Transactional
    public SitioLimpiezaDtos.SitioLimpiezaResponseDto crearSitio(SitioLimpiezaDtos.SitioLimpiezaRequestDto dto) {
        Cliente cliente = clienteRepo.findById(dto.clienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        SitioLimpieza s = SitioLimpieza.builder()
                .nombreDescriptivo(dto.nombreDescriptivo())
                .direccion(dto.direccion())
                .codigoPostal(dto.codigoPostal())
                .ciudad(dto.ciudad())
                .latitud(dto.latitud())
                .longitud(dto.longitud())
                .instruccionesAcceso(dto.instruccionesAcceso())
                .cliente(cliente)
                .build();

        return mapToSitioDto(sitioRepo.save(s));
    }

    // --- SERVICIOS ---
    @Transactional(readOnly = true)
    public List<ServicioResponseDto> listarServicios(Long usuarioId) {
        return servicioRepo.findAllBySitioClienteUsuarioId(usuarioId).stream()
                .map(this::mapToServicioDto)
                .toList();
    }

    @Transactional
    public ServicioResponseDto crearServicio(ServicioDtos.ServicioRequestDto dto) {
        SitioLimpieza sitio = sitioRepo.findById(dto.sitioId())
                .orElseThrow(() -> new RuntimeException("Sitio de limpieza no encontrado"));

        Double total = (dto.horas() != null && dto.precioHora() != null) ? dto.horas() * dto.precioHora() : null;

        Servicio serv = Servicio.builder()
                .fecha(dto.fecha())
                .horas(dto.horas())
                .precioHora(dto.precioHora())
                .totalImporte(total)
                .observaciones(dto.observaciones())
                .estado(dto.estado())
                .sitio(sitio)
                .build();

        return mapToServicioDto(servicioRepo.save(serv));
    }

    private SitioLimpiezaDtos.SitioLimpiezaResponseDto mapToSitioDto(SitioLimpieza s) {
        return new SitioLimpiezaDtos.SitioLimpiezaResponseDto(
                s.getId(), s.getNombreDescriptivo(), s.getDireccion(), s.getCodigoPostal(),
                s.getCiudad(), s.getLatitud(), s.getLongitud(), s.getInstruccionesAcceso(),
                s.getCliente().getId(), s.getCliente().getNombre()
        );
    }

    private ServicioResponseDto mapToServicioDto(Servicio s) {
        return new ServicioResponseDto(
                s.getId(), s.getFecha(), s.getHoras(), s.getPrecioHora(), s.getTotalImporte(),
                s.getObservaciones(), s.getEstado(), s.getSitio().getId(),
                s.getSitio().getNombreDescriptivo(), s.getFacturaAdjunta() != null
        );
    }
}
