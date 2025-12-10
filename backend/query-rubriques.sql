SELECT id, code, nom, type, "montantType", valeur, formule, "isActive"
FROM "Rubrique"
WHERE code LIKE '%SALAIRE_BASE%'
   OR code LIKE '%BASE%'
   OR nom LIKE '%Salaire de Base%'
   OR nom LIKE '%Salaire de base%';
