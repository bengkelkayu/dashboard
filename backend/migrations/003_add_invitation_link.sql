-- Add invitation_link column to guests table
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS invitation_link TEXT;

-- Add index for guests with invitation links
CREATE INDEX IF NOT EXISTS idx_guests_invitation_link ON guests(invitation_link) WHERE invitation_link IS NOT NULL;
