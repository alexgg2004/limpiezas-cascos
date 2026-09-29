package com.app.repository;

import com.app.model.SitioLimpieza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SitioLimpiezaRepository extends JpaRepository<SitioLimpieza, Long> {
    List<SitioLimpieza> findAllByClienteId(Long clienteId);
}
