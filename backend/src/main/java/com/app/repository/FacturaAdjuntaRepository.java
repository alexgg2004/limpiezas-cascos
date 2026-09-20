package com.app.repository;

import com.app.model.FacturaAdjunta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FacturaAdjuntaRepository extends JpaRepository<FacturaAdjunta, Long> {
    Optional<FacturaAdjunta> findByServicioId(Long servicioId);
}
