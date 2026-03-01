package com.aranyashopbd.aranyashop.api.variant;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findAllByProductIdOrderByIdAsc(Long productId);

    boolean existsBySku(String sku);

    boolean existsByProductIdAndColorAndSize(Long productId, String color, String size);

    Optional<ProductVariant> findByIdAndProductId(Long id, Long productId);
}
