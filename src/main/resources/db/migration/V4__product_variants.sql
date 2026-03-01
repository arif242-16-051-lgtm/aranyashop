CREATE TABLE IF NOT EXISTS product_variants
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id  BIGINT       NOT NULL,
    sku         VARCHAR(64)  NOT NULL,
    color       VARCHAR(60)  NULL,
    size        VARCHAR(60)  NULL,
    price_paisa INT          NOT NULL CHECK (price_paisa >= 0),
    stock_qty   INT          NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT uq_variants_sku UNIQUE (sku),
    CONSTRAINT uq_variants_product_color_size UNIQUE (product_id, color, size)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_variants_product ON product_variants (product_id);
