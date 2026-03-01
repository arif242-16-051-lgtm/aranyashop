package com.aranyashopbd.aranyashop.api.variant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class VariantDtos {

    // ── Response ──────────────────────────────────────────────────────────────
    public record VariantResponse(
            Long    id,
            Long    productId,
            String  sku,
            String  color,
            String  size,
            int     pricePaisa,
            int     stockQty,
            boolean active
    ) {
        public static VariantResponse from(ProductVariant v) {
            return new VariantResponse(
                    v.getId(),
                    v.getProduct().getId(),
                    v.getSku(),
                    v.getColor(),
                    v.getSize(),
                    v.getPricePaisa(),
                    v.getStockQty(),
                    v.isActive()
            );
        }
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public record CreateVariantRequest(
            String sku,        // optional — auto-generated if blank
            String color,
            String size,

            @NotNull(message = "pricePaisa is required")
            @Min(value = 0, message = "pricePaisa must be >= 0")
            Integer pricePaisa,

            @Min(value = 0, message = "stockQty must be >= 0")
            Integer stockQty,

            Boolean active
    ) {}

    // ── Update ────────────────────────────────────────────────────────────────
    public record UpdateVariantRequest(
            String  sku,
            String  color,
            String  size,

            @Min(value = 0, message = "pricePaisa must be >= 0")
            Integer pricePaisa,

            @Min(value = 0, message = "stockQty must be >= 0")
            Integer stockQty,

            Boolean active
    ) {}
}
