-- ============================================
-- CREATING TABLES
-- ============================================


CREATE TABLE `users` (
    `user_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` BIGINT NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `is_active` BOOLEAN NOT NULL DEFAULT '1',
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    PRIMARY KEY (`user_id`)
);

-- OPTIONAL
CREATE TABLE `role` {
  `role_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`role_id`)
}

CREATE TABLE `categories` (
    `category_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL COMMENT 'Category Name',
    `description` TEXT NULL COMMENT 'Category Description',
    `is_active` BOOLEAN NOT NULL DEFAULT '1' COMMENT 'Account status',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    PRIMARY KEY (`category_id`)
);



CREATE TABLE `products` (
    `product_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL COMMENT 'Product Description',
    `is_active` BOOLEAN NOT NULL DEFAULT '1',
    `category_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `created_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
    FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
    PRIMARY KEY (`product_id`)
);



CREATE TABLE `product_sku` (
    `sku_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `size` ENUM('small', 'medium', 'large') NOT NULL,
    `cost_price` DOUBLE NOT NULL,
    `sell_price` DOUBLE NOT NULL,
    `quantity` BIGINT NOT NULL DEFAULT '0',
    `colour` VARCHAR(255) NULL,
    `reorder_level` BIGINT NOT NULL DEFAULT '10' COMMENT 'Minimum Stock Threshold',
    `is_active` BOOLEAN NOT NULL DEFAULT '1',
    `added_by` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
    FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`),
    PRIMARY KEY (`sku_id`)
);


CREATE TABLE `orders` (
    `order_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_numer` VARCHAR(255) NOT NULL UNIQUE,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `order_status` ENUM(
        'pending',
        'approved',
        'disapproved'
    ) NOT NULL DEFAULT 'pending' COMMENT 'Order Status',
    `total_amount` DOUBLE NOT NULL,
    `order_note` VARCHAR(255) NULL,
    `approved_by` BIGINT UNSIGNED NULL,
    `rejection_notes` VARCHAR(255) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL,
    FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`),
    PRIMARY KEY (`order_id`)
);

CREATE TABLE `order_items` (
    `order_item_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_sku_id` BIGINT UNSIGNED NOT NULL,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `quantity` BIGINT NULL DEFAULT '0',
    `unit_price` DOUBLE NOT NULL DEFAULT '0',
    `profit` DOUBLE NOT NULL,
    `sub_total` DOUBLE NOT NULL DEFAULT '0',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
    FOREIGN KEY (`product_sku_id`) REFERENCES `product_sku` (`sku_id`),
    PRIMARY Key (`order_item_id`)
);

-- ============================================
-- SOME FIELDS ARE OMITTED SINCE THEY HAVE DEFAULTS
-- ============================================

-- Creating Records for User

INSERT INTO
    `users` ( `first_name`, `last_name`, `email`, `phone`, `role`, `is_active`, `password_hash`) VALUES
    ('Oluwasegun', 'Adedeji', 'oluwasheges@gmail.com', '08132638235', 'user', 1, '123456789'),
    ('Abiola', 'Adedeji', 'oluwasegunadedeji@yahoo.com', '08132638235', 'admin', 1, '123456789')

-- Creating Records for Categories

INSERT INTO
    `categories` ( `name`, `description`) VALUES
    ('Shirt', 'Men shirt'),
    ('Trouser', 'Men Trousers')

-- Creating Records for products

INSERT INTO `products` 
    (`name`, `description`, `category_id`, `image_url`, `created_by`) VALUES
    ('Classic Oxford Button-Down Shirt', 'Elevate your everyday style with this timeless Oxford button-down shirt. Crafted from premium cotton blend fabric, it features a tailored fit that looks sharp whether tucked or untucked.', 5, NULL, 2),
    ('Slim Fit Dress Shirt', 'Modern slim fit dress shirt perfect for formal occasions', 5, 'https://example.com/dress-shirt.jpg', 2),
    ('Casual Chino Trousers', 'Comfortable cotton chino trousers for everyday wear', 6, NULL, 2),
    ('Casual Chino TrousersCasual Chino Trousers', 'Professional black trousers with wrinkle-resistant fabric', 6, 'https://example.com/black-trouser.jpg', 2)

-- Creating Records for Product SKU

