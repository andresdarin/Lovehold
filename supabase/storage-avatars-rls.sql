-- ============================================================
-- RLS Policies para el bucket "avatars" (fotos de perfil)
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase (Dashboard > SQL Editor)
-- ============================================================

-- 1. Cualquiera puede VER avatares (son URLs públicas)
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. Usuario autenticado puede SUBIR a su propia carpeta
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Usuario autenticado puede ACTUALIZAR (upsert) su propio avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Usuario autenticado puede ELIMINAR su propio avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
