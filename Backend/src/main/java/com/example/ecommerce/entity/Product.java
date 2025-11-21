package com.example.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String name;

    @Size(max = 2000)
    @Column(length = 2000)
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @NotNull(message = "Stock quantity is required")
    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(length = 500)
    private String image;

    // Multiple images stored as comma-separated URLs
    @Column(length = 2000)
    private String images;

    @Column(length = 100)
    private String brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // Calculated average rating
    @Column(precision = 2, scale = 1)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Boolean featured = false; // For featured products section

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Review> reviews = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Helper to get images as list
    public List<String> getImagesList() {
        if (images == null || images.isEmpty()) {
            return image != null ? List.of(image) : new ArrayList<>();
        }
        return List.of(images.split(","));
    }

    // Helper to calculate discount percentage
    public Integer getDiscountPercentage() {
        if (originalPrice != null && originalPrice.compareTo(price) > 0) {
            BigDecimal discount = originalPrice.subtract(price);
            return discount.multiply(BigDecimal.valueOf(100))
                    .divide(originalPrice, 0, java.math.RoundingMode.HALF_UP)
                    .intValue();
        }
        return 0;
    }

    public void setAverageRating(BigDecimal rating) { // ← Added
        this.averageRating = rating;
    }

    public void setReviewCount(Integer count) { // ← Added
        this.reviewCount = count;
    }

    public BigDecimal getOriginalPrice() { // ← Added for clarity
        return originalPrice;
    }

    public BigDecimal getAverageRating() { // ← Added for clarity
        return averageRating;
    }
}