INSERT INTO `product_sku` 
    (`product_id`, `size`, `cost_price`, `sell_price`, `quantity`, `colour`, `reorder_level`, `added_by`) 
VALUES
    (5, 'small', 1500.00, 2500.00, 50, 'White', 10, 2),
    (5, 'medium', 1500.00, 2500.00, 75, 'White', 15, 2),
    (5, 'large', 1500.00, 2500.00, 40, 'White', 10, 2),
    (6, 'small', 1800.00, 3000.00, 25, 'White', 8, 2),
    (6, 'medium', 1800.00, 3000.00, 35, 'White', 10, 2),
    (6, 'large', 1800.00, 3000.00, 20, 'White', 8, 2);
    
-- Creating Records for Orders

INSERT INTO `orders` 
    (`order_numer`, `user_id`, `order_status`, `total_amount`, `order_note`, `approved_by`, `rejection_notes`) 
VALUES
    ('ORD-2025-0001', 1, 'pending', 9000.00, 'Need these items for office uniform', NULL, NULL),
    ('ORD-2025-0002', 1, 'approved', 7000.00, 'Urgent order for event', 2, NULL),
    ('ORD-2025-0003', 1, 'pending', 12000.00, NULL, NULL, NULL),
    ('ORD-2025-0004', 1, 'disapproved', 5000.00, 'Request for personal use', 2, 'Not approved for personal use'),
    ('ORD-2025-0005', 1, 'approved', 16000.00, 'Team uniform order', 2, NULL);


-- Creating Records for Order Items

INSERT INTO `order_items` 
    (`product_sku_id`, `order_id`, `quantity`, `unit_price`, `profit`, `sub_total`) 
VALUES
    (23, 1, 2, 2500.00, 1000.00, 5000.00),
    (24, 1, 1, 3500.00, 1500.00, 3500.00),
    (25, 1, 1, 3000.00, 1200.00, 3000.00),
    (28, 2, 2, 2500.00, 1000.00, 5000.00),
    (26, 2, 1, 3500.00, 1500.00, 3500.00),
    (27, 3, 2, 4000.00, 1500.00, 8000.00),
    (23, 3, 1, 8000.00, 3000.00, 8000.00),
    (25, 4, 2, 2500.00, 1000.00, 5000.00),
    (24, 5, 3, 2500.00, 1000.00, 7500.00);


-- ============================================
-- GETTING RECORDS
-- ============================================

-- Get all products with their categories
SELECT * FROM `products` JOIN `categories` ON products.category_id=categories.category_id

-- Get all product_sku with their product
SELECT * FROM `product_sku` JOIN `products` ON product_sku.product_id=products.product_id

-- Get all orders with their user
SELECT * FROM `orders` JOIN `users` ON orders.user_id=users.user_id

-- ============================================
-- UPDATING RECORDS
-- ============================================

-- Update product and its SKUs to inactive

UPDATE products
SET is_active = 0, updated_at = NOW()
WHERE product_id = 6;

UPDATE product_sku
SET is_active = 0, updated_at = NOW()
where product_id = 6

-- Update a pending order to approved
UPDATE orders
SET order_status = 'approved', updated_at = NOW()
where order_id = 1;

-- ============================================
-- DELETING RECORDS
-- ============================================

-- Delete order items first
DELETE FROM order_items 
WHERE order_id = 4;

-- Then delete the order
DELETE FROM orders 
WHERE order_id = 4;

-- ============================================
-- QUERY RECORDS USING JOINS
-- ============================================


-- Get all products with their categories
SELECT * FROM `products` JOIN `categories` ON products.category_id=categories.category_id

-- Get all product_sku with their product
SELECT * FROM `product_sku` JOIN `products` ON product_sku.product_id=products.product_id

-- Get all orders with complete details
SELECT orders.order_id, orders.order_numer, users.last_name, users.email, products.name, categories.name, product_sku.size, order_items.quantity, order_items.sub_total FROM `orders` 
JOIN `users` ON orders.user_id=users.user_id
JOIN `order_items` ON orders.order_id = order_items.order_id
JOIN `product_sku` ON order_items.product_sku_id = product_sku.sku_id
JOIN `products` ON product_sku.product_id = products.product_id
JOIN `categories` ON products.product_id = categories.category_id
ORDER BY orders.created_at
