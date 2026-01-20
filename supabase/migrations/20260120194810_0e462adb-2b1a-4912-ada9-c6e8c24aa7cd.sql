-- Add work_subcategories column to workers table for storing subcategory preferences
ALTER TABLE public.workers ADD COLUMN IF NOT EXISTS work_subcategories TEXT[] DEFAULT '{}'::text[];