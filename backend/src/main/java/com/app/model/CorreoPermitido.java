package com.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Lista blanca de correos de Google autorizados a iniciar sesión. Se gestiona
 * en base de datos (en vez de una variable de entorno) para poder añadir o
 * quitar gente sin reiniciar el backend.
 */
@Entity
@Table(name = "correos_permitidos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorreoPermitido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaAlta;

    @PrePersist
    void alDarDeAlta() {
        if (fechaAlta == null) {
            fechaAlta = LocalDateTime.now();
        }
    }
}
