-- Script Supabase - Criar usuário admin
-- Substitua 'sua_senha_aqui' por uma senha forte

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'celiommn@gmail.com',
  crypt('sua_senha_aqui', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"is_admin": true}'::jsonb
);
