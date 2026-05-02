package com.thalassa.backend.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

  /**
   * Stub de envío de email. En dev loguea el link de reseteo. TODO: conectar SMTP en producción
   * (JavaMailSender / SendGrid / SES).
   */
  public void sendPasswordResetEmail(String toEmail, String plainToken) {
    String resetLink = "https://thalassa.app/reset-password?token=" + plainToken;
    log.info("PASSWORD RESET → {} | Link: {}", toEmail, resetLink);
  }
}
