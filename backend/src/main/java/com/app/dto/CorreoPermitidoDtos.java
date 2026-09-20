package com.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class CorreoPermitidoDtos {
    public record CorreoPermitidoRequestDto(@NotBlank @Email String email) {}
    public record CorreoPermitidoResponseDto(Long id, String email, LocalDateTime fechaAlta) {}
}
