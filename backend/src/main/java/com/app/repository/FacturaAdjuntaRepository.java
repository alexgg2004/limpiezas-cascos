package com.app.repository;

import com.app.model.FacturaAdjunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaAdjuntaRepository extends JpaRepository<FacturaAdjunta, Long> {
    List<FacturaAdjunta> findAllByServicioIdOrderByFechaSubidaDesc(Long servicioId);
    Optional<FacturaAdjunta> findByIdAndServicioId(Long id, Long servicioId);
}
