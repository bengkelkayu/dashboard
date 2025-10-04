-- Create invitation_templates table
CREATE TABLE IF NOT EXISTS invitation_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_invitation_templates_updated_at ON invitation_templates;
CREATE TRIGGER update_invitation_templates_updated_at BEFORE UPDATE ON invitation_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default invitation template
INSERT INTO invitation_templates (name, message_template, is_enabled)
VALUES (
  'Default Invitation',
  'Halo {Name}! 🎉

Kami mengundang Anda untuk hadir di acara pernikahan kami.

{invitation_link}

Terlampir QR Code untuk absensi. Silakan tunjukkan QR Code ini saat check-in di acara.

Ditunggu kehadirannya! 🙏',
  true
) ON CONFLICT DO NOTHING;
