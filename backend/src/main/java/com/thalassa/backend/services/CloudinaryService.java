package com.thalassa.backend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CloudinaryService {

  private final Cloudinary cloudinary;

  public CloudinaryService(Cloudinary cloudinary) {
    this.cloudinary = cloudinary;
  }

  @SuppressWarnings("unchecked")
  public String uploadFile(MultipartFile file, String folder) {
    try {
      Map<String, Object> result =
          cloudinary
              .uploader()
              .upload(
                  file.getBytes(),
                  ObjectUtils.asMap(
                      "folder", "thalassa/" + folder,
                      "resource_type", "image"));
      return (String) result.get("secure_url");
    } catch (IOException e) {
      throw new RuntimeException("Error al subir imagen a Cloudinary", e);
    }
  }
}
