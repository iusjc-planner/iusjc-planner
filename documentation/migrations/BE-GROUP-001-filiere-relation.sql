-- BE-GROUP-001 - Relation Groupe -> Filiere
-- Objectif: ajouter filiere_id sur groups et retro-remplir les donnees existantes.

-- 1) Ajout de la colonne (nullable temporairement pour backfill)
ALTER TABLE `groups`
    ADD COLUMN `filiere_id` BIGINT NULL;

-- 2) Backfill minimal: associer chaque groupe a la premiere filiere de son ecole
-- (adapter la logique si plusieurs filieres cibles existent)
UPDATE `groups` g
SET g.`filiere_id` = (
    SELECT f.`id`
    FROM `filieres` f
    WHERE f.`school_id` = g.`school_id`
    ORDER BY f.`id` ASC
    LIMIT 1
)
WHERE g.`filiere_id` IS NULL;

-- 3) Option de secours: creer une filiere "Non categorise" par ecole puis rattacher
INSERT INTO `filieres` (`code`, `nom`, `school_id`, `status`)
SELECT CONCAT('NC-', s.`id`), 'Non categorise', s.`id`, 'ACTIVE'
FROM `schools` s
WHERE NOT EXISTS (
    SELECT 1
    FROM `filieres` f
    WHERE f.`school_id` = s.`id`
      AND f.`code` = CONCAT('NC-', s.`id`)
);

UPDATE `groups` g
SET g.`filiere_id` = (
    SELECT f.`id`
    FROM `filieres` f
    WHERE f.`school_id` = g.`school_id`
      AND f.`code` = CONCAT('NC-', g.`school_id`)
    LIMIT 1
)
WHERE g.`filiere_id` IS NULL;

-- 4) Contrainte finale
ALTER TABLE `groups`
    MODIFY COLUMN `filiere_id` BIGINT NOT NULL;

-- Optionnel: index pour filtrage par filiere
CREATE INDEX `idx_groups_filiere_id` ON `groups` (`filiere_id`);
