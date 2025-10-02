-- Sample data for development and testing
-- This script is optional and can be run after initial migration

-- Clear existing data (optional, be careful in production!)
-- TRUNCATE TABLE thank_you_outbox, guest_attendance, guests, thank_you_templates RESTART IDENTITY CASCADE;

-- Insert sample guests
INSERT INTO guests (name, phone, category) VALUES
  ('Budi Santoso', '6281234567890', 'VVIP'),
  ('Siti Nurhaliza', '6282345678901', 'VIP'),
  ('Ahmad Rizki', '6283456789012', 'Regular'),
  ('Dewi Lestari', '6284567890123', 'VIP'),
  ('Andi Wijaya', '6285678901234', 'Regular'),
  ('Maya Sari', '6286789012345', 'VVIP'),
  ('Rudi Hartono', '6287890123456', 'Regular'),
  ('Linda Wijaya', '6288901234567', 'VIP')
ON CONFLICT (phone) DO NOTHING;

-- Insert sample attendance records
INSERT INTO guest_attendance (guest_id, status, check_in_source, notes)
SELECT id, 'Presence', 'Manual Entry', 'Sample check-in'
FROM guests
WHERE phone IN ('6281234567890', '6282345678901', '6284567890123')
ON CONFLICT DO NOTHING;

-- Insert additional thank you templates
INSERT INTO thank_you_templates (name, message_template, is_enabled) VALUES
  (
    'Formal Thank You',
    'Terima kasih {nama} telah berkenan hadir di acara pernikahan kami pada {waktu_checkin}. Kehadiran Anda sangat berarti bagi kami.',
    true
  ),
  (
    'Casual Thank You',
    'Halo {nama}! Makasih banget ya udah dateng ke acara kita 😊 Semoga hari {nama} menyenangkan!',
    false
  ),
  (
    'Thank You with Reminder',
    'Terima kasih {nama} telah check-in pada {waktu_checkin}. Jangan lupa untuk menikmati hidangan yang telah kami sediakan ya!',
    false
  )
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Sample data inserted successfully!' as message;
