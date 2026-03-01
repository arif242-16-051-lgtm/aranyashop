package com.aranyashopbd.aranyashop.api.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Flexible list query supporting optional filters:
     *  - q       : case-insensitive title search
     *  - active  : filter by active flag
     *  - categoryId : filter by category
     * Results sorted by id DESC.
     */
    @Query("""
            SELECT p FROM Product p
            JOIN FETCH p.category c
            WHERE (:q        IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:active   IS NULL OR p.active = :active)
              AND (:catId    IS NULL OR c.id = :catId)
            ORDER BY p.id DESC
            """)
    List<Product> search(
            @Param("q")      String q,
            @Param("active") Boolean active,
            @Param("catId")  Long catId
    );
}
