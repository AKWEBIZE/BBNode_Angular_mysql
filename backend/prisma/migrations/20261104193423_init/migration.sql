-- CreateTable
CREATE TABLE `Users` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NULL,
    `user_name` VARCHAR(191) NULL,
    `phone_number` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `sPhrase` VARCHAR(191) NULL,
    `old_s_phrase` TEXT NULL,
    `commonUserId` CHAR(36) NULL,
    `businessJustification` VARCHAR(191) NULL,
    `authenticationType` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL,
    `lock_user` BOOLEAN NOT NULL DEFAULT false,
    `userStatus` ENUM('REGISTERED', 'ACTIVE', 'REVOKED', 'LOCKED') NULL,
    `securityQues1` VARCHAR(191) NULL,
    `securityAns1` VARCHAR(191) NULL,
    `securityQues2` VARCHAR(191) NULL,
    `securityAns2` VARCHAR(191) NULL,
    `profile` LONGBLOB NULL,
    `sPhraseResetRequested` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type_audit` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    INDEX `Users_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NULL,
    `user_name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `userEntity_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    UNIQUE INDEX `admin_userEntity_id_key`(`userEntity_id`),
    INDEX `admin_id_name_idx`(`id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BUYER` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NULL,
    `userName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `zip` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `userEntity_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    UNIQUE INDEX `BUYER_userEntity_id_key`(`userEntity_id`),
    INDEX `BUYER_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SELLER` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `zip` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `seller_status` ENUM('PENDING', 'IN_REVIEW', 'REJECTED', 'APPROVED') NULL,
    `userEntity_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    UNIQUE INDEX `SELLER_userEntity_id_key`(`userEntity_id`),
    INDEX `SELLER_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PRODUCT` (
    `id` CHAR(36) NOT NULL,
    `productName` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `subcategory` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `image_url` VARCHAR(191) NULL,
    `quantity` DECIMAL(65, 0) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    INDEX `PRODUCT_productName_idx`(`productName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VARIETIES` (
    `id` CHAR(36) NOT NULL,
    `variety_name` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `origin` VARCHAR(191) NULL,
    `grower` VARCHAR(191) NULL,
    `growingMethod` VARCHAR(191) NULL,
    `harvest_date` DATETIME(3) NULL,
    `harvestSeason` VARCHAR(191) NULL,
    `quality` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `price_per_unit` VARCHAR(191) NULL,
    `availability` VARCHAR(191) NULL,
    `certifications` VARCHAR(191) NULL,
    `products_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    INDEX `VARIETIES_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BUYER_ORDER` (
    `id` CHAR(36) NOT NULL,
    `order_date` DATETIME(3) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `billingCompanyName` VARCHAR(191) NULL,
    `quantity` VARCHAR(191) NULL,
    `shippingName` VARCHAR(191) NULL,
    `status` ENUM('IN_TRANSIT', 'CANCELLED', 'RETURNED', 'DELIVERED') NULL,
    `estimationDateOfArrival` VARCHAR(191) NULL,
    `buyer_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    INDEX `BUYER_ORDER_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WATCH_LIST` (
    `id` CHAR(36) NOT NULL,
    `buyerId` CHAR(36) NULL,
    `productId` CHAR(36) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    INDEX `WATCH_LIST_id_idx`(`id`),
    INDEX `WATCH_LIST_buyerId_idx`(`buyerId`),
    INDEX `WATCH_LIST_buyerId_productId_idx`(`buyerId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CONTACT` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `Ph_no` VARCHAR(191) NULL,
    `message` VARCHAR(250) NOT NULL DEFAULT '',
    `topic` VARCHAR(191) NULL,
    `loginType` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `companyName` VARCHAR(191) NULL,
    `enquiry_country` VARCHAR(191) NULL,
    `comments` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    INDEX `CONTACT_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OTP` (
    `id` CHAR(36) NOT NULL,
    `user_name` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `modifiedBy` VARCHAR(191) NOT NULL DEFAULT 'SYSTEM',
    `authentication_type` ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdId` CHAR(36) NULL,
    `modifiedId` CHAR(36) NULL,

    INDEX `OTP_id_idx`(`id`),
    INDEX `OTP_user_name_idx`(`user_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OrdersProductJoin` (
    `A` CHAR(36) NOT NULL,
    `B` CHAR(36) NOT NULL,

    UNIQUE INDEX `_OrdersProductJoin_AB_unique`(`A`, `B`),
    INDEX `_OrdersProductJoin_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin` ADD CONSTRAINT `admin_userEntity_id_fkey` FOREIGN KEY (`userEntity_id`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BUYER` ADD CONSTRAINT `BUYER_userEntity_id_fkey` FOREIGN KEY (`userEntity_id`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SELLER` ADD CONSTRAINT `SELLER_userEntity_id_fkey` FOREIGN KEY (`userEntity_id`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VARIETIES` ADD CONSTRAINT `VARIETIES_products_id_fkey` FOREIGN KEY (`products_id`) REFERENCES `PRODUCT`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BUYER_ORDER` ADD CONSTRAINT `BUYER_ORDER_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `BUYER`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WATCH_LIST` ADD CONSTRAINT `WATCH_LIST_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `PRODUCT`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrdersProductJoin` ADD CONSTRAINT `_OrdersProductJoin_A_fkey` FOREIGN KEY (`A`) REFERENCES `BUYER_ORDER`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OrdersProductJoin` ADD CONSTRAINT `_OrdersProductJoin_B_fkey` FOREIGN KEY (`B`) REFERENCES `PRODUCT`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
