package com.thalassa.backend.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_plan", nullable = false)
    @Builder.Default
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.FREE;

    @Column(name = "electricity_price_kwh")
    private Double electricityPriceKwh;

    // ── i18n / display preferences (Master Plan §10.6) ───────────────────────

    @Column(length = 5)
    @Builder.Default
    private String locale = "en";

    @Column(name = "temperature_unit", length = 1)
    @Builder.Default
    private String temperatureUnit = "C";

    @Column(name = "volume_unit", length = 3)
    @Builder.Default
    private String volumeUnit = "L";

    // ── Chat rate-limiting ────────────────────────────────────────────────────

    @Column(name = "chat_count_today", nullable = false)
    @Builder.Default
    private Integer chatCountToday = 0;

    @Column(name = "last_chat_date")
    private LocalDate lastChatDate;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-aquariums")
    @Builder.Default
    private List<Aquarium> aquariums = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-wishlist")
    @Builder.Default
    private List<WishlistItem> wishlistItems = new ArrayList<>();

    // ── UserDetails ──────────────────────────────────────────────────────────

    /**
     * Spring Security uses getUsername() as the principal identifier.
     * We use email as the login key, so this must return email, not the display username.
     * NOTE: Lombok's getter for the 'username' field is suppressed by this override.
     *       Use getDisplayUsername() to access the display name.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /** Returns the human-readable display name (the 'username' DB column). */
    public String getDisplayUsername() {
        return username;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + subscriptionPlan.name()));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
