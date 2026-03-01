package com.aranyashopbd.aranyashop.api.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryDtos {

    public record CreateCategoryRequest(
            @NotBlank(message = "Name is required")
            @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
            String name
    ) {}

    public record UpdateCategoryRequest(
            @Size(min = 2, max = 120, message = "Name must be between 2 and 120 characters")
            String name,
            Boolean active
    ) {}

    public record CategoryResponse(
            Long id,
            String name,
            String slug,
            boolean active
    ) {
        public static CategoryResponse from(Category c) {
            return new CategoryResponse(c.getId(), c.getName(), c.getSlug(), c.isActive());
        }
    }
}
