package com.app.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "servicios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha;

    private Double horas;
    private Double precioHora;
    private Double totalImporte;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoServicio estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sitio_id", nullable = false)
    private SitioLimpieza sitio;

    @OneToOne(mappedBy = "servicio", cascade = CascadeType.ALL, orphanRemoval = true)
    private FacturaAdjunta facturaAdjunta;

    @Column(name = "ruta_factura")
    private String rutaFactura;
}
