-- Create brands table for better control of product brands
CREATE TABLE public.brands (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE,
  logo_url text,
  order_index integer DEFAULT 0,
  is_visible boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);

-- Add foreign key constraint to products table
ALTER TABLE public.products
ADD COLUMN brand_id uuid,
ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;

-- Insert existing brands from products (adjust brands as needed for your store)
INSERT INTO public.brands (name, slug, order_index)
VALUES 
  ('Apple', 'apple', 1),
  ('Samsung', 'samsung', 2),
  ('Xiaomi', 'xiaomi', 3),
  ('LG', 'lg', 4),
  ('Motorola', 'motorola', 5)
ON CONFLICT (name) DO NOTHING;

-- Create index for faster queries
CREATE INDEX idx_brands_is_visible ON public.brands(is_visible);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
