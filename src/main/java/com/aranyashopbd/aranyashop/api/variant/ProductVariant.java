package com.aranyashopbd.aranyashop.api.variant;

import com.aranyashopbd.aranyashop.api.product.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(
    name = "product_variants",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_variants_sku",               columnNames = "sku"),
        @UniqueConstraint(name = "uq_variants_product_color_size", columnNames = {"product_id", "color", "size"})
    }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true, length = 64)
    private String sku;

    @Column(length = 60)
    private String color;

    @Column(length = 60)
    private String size;

    @Column(nullable = false)
    private int pricePaisa;

    @Column(nullable = false)
    private int stockQty = 0;

    @Column(nullable = false)
    private boolean active = true;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
