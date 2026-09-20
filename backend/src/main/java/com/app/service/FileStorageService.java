package com.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads/facturas}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar la carpeta de almacenamiento de archivos", e);
        }
    }

    public String guardarArchivo(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("El archivo subido está vacío");
        }

        String nombreOriginal = file.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }

        String nombreUnico = UUID.randomUUID().toString() + extension;
        Path destino = this.rootLocation.resolve(nombreUnico);
        Files.copy(file.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        return nombreUnico;
    }

    public Resource cargarArchivo(String nombreGuardado) {
        try {
            Path file = rootLocation.resolve(nombreGuardado);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("No se pudo leer el archivo: " + nombreGuardado);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("URL del archivo no válida", e);
        }
    }

    public void eliminarArchivo(String nombreGuardado) {
        try {
            Path file = rootLocation.resolve(nombreGuardado);
            Files.deleteIfExists(file);
        } catch (IOException ignored) {}
    }
}
