-- Create storage bucket for worker documents (profile pictures and Aadhaar cards)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('worker-documents', 'worker-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own documents
CREATE POLICY "Workers can upload their own documents" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'worker-documents');

-- Allow workers to view their own documents
CREATE POLICY "Workers can view their own documents" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'worker-documents');

-- Allow workers to update their own documents
CREATE POLICY "Workers can update their own documents" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'worker-documents');

-- Allow workers to delete their own documents
CREATE POLICY "Workers can delete their own documents" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'worker-documents');