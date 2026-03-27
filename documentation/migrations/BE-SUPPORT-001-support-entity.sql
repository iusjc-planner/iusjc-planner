-- BE-SUPPORT-001 - Migration des supports de matiere vers entite Support

-- 1) Nouvelle table supports
CREATE TABLE IF NOT EXISTS supports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    url VARCHAR(500) NOT NULL,
    taille BIGINT,
    matiere_id BIGINT NOT NULL,
    uploade_par BIGINT,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    CONSTRAINT fk_support_matiere FOREIGN KEY (matiere_id) REFERENCES matieres(id)
);

-- 2) Migration des URLs existantes depuis matiere_supports
INSERT INTO supports (titre, type, url, matiere_id, date_ajout)
SELECT
    CONCAT('Support ', ROW_NUMBER() OVER (PARTITION BY ms.matiere_id ORDER BY ms.support_url)) AS titre,
    CASE
        WHEN LOWER(ms.support_url) LIKE '%.pdf' THEN 'PDF'
        WHEN LOWER(ms.support_url) LIKE '%.mp4' OR LOWER(ms.support_url) LIKE '%.avi' OR LOWER(ms.support_url) LIKE '%.mkv' THEN 'VIDEO'
        WHEN LOWER(ms.support_url) LIKE '%.doc%' OR LOWER(ms.support_url) LIKE '%.ppt%' THEN 'DOCUMENT'
        WHEN LOWER(ms.support_url) LIKE '%.png' OR LOWER(ms.support_url) LIKE '%.jpg' OR LOWER(ms.support_url) LIKE '%.jpeg' OR LOWER(ms.support_url) LIKE '%.gif' THEN 'IMAGE'
        WHEN LOWER(ms.support_url) LIKE 'http://%' OR LOWER(ms.support_url) LIKE 'https://%' THEN 'LIEN'
        ELSE 'AUTRE'
    END AS type,
    ms.support_url,
    ms.matiere_id,
    NOW()
FROM matiere_supports ms;

-- 3) Optionnel apres verification fonctionnelle
-- DROP TABLE matiere_supports;
