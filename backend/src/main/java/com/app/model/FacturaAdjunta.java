package com.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "facturas_adjuntas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacturaAdjunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreOriginal;
    private String nombreGuardado;
    private String tipoContenido;
    private Long tamanoBytes;

    @Builder.Default
    private LocalDateTime fechaSubida = LocalDateTime.now();

    /** Varias facturas pueden pertenecer al mismo servicio. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servicio_id", nullable = false)
    private Servicio servicio;
}
