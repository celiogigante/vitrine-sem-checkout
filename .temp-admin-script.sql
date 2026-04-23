-- Definir usuário como admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{is_admin}',
  'true'
)
WHERE id = '24c3f28c-ba6f-4f47-b5b0-8be727c3e697';
