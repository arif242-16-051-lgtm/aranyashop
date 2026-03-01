CREATE TABLE IF NOT EXISTS products
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    title          VARCHAR(200)                        NOT NULL,
    description    TEXT                                NULL,
    active         BOOLEAN                             NOT NULL DEFAULT TRUE,
    shipping_class ENUM ('FREE', 'STANDARD')           NOT NULL DEFAULT 'STANDARD',
    category_id    BIGINT                              NOT NULL,
    created_at     TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP                           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_active ON products (active);
