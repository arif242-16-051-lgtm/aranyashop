package com.aranyashopbd.aranyashop.api.product;

import com.aranyashopbd.aranyashop.api.category.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProductDtos {

    // ── Embedded category summary inside ProductResponse ──────────────────────
    public record CategorySummary(Long id, String name, String slug) {
        public static CategorySummary from(Category c) {
            return new CategorySummary(c.getId(), c.getName(), c.getSlug());
        }
    }

    // ── Response ──────────────────────────────────────────────────────────────
    public record ProductResponse(
            Long id,
            String title,
            String description,
            boolean active,
            ShippingClass shippingClass,
            CategorySummary category
    ) {
        public static ProductResponse from(Product p) {
            return new ProductResponse(
                    p.getId(),
                    p.getTitle(),
                    p.getDescription(),
                    p.isActive(),
                    p.getShippingClass(),
                    CategorySummary.from(p.getCategory())
            );
        }
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public record CreateProductRequest(
            @NotBlank(message = "Title is required")
            @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
            String title,

            String description,

            Boolean active,

            ShippingClass shippingClass,

            @NotNull(message = "categoryId is required")
            Long categoryId
    ) {}

    // ── Update ────────────────────────────────────────────────────────────────
    public record UpdateProductRequest(
            @Size(min = 2, max = 200, message = "Title must be between 2 and 200 characters")
            String title,

            String description,

            Boolean active,

            ShippingClass shippingClass,

            Long categoryId
    ) {}
}
