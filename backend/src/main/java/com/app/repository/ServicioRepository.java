package com.app.repository;

import com.app.model.EstadoServicio;
import com.app.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    @Query("SELECT s FROM Servicio s " +
            "WHERE (:clienteId IS NULL OR s.sitio.cliente.id = :clienteId) " +
            "AND (:estado IS NULL OR s.estado = :estado) " +
            "AND (CAST(:fechaInicio AS date) IS NULL OR s.fecha >= :fechaInicio) " +
            "AND (CAST(:fechaFin AS date) IS NULL OR s.fecha <= :fechaFin) " +
            "ORDER BY s.fecha ASC")
    List<Servicio> filtrarServicios(
            @Param("clienteId") Long clienteId,
            @Param("estado") EstadoServicio estado,
            @Param("fechaInicio") LocalDate fechaInicio,
            @Param("fechaFin") LocalDate fechaFin
    );

    boolean existsBySitioId(Long sitioId);
}
