-- =============================================
-- Supabase Setup pour Résultats Commerciaux Sagamm
-- Exécuter dans l'éditeur SQL de Supabase
-- =============================================

-- 1. Créer la table submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  direction_regionale TEXT NOT NULL,
  mois TEXT NOT NULL,
  email TEXT,
  particuliers_nombre_path TEXT NOT NULL,
  particuliers_montant_path TEXT NOT NULL,
  pef_nombre_path TEXT,
  pef_montant_path TEXT
);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 3. Politique pour permettre les insertions anonymes (formulaire public)
CREATE POLICY "Allow anonymous inserts" ON submissions
  FOR INSERT
  WITH CHECK (true);

-- 4. Politique pour lire ses propres soumissions (optionnel, pour admin)
CREATE POLICY "Allow read for authenticated" ON submissions
  FOR SELECT
  USING (true);

-- 5. Créer le bucket de stockage
INSERT INTO storage.buckets (id, name, public)
VALUES ('resultats-commerciaux', 'resultats-commerciaux', false)
ON CONFLICT (id) DO NOTHING;

-- 6. Politique storage : autoriser l'upload anonyme
CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'resultats-commerciaux');

-- 7. Politique storage : autoriser la lecture pour les utilisateurs authentifiés
CREATE POLICY "Allow authenticated reads" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'resultats-commerciaux');
