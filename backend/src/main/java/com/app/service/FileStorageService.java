package com.app.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

/**
 * Almacena las facturas adjuntas en Backblaze B2 (almacenamiento de objetos
 * compatible con la API de S3), en vez de en disco local: necesario para
 * desplegar en plataformas sin disco persistente y evita perder archivos en
 * cada redeploy. Cualquier otro proveedor compatible con S3 (R2, Supabase
 * Storage...) valdría cambiando solo endpoint/región.
 */
@Service
public class FileStorageService {

    private final S3Client s3;
    private final String bucket;

    /**
     * Si faltan credenciales de B2, s3 queda a null y cada operación falla con
     * un mensaje claro en vez de tumbar el arranque de la app (igual que el
     * login de Google cuando falta su configuración).
     */
    public FileStorageService(
            @Value("${app.b2.endpoint:}") String endpoint,
            @Value("${app.b2.region:}") String region,
            @Value("${app.b2.key-id:}") String keyId,
            @Value("${app.b2.application-key:}") String applicationKey,
            @Value("${app.b2.bucket:facturas}") String bucket
    ) {
        this.bucket = bucket;
        if (endpoint.isBlank() || region.isBlank() || keyId.isBlank() || applicationKey.isBlank()) {
            this.s3 = null;
            return;
        }
        this.s3 = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(keyId, applicationKey)))
                .forcePathStyle(true)
                .build();
    }

    private S3Client s3OrThrow() {
        if (s3 == null) {
            throw new IllegalStateException(
                    "El almacenamiento de facturas (Backblaze B2) no está configurado: faltan B2_ENDPOINT, B2_REGION, B2_KEY_ID o B2_APPLICATION_KEY");
        }
        return s3;
    }

    public String guardarArchivo(MultipartFile file) throws IOException {
        S3Client cliente = s3OrThrow();
        if (file.isEmpty()) {
            throw new RuntimeException("El archivo subido está vacío");
        }

        String nombreOriginal = file.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }

        String nombreUnico = UUID.randomUUID() + extension;

        cliente.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(nombreUnico)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromInputStream(file.getInputStream(), file.getSize())
        );

        return nombreUnico;
    }

    public Resource cargarArchivo(String nombreGuardado) {
        try {
            return new InputStreamResource(s3OrThrow().getObject(
                    GetObjectRequest.builder().bucket(bucket).key(nombreGuardado).build()
            ));
        } catch (NoSuchKeyException e) {
            throw new RuntimeException("No se pudo leer el archivo: " + nombreGuardado, e);
        }
    }

    public void eliminarArchivo(String nombreGuardado) {
        s3OrThrow().deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(nombreGuardado).build());
    }
}
