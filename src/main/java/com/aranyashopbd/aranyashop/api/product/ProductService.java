package com.aranyashopbd.aranyashop.api.product;

import com.aranyashopbd.aranyashop.api.category.Category;
import com.aranyashopbd.aranyashop.api.category.CategoryRepository;
import com.aranyashopbd.aranyashop.api.product.ProductDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final CategoryRepository categoryRepo;

    // ── List ──────────────────────────────────────────────────────────────────
    public List<ProductResponse> findAll(String q, Boolean active, Long categoryId) {
        String normalizedQ = (q != null && !q.isBlank()) ? q.trim() : null;
        return productRepo.search(normalizedQ, active, categoryId)
                .stream()
                .map(ProductResponse::from)
                .toList();
    }

    // ── Get one ───────────────────────────────────────────────────────────────
    public ProductResponse findById(Long id) {
        return ProductResponse.from(findOrThrow(id));
    }

    // ── Create ────────────────────────────────────────────────────────────────
    @Transactional
    public ProductResponse create(CreateProductRequest req) {
        Category category = findCategoryOrThrow(req.categoryId());

        Product p = new Product();
        p.setTitle(req.title().trim());
        p.setDescription(req.description());
        p.setActive(req.active() == null || req.active());
        p.setShippingClass(req.shippingClass() != null ? req.shippingClass() : ShippingClass.STANDARD);
        p.setCategory(category);

        return ProductResponse.from(productRepo.save(p));
    }

    // ── Update ────────────────────────────────────────────────────────────────
    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest req) {
        Product p = findOrThrow(id);

        if (req.title() != null && !req.title().isBlank()) {
            p.setTitle(req.title().trim());
        }
        if (req.description() != null) {
            p.setDescription(req.description());
        }
        if (req.active() != null) {
            p.setActive(req.active());
        }
        if (req.shippingClass() != null) {
            p.setShippingClass(req.shippingClass());
        }
        if (req.categoryId() != null) {
            p.setCategory(findCategoryOrThrow(req.categoryId()));
        }

        return ProductResponse.from(productRepo.save(p));
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    @Transactional
    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepo.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Product findOrThrow(Long id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + categoryId));
    }
}
