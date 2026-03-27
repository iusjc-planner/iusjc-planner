-- BE-ROOM-001 - Relation Salle-Equipement via table de jointure

-- 1) Si l'ancienne table room_equipments (texte) existe, la renommer
-- pour conserver les donnees legacy avant creation de la nouvelle structure.
-- Adapter manuellement si votre SGBD ne supporte pas IF EXISTS sur RENAME.
RENAME TABLE `room_equipments` TO `room_equipments_legacy`;

-- 2) Nouvelle table normalisee
CREATE TABLE IF NOT EXISTS `room_equipments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `room_id` BIGINT NOT NULL,
    `resource_id` BIGINT NOT NULL,
    `quantite` INT NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_room_equipment_room_resource` (`room_id`, `resource_id`),
    KEY `idx_room_equipments_room_id` (`room_id`),
    KEY `idx_room_equipments_resource_id` (`resource_id`)
);

-- 3) Migration best-effort depuis l'ancien stockage texte
-- Hypothese: table legacy room_equipments_legacy(room_id, equipment)
-- et table resources(id, name). A adapter selon le schema exact.
INSERT INTO `room_equipments` (`room_id`, `resource_id`, `quantite`)
SELECT re.`room_id`, r.`id`, 1
FROM `room_equipments_legacy` re
JOIN `resources` r ON LOWER(r.`name`) = LOWER(re.`equipment`)
WHERE re.`equipment` IS NOT NULL;

-- 4) Nettoyage manuel recommande:
-- - Equipements texte non resolus
-- - Verifier les quantites reelles puis ajuster quantite
