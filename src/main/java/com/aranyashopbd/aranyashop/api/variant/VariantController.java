package com.aranyashopbd.aranyashop.api.variant;

import com.aranyashopbd.aranyashop.api.variant.VariantDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products/{productId}/variants")
@RequiredArgsConstructor
public class VariantController {

    private final VariantService service;

    @GetMapping
    public List<VariantResponse> list(@PathVariable Long productId) {
        return service.findAll(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VariantResponse create(@PathVariable Long productId,
                                  @Valid @RequestBody CreateVariantRequest req) {
        return service.create(productId, req);
    }

    @PutMapping("/{variantId}")
    public VariantResponse update(@PathVariable Long productId,
                                  @PathVariable Long variantId,
                                  @Valid @RequestBody UpdateVariantRequest req) {
        return service.update(productId, variantId, req);
    }

    @DeleteMapping("/{variantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long productId,
                       @PathVariable Long variantId) {
        service.delete(productId, variantId);
    }
}
