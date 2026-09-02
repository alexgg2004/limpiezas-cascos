package com.app.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sitios_limpieza")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SitioLimpieza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombreDescriptivo;

    private String direccion;
    private String codigoPostal;
    private String ciudad;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Column(columnDefinition = "TEXT")
    private String instruccionesAcceso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
}
