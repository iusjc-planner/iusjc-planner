-- BE-GROUP-002 - Methode Diviser() pour Groupes
-- Objectif: ajouter les colonnes de hierarchie et de type de groupe.

ALTER TABLE `groups`
    ADD COLUMN `parent_group_id` BIGINT NULL,
    ADD COLUMN `group_type` VARCHAR(20) NOT NULL DEFAULT 'PRINCIPAL';

CREATE INDEX `idx_groups_parent_group_id` ON `groups` (`parent_group_id`);

-- Optionnel selon votre politique de contraintes
-- ALTER TABLE `groups`
--     ADD CONSTRAINT `fk_groups_parent`
--     FOREIGN KEY (`parent_group_id`) REFERENCES `groups`(`id`);

-- Initialisation des groupes existants
UPDATE `groups`
SET `group_type` = 'PRINCIPAL'
WHERE `group_type` IS NULL;
