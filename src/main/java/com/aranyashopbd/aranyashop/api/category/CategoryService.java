package com.aranyashopbd.aranyashop.api.category;

import com.aranyashopbd.aranyashop.api.category.CategoryDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repo;

    public List<CategoryResponse> findAll() {
        return repo.findAllByOrderByNameAsc()
                .stream()
                .map(CategoryResponse::from)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CreateCategoryRequest req) {
        if (repo.existsByNameIgnoreCase(req.name())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Category with name '" + req.name() + "' already exists");
        }

        Category cat = new Category();
        cat.setName(req.name().trim());
        cat.setSlug(generateUniqueSlug(req.name()));
        cat.setActive(true);
        return CategoryResponse.from(repo.save(cat));
    }

    @Transactional
    public CategoryResponse update(Long id, UpdateCategoryRequest req) {
        Category cat = findOrThrow(id);

        if (req.name() != null && !req.name().isBlank()) {
            String trimmed = req.name().trim();
            // Allow keeping the same name
            if (!trimmed.equalsIgnoreCase(cat.getName()) && repo.existsByNameIgnoreCase(trimmed)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Category with name '" + trimmed + "' already exists");
            }
            cat.setName(trimmed);
            cat.setSlug(generateUniqueSlug(trimmed, cat.getId()));
        }

        if (req.active() != null) {
            cat.setActive(req.active());
        }

        return CategoryResponse.from(repo.save(cat));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
        repo.deleteById(id);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Category findOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found"));
    }

    /**
     * Converts a name to a URL-safe slug, then ensures uniqueness.
     * Example: "Fresh Fruits" → "fresh-fruits", "fresh-fruits-2", etc.
     */
    String generateUniqueSlug(String name) {
        return generateUniqueSlug(name, null);
    }

    String generateUniqueSlug(String name, Long excludeId) {
        String base = name.toLowerCase().trim()
                .replaceAll("[\\s_]+", "-")
                .replaceAll("[^a-z0-9\\-]", "")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");

        String slug = base;
        int counter = 2;

        while (slugTakenByOther(slug, excludeId)) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private boolean slugTakenByOther(String slug, Long excludeId) {
        return repo.findBySlug(slug)
                .map(c -> !c.getId().equals(excludeId))
                .orElse(false);
    }
}
