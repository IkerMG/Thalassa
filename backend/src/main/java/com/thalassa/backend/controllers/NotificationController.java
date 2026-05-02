package com.thalassa.backend.controllers;

import com.thalassa.backend.dto.NotificationResponse;
import com.thalassa.backend.dto.NotificationType;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

  /** GET /api/notifications — stub: returns mock notifications for the authenticated user. */
  @GetMapping
  public ResponseEntity<List<NotificationResponse>> getNotifications() {
    List<NotificationResponse> notifications =
        List.of(
            NotificationResponse.builder()
                .id(1L)
                .title("Water parameters logged")
                .message("pH reading of 8.2 recorded for Reef Tank #1.")
                .type(NotificationType.SUCCESS)
                .read(false)
                .createdAt(OffsetDateTime.now().minusMinutes(10))
                .build(),
            NotificationResponse.builder()
                .id(2L)
                .title("Low alkalinity warning")
                .message("Alkalinity dropped below 7 dKH in Nano Reef.")
                .type(NotificationType.WARNING)
                .read(false)
                .createdAt(OffsetDateTime.now().minusHours(2))
                .build(),
            NotificationResponse.builder()
                .id(3L)
                .title("New species added")
                .message("Amphiprion ocellaris added to your livestock list.")
                .type(NotificationType.INFO)
                .read(true)
                .createdAt(OffsetDateTime.now().minusHours(5))
                .build(),
            NotificationResponse.builder()
                .id(4L)
                .title("Equipment maintenance due")
                .message("Skimmer cleaning scheduled for tomorrow.")
                .type(NotificationType.INFO)
                .read(true)
                .createdAt(OffsetDateTime.now().minusDays(1))
                .build(),
            NotificationResponse.builder()
                .id(5L)
                .title("Scraper updated")
                .message("Species catalog refreshed with 12 new entries.")
                .type(NotificationType.SUCCESS)
                .read(true)
                .createdAt(OffsetDateTime.now().minusDays(2))
                .build());
    return ResponseEntity.ok(notifications);
  }
}
