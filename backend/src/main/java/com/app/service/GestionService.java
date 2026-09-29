package com.app.service;

import com.app.dto.ClienteDtos;
import com.app.dto.SitioLimpiezaDtos;
import com.app.model.Cliente;
import com.app.model.SitioLimpieza;
import com.app.model.Usuario;
import com.app.repository.ClienteRepository;
import com.app.repository.SitioLimpiezaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GestionService {

    private final ClienteRepository clienteRepo;
    private final SitioLimpiezaRepository sitioRepo;

    // --- CLIENTES ---
    @Transactional(readOnly = true)
    public List<ClienteDtos.ClienteResponseDto> listarClientes() {
        return clienteRepo.findAll().stream()
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

    @Transactional
    public ClienteDtos.ClienteResponseDto actualizarCliente(Long id, ClienteDtos.ClienteRequestDto dto) {
        Cliente c = clienteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        c.setNombre(dto.nombre());
        c.setNifCif(dto.nifCif());
        c.setTelefono(dto.telefono());
        c.setEmail(dto.email());

        c = clienteRepo.save(c);
        return new ClienteDtos.ClienteResponseDto(c.getId(), c.getNombre(), c.getNifCif(), c.getTelefono(), c.getEmail());
    }

    @Transactional
    public void eliminarCliente(Long id) {
        Cliente c = clienteRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (!c.getSitios().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede eliminar un cliente con sitios de limpieza asociados. Elimina antes sus sitios.");
        }

        clienteRepo.delete(c);
    }

    // --- SITIOS DE LIMPIEZA ---
    @Transactional(readOnly = true)
    public List<SitioLimpiezaDtos.SitioLimpiezaResponseDto> listarSitios() {
        return sitioRepo.findAll().stream()
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

    private SitioLimpiezaDtos.SitioLimpiezaResponseDto mapToSitioDto(SitioLimpieza s) {
        return new SitioLimpiezaDtos.SitioLimpiezaResponseDto(
                s.getId(), s.getNombreDescriptivo(), s.getDireccion(), s.getCodigoPostal(),
                s.getCiudad(), s.getLatitud(), s.getLongitud(), s.getInstruccionesAcceso(),
                s.getCliente().getId(), s.getCliente().getNombre()
        );
    }
}
