package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.ErrorResponse;
import com.thalassa.backend.dto.UploadResponse;
import com.thalassa.backend.services.CloudinaryService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

  private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
  private static final List<String> VALID_FOLDERS =
      List.of("livestock", "equipment", "wishlist", "avatars");

  private final CloudinaryService cloudinaryService;

  public UploadController(CloudinaryService cloudinaryService) {
    this.cloudinaryService = cloudinaryService;
  }

  /**
   * POST /api/upload Sube una imagen a Cloudinary y devuelve su URL segura. Requiere usuario
   * autenticado (JWT).
   *
   * @param file imagen a subir (JPEG / PNG / WebP, máx. 5 MB)
   * @param folder carpeta destino: livestock | equipment | wishlist | avatars
   */
  @PostMapping(consumes = "multipart/form-data")
  public ResponseEntity<?> uploadImage(
      @RequestParam("file") MultipartFile file, @RequestParam("folder") String folder) {

    if (!VALID_FOLDERS.contains(folder)) {
      return ResponseEntity.badRequest()
          .body(error("Carpeta no válida. Opciones: " + VALID_FOLDERS));
    }
    if (file == null || file.isEmpty()) {
      return ResponseEntity.badRequest().body(error("El archivo está vacío"));
    }
    if (file.getSize() > MAX_FILE_SIZE) {
      return ResponseEntity.badRequest().body(error("El archivo supera el límite de 5 MB"));
    }
    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
      return ResponseEntity.badRequest()
          .body(error("Tipo de archivo no permitido. Se aceptan: JPEG, PNG, WebP"));
    }

    String url = cloudinaryService.uploadFile(file, folder);
    return ResponseEntity.ok(UploadResponse.builder().url(url).build());
  }

  private ErrorResponse error(String message) {
    return ErrorResponse.builder().message(message).timestamp(LocalDateTime.now()).build();
  }
}
