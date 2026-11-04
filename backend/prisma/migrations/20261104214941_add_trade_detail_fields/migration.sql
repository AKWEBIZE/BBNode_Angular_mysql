-- AlterTable
ALTER TABLE `product` ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `farmerInfo` TEXT NULL,
    ADD COLUMN `inStock` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `productTag` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `varieties` ADD COLUMN `availableQuantity` INTEGER NULL,
    ADD COLUMN `deliveryTimeDays` VARCHAR(191) NULL,
    ADD COLUMN `grade` VARCHAR(191) NULL,
    ADD COLUMN `moistureContent` VARCHAR(191) NULL,
    ADD COLUMN `moq` INTEGER NULL,
    ADD COLUMN `packingDetail` VARCHAR(191) NULL,
    ADD COLUMN `packingType` VARCHAR(191) NULL,
    ADD COLUMN `paymentTerms` VARCHAR(191) NULL,
    ADD COLUMN `priceMax` DECIMAL(12, 2) NULL,
    ADD COLUMN `priceMin` DECIMAL(12, 2) NULL,
    ADD COLUMN `processingType` VARCHAR(191) NULL;
