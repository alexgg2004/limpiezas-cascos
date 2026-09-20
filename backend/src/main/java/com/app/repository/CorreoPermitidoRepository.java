package com.app.repository;

import com.app.model.CorreoPermitido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CorreoPermitidoRepository extends JpaRepository<CorreoPermitido, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<CorreoPermitido> findByEmailIgnoreCase(String email);
    List<CorreoPermitido> findAllByOrderByFechaAltaAsc();
}
