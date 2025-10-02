-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('VVIP', 'VIP', 'Regular')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_category ON guests(category);

-- Create guest_attendance table
CREATE TABLE IF NOT EXISTS guest_attendance (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'Not Presence' CHECK (status IN ('Presence', 'Not Presence')),
  check_in_source VARCHAR(50) DEFAULT 'Digital Guestbook',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_guest_id ON guest_attendance(guest_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON guest_attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_time ON guest_attendance(check_in_time);

-- Create thank_you_templates table
CREATE TABLE IF NOT EXISTS thank_you_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create thank_you_outbox table (for message queue/log)
CREATE TABLE IF NOT EXISTS thank_you_outbox (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES thank_you_templates(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for thank_you_outbox
CREATE INDEX IF NOT EXISTS idx_outbox_status ON thank_you_outbox(status);
CREATE INDEX IF NOT EXISTS idx_outbox_guest_id ON thank_you_outbox(guest_id);
CREATE INDEX IF NOT EXISTS idx_outbox_created_at ON thank_you_outbox(created_at);

-- Create audit_logs table for observability
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_info VARCHAR(255),
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON guest_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON thank_you_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outbox_updated_at BEFORE UPDATE ON thank_you_outbox
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default thank you template
INSERT INTO thank_you_templates (name, message_template, is_enabled)
VALUES (
  'Default Thank You',
  'Terima kasih {nama} telah hadir di acara kami! Anda check-in pada {waktu_checkin}. Semoga hari Anda menyenangkan!',
  true
) ON CONFLICT DO NOTHING;
