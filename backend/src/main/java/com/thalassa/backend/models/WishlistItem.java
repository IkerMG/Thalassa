package com.thalassa.backend.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wishlist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(nullable = false)
    private Double price;

    @Column(name = "img_url", length = 500)
    private String imgUrl;

    @Column(name = "product_url", nullable = false, length = 500)
    private String productUrl;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Enumerated(EnumType.STRING)
    @Column
    private WishlistCategory category;

    @Enumerated(EnumType.STRING)
    @Column
    @Builder.Default
    private WishlistPriority priority = WishlistPriority.MEDIUM;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-wishlist")
    private User user;
}
