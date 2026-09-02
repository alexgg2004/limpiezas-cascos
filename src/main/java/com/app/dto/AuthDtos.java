package com.app.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record RegisterRequest(@NotBlank @Email String email, @NotBlank String password, String nombreCompleto, String nifCif) {}
    public record AuthResponse(String token, String email, String nombreCompleto) {}
}
