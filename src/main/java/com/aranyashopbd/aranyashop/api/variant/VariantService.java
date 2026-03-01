package com.aranyashopbd.aranyashop.api.variant;

import com.aranyashopbd.aranyashop.api.product.Product;
import com.aranyashopbd.aranyashop.api.product.ProductRepository;
import com.aranyashopbd.aranyashop.api.variant.VariantDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VariantService {

    private final VariantRepository variantRepo;
    private final ProductRepository productRepo;

    // ── List ──────────────────────────────────────────────────────────────────
    public List<VariantResponse> findAll(Long productId) {
        requireProduct(productId);
        return variantRepo.findAllByProductIdOrderByIdAsc(productId)
                .stream().map(VariantResponse::from).toList();
    }

    // ── Create ────────────────────────────────────────────────────────────────
    @Transactional
    public VariantResponse create(Long productId, CreateVariantRequest req) {
        Product product = requireProduct(productId);

        // Check (product_id, color, size) uniqueness
        String color = normalise(req.color());
        String size  = normalise(req.size());
        if (variantRepo.existsByProductIdAndColorAndSize(productId, color, size)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A variant with this color/size combination already exists for this product");
        }

        String sku = resolveSku(req.sku(), productId, color, size);

        ProductVariant v = new ProductVariant();
        v.setProduct(product);
        v.setSku(sku);
        v.setColor(color);
        v.setSize(size);
        v.setPricePaisa(req.pricePaisa());
        v.setStockQty(req.stockQty() != null ? req.stockQty() : 0);
        v.setActive(req.active() == null || req.active());

        return VariantResponse.from(variantRepo.save(v));
    }

    // ── Update ────────────────────────────────────────────────────────────────
    @Transactional
    public VariantResponse update(Long productId, Long variantId, UpdateVariantRequest req) {
        requireProduct(productId);
        ProductVariant v = requireVariant(productId, variantId);

        // If color or size changes, check the combination is still unique
        String newColor = req.color() != null ? normalise(req.color()) : v.getColor();
        String newSize  = req.size()  != null ? normalise(req.size())  : v.getSize();

        boolean colorOrSizeChanged =
                !safeEquals(newColor, v.getColor()) || !safeEquals(newSize, v.getSize());

        if (colorOrSizeChanged &&
                variantRepo.existsByProductIdAndColorAndSize(productId, newColor, newSize)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A variant with this color/size combination already exists for this product");
        }

        if (req.sku() != null && !req.sku().isBlank()) {
            String newSku = normaliseSku(req.sku());
            if (!newSku.equals(v.getSku()) && variantRepo.existsBySku(newSku)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "SKU '" + newSku + "' is already in use");
            }
            v.setSku(newSku);
        }

        if (colorOrSizeChanged) {
            v.setColor(newColor);
            v.setSize(newSize);
        }
        if (req.pricePaisa() != null)  v.setPricePaisa(req.pricePaisa());
        if (req.stockQty()   != null)  v.setStockQty(req.stockQty());
        if (req.active()     != null)  v.setActive(req.active());

        return VariantResponse.from(variantRepo.save(v));
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    @Transactional
    public void delete(Long productId, Long variantId) {
        requireProduct(productId);
        ProductVariant v = requireVariant(productId, variantId);
        variantRepo.delete(v);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Product requireProduct(Long productId) {
        return productRepo.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + productId));
    }

    private ProductVariant requireVariant(Long productId, Long variantId) {
        return variantRepo.findByIdAndProductId(variantId, productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Variant not found"));
    }

    /** Normalise color/size: trim and uppercase, null if blank. */
    private String normalise(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim().toUpperCase().replaceAll("\\s+", " ");
    }

    /** Normalise a user-supplied SKU: uppercase, spaces→'-'. */
    private String normaliseSku(String sku) {
        return sku.trim().toUpperCase().replaceAll("\\s+", "-");
    }

    /**
     * Generate a unique SKU if none supplied.
     * Pattern: {productId}-{COLOR}-{SIZE}-{random4}
     * Missing color/size parts are omitted.
     */
    private String resolveSku(String requested, Long productId, String color, String size) {
        if (requested != null && !requested.isBlank()) {
            String sku = normaliseSku(requested);
            if (variantRepo.existsBySku(sku)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "SKU '" + sku + "' is already in use");
            }
            return sku;
        }

        // Auto-generate
        StringBuilder base = new StringBuilder(String.valueOf(productId));
        if (color != null) base.append("-").append(color.replaceAll("\\s+", "-"));
        if (size  != null) base.append("-").append(size.replaceAll("\\s+", "-"));

        String sku;
        do {
            String suffix = UUID.randomUUID().toString().replace("-", "")
                    .substring(0, 4).toUpperCase();
            sku = base + "-" + suffix;
        } while (variantRepo.existsBySku(sku));

        return sku;
    }

    private boolean safeEquals(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}
