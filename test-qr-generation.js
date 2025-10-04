import QRCode from 'qrcode';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const QR_SECRET_KEY = 'test-secret-key';

function generateSignature(data) {
  const hmac = crypto.createHmac('sha256', QR_SECRET_KEY);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

async function testQRGeneration() {
  try {
    console.log('Testing QR code generation...');
    
    const guestId = 1;
    const guestData = {
      name: 'Test Guest',
      category: 'VIP'
    };
    
    const token = uuidv4();
    const payload = {
      guest_id: guestId,
      token: token,
      nama: guestData.name,
      category: guestData.category
    };
    
    // Generate signature
    payload.signature = generateSignature({
      guest_id: guestId,
      token: token
    });
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: 'H',
      width: 300,
      margin: 2
    });
    
    console.log('✓ QR Code generated successfully');
    console.log('QR Code URL length:', qrCodeUrl.length);
    console.log('QR Code URL starts with:', qrCodeUrl.substring(0, 50));
    
    // Test if it's a valid data URL
    if (qrCodeUrl.startsWith('data:image/png;base64,')) {
      console.log('✓ QR Code is a valid PNG data URL');
    } else {
      console.log('✗ QR Code format is not as expected');
    }
    
    return qrCodeUrl;
  } catch (error) {
    console.error('✗ Error generating QR code:', error);
    throw error;
  }
}

testQRGeneration()
  .then(() => {
    console.log('\n✓ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  });
