-- Migration Script: BE-AUTH-001 - Harmonisation des Roles
-- Date: 24 Mars 2026
-- Description: Convertit les roles USER en ENSEIGNANT dans les tables utilisateurs

-- =====================================================
-- IMPORTANT: Executer ce script APRES avoir deploye
-- le nouveau code avec l'enum Role modifie
-- =====================================================

-- 1. Migration de la table User (auth-service)
-- Table: User (note: nom de table en majuscule dans auth-service)
UPDATE User
SET role = 'ENSEIGNANT'
WHERE role = 'USER';

-- Verification
SELECT role, COUNT(*) as count
FROM User
GROUP BY role;

-- 2. Migration de la table users (user-service)
-- Note: Cette table utilise deja ENSEIGNANT, mais au cas ou
UPDATE users
SET role = 'ENSEIGNANT'
WHERE role = 'USER';

-- Verification
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- =====================================================
-- ROLLBACK (en cas de probleme)
-- =====================================================
-- UPDATE User SET role = 'USER' WHERE role = 'ENSEIGNANT';
-- UPDATE users SET role = 'USER' WHERE role = 'ENSEIGNANT';
