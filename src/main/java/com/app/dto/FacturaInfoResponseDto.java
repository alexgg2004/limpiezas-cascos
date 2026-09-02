package com.app.dto;

import java.time.LocalDateTime;

public record FacturaInfoResponseDto(
        Long id,
        String nombreOriginal,
        Long tamanoBytes,
        LocalDateTime fechaSubida
) {}
