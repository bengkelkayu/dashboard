-- Add QR Code columns to guests table
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS qr_code_token VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code_generated_at TIMESTAMP;

-- Create index for faster QR code token lookups
CREATE INDEX IF NOT EXISTS idx_guests_qr_token ON guests(qr_code_token);
