package com.app.service;

import com.app.dto.ServicioDtos;
import com.app.dto.UsuarioDtos;
import com.app.model.EstadoServicio;
import com.app.model.Servicio;
import com.app.model.SitioLimpieza;
import com.app.model.Usuario;
import com.app.repository.ServicioRepository;
import com.app.repository.SitioLimpiezaRepository;
import com.app.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ServicioService {

    private final ServicioRepository servicioRepository;
    private final SitioLimpiezaRepository sitioRepository;
    private final UsuarioRepository usuarioRepository;
    private final Path directorioSubidas;

    public ServicioService(
            ServicioRepository servicioRepository,
            SitioLimpiezaRepository sitioRepository,
            UsuarioRepository usuarioRepository,
            @Value("${app.upload.dir:uploads/facturas}") String uploadDir
    ) {
        this.servicioRepository = servicioRepository;
        this.sitioRepository = sitioRepository;
        this.usuarioRepository = usuarioRepository;
        this.directorioSubidas = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.directorioSubidas);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo crear el directorio de subidas", e);
        }
    }

    @Transactional
    public ServicioDtos.ServicioResponseDto crearServicio(Usuario usuario, ServicioDtos.ServicioRequestDto dto) {
        SitioLimpieza sitio = sitioRepository.findById(dto.sitioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sitio no encontrado"));

        Servicio servicio = new Servicio();
        servicio.setFecha(dto.fecha());
        servicio.setHoras(dto.horas());
        servicio.setPrecioHora(dto.precioHora());
        servicio.setObservaciones(dto.observaciones());
        servicio.setEstado(dto.estado());
        servicio.setSitio(sitio);
        servicio.setAsignados(resolverAsignados(dto.asignadosIds()));

        Servicio guardado = servicioRepository.save(servicio);
        return convertirAResponseDto(guardado);
    }

    /** Todos los usuarios autenticados ven todos los servicios: no hay filtro por propietario. */
    public List<ServicioDtos.ServicioResponseDto> obtenerServiciosFiltrados(
            Usuario usuario,
            Long clienteId,
            String estadoStr,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            Boolean cercaniaFecha,
            Boolean soloFuturos
    ) {
        EstadoServicio estadoEnum = null;
        if (estadoStr != null && !estadoStr.trim().isEmpty()) {
            try {
                estadoEnum = EstadoServicio.valueOf(estadoStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Estado no válido: '" + estadoStr + "'. Valores permitidos: " + Arrays.toString(EstadoServicio.values())
                );
            }
        }

        List<Servicio> resultadoBd = servicioRepository.filtrarServicios(
                clienteId,
                estadoEnum,
                fechaInicio,
                fechaFin
        );

        List<Servicio> servicios = new ArrayList<>(resultadoBd);
        LocalDate hoy = LocalDate.now();

        if (Boolean.TRUE.equals(soloFuturos)) {
            servicios.removeIf(s -> s.getFecha() != null && s.getFecha().isBefore(hoy));
        }

        if (Boolean.TRUE.equals(cercaniaFecha)) {
            servicios.sort(Comparator.comparingLong(s ->
                    s.getFecha() != null ? Math.abs(ChronoUnit.DAYS.between(hoy, s.getFecha())) : Long.MAX_VALUE
            ));
        } else {
            servicios.sort(Comparator.comparing(Servicio::getFecha, Comparator.nullsLast(Comparator.naturalOrder())));
        }

        return servicios.stream()
                .map(this::convertirAResponseDto)
                .collect(Collectors.toList());
    }

    public ServicioDtos.ServicioResponseDto obtenerPorId(Usuario usuario, Long id) {
        Servicio s = obtenerServicioOr404(id);
        return convertirAResponseDto(s);
    }

    @Transactional
    public ServicioDtos.ServicioResponseDto actualizarServicio(Usuario usuario, Long id, ServicioDtos.ServicioRequestDto dto) {
        Servicio servicio = obtenerServicioOr404(id);

        if (!servicio.getSitio().getId().equals(dto.sitioId())) {
            SitioLimpieza nuevoSitio = sitioRepository.findById(dto.sitioId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "El nuevo sitio no existe"));
            servicio.setSitio(nuevoSitio);
        }

        Double horas = dto.horas() != null ? dto.horas() : 0.0;
        Double precioHora = dto.precioHora() != null ? dto.precioHora() : 0.0;

        servicio.setFecha(dto.fecha());
        servicio.setHoras(horas);
        servicio.setPrecioHora(precioHora);
        servicio.setTotalImporte(horas * precioHora);
        servicio.setObservaciones(dto.observaciones());
        servicio.setEstado(dto.estado());
        servicio.setAsignados(resolverAsignados(dto.asignadosIds()));

        Servicio actualizado = servicioRepository.save(servicio);
        return convertirAResponseDto(actualizado);
    }

    @Transactional
    public void subirFactura(Usuario usuario, Long servicioId, MultipartFile archivo) {
        if (archivo.isEmpty()) {
            throw new RuntimeException("El archivo está vacío");
        }

        Servicio servicio = obtenerServicioOr404(servicioId);

        try {
            String extension = ".pdf";
            String nombreUnico = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
            Path destino = this.directorioSubidas.resolve(nombreUnico);

            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

            servicio.setRutaFactura(destino.toString());
            servicioRepository.save(servicio);
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo en disco", e);
        }
    }

    public Resource descargarFactura(Usuario usuario, Long servicioId) {
        Servicio servicio = obtenerServicioOr404(servicioId);

        if (servicio.getRutaFactura() == null) {
            throw new RuntimeException("Este servicio no tiene una factura adjunta");
        }

        try {
            Path rutaArchivo = Paths.get(servicio.getRutaFactura());
            Resource recurso = new UrlResource(rutaArchivo.toUri());

            if (recurso.exists() && recurso.isReadable()) {
                return recurso;
            } else {
                throw new RuntimeException("El archivo no existe o no se puede leer");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Ruta de archivo no válida", e);
        }
    }

    @Transactional
    public void eliminarServicio(Usuario usuario, Long servicioId) {
        Servicio servicio = obtenerServicioOr404(servicioId);
        servicioRepository.delete(servicio);
    }

    /** Todos los usuarios autenticados pueden ver/editar cualquier servicio: solo se valida que exista. */
    private Servicio obtenerServicioOr404(Long servicioId) {
        return servicioRepository.findById(servicioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servicio no encontrado"));
    }

    private Set<Usuario> resolverAsignados(List<Long> asignadosIds) {
        if (asignadosIds == null || asignadosIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Usuario> encontrados = usuarioRepository.findAllById(asignadosIds);
        if (encontrados.size() != new HashSet<>(asignadosIds).size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uno o más usuarios asignados no existen");
        }
        return new HashSet<>(encontrados);
    }

    private ServicioDtos.ServicioResponseDto convertirAResponseDto(Servicio s) {
        Double horas = s.getHoras() != null ? s.getHoras() : 0.0;
        Double precioHora = s.getPrecioHora() != null ? s.getPrecioHora() : 0.0;
        Double total = horas * precioHora;

        List<UsuarioDtos.UsuarioResumenDto> asignados = s.getAsignados().stream()
                .sorted(Comparator.comparing(Usuario::getNombreCompleto, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(u -> new UsuarioDtos.UsuarioResumenDto(u.getId(), u.getNombreCompleto(), u.getEmail()))
                .toList();

        return new ServicioDtos.ServicioResponseDto(
                s.getId(),
                s.getFecha(),
                s.getHoras(),
                s.getPrecioHora(),
                total,
                s.getObservaciones(),
                s.getEstado(),
                s.getSitio().getId(),
                s.getSitio().getNombreDescriptivo(),
                s.getFacturaAdjunta() != null,
                asignados
        );
    }
}
