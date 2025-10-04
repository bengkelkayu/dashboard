import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qrCode = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.authFolder = path.join(__dirname, '../../../baileys_auth');
  }

  async initialize() {
    if (this.isConnecting || this.isConnected) {
      console.log('WhatsApp is already connecting or connected');
      return;
    }

    this.isConnecting = true;

    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: P({ level: 'silent' }),
        browser: ['Wedding Dashboard', 'Chrome', '1.0.0'],
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.qrCode = qr;
          console.log('QR Code updated, scan with WhatsApp');
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error instanceof Boom)
            ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
            : true;

          console.log('Connection closed due to', lastDisconnect?.error, 'reconnecting:', shouldReconnect);
          
          this.isConnected = false;
          this.isConnecting = false;
          this.qrCode = null;

          if (shouldReconnect) {
            setTimeout(() => this.initialize(), 3000);
          }
        } else if (connection === 'open') {
          console.log('✓ WhatsApp connected successfully');
          this.isConnected = true;
          this.isConnecting = false;
          this.qrCode = null;
        }
      });

      this.sock.ev.on('messages.upsert', async ({ messages }) => {
        // Handle incoming messages if needed
        console.log('Received messages:', messages.length);
      });

    } catch (error) {
      console.error('Error initializing WhatsApp:', error);
      this.isConnecting = false;
      throw error;
    }
  }

  async sendMessage(phone, message) {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp is not connected. Please scan QR code first.');
    }

    try {
      // Format phone number for WhatsApp (remove leading zeros, ensure country code)
      let formattedPhone = phone.replace(/\D/g, '');
      
      // If starts with 0, replace with 62
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.substring(1);
      }
      
      // If doesn't start with 62, add it
      if (!formattedPhone.startsWith('62')) {
        formattedPhone = '62' + formattedPhone;
      }

      const jid = `${formattedPhone}@s.whatsapp.net`;
      
      await this.sock.sendMessage(jid, { text: message });
      
      console.log(`✓ Message sent to ${formattedPhone}`);
      return { success: true, phone: formattedPhone };
    } catch (error) {
      console.error(`✗ Failed to send message to ${phone}:`, error);
      throw error;
    }
  }

  async sendMessageWithImage(phone, message, imageDataUrl) {
    if (!this.isConnected || !this.sock) {
      throw new Error('WhatsApp is not connected. Please scan QR code first.');
    }

    try {
      // Format phone number for WhatsApp (remove leading zeros, ensure country code)
      let formattedPhone = phone.replace(/\D/g, '');
      
      // If starts with 0, replace with 62
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '62' + formattedPhone.substring(1);
      }
      
      // If doesn't start with 62, add it
      if (!formattedPhone.startsWith('62')) {
        formattedPhone = '62' + formattedPhone;
      }

      const jid = `${formattedPhone}@s.whatsapp.net`;
      
      // Convert data URL to buffer
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Send image with caption
      await this.sock.sendMessage(jid, { 
        image: buffer,
        caption: message
      });
      
      console.log(`✓ Message with image sent to ${formattedPhone}`);
      return { success: true, phone: formattedPhone };
    } catch (error) {
      console.error(`✗ Failed to send message with image to ${phone}:`, error);
      throw error;
    }
  }

  getQRCode() {
    return this.qrCode;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      hasQRCode: !!this.qrCode
    };
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.qrCode = null;
      console.log('WhatsApp disconnected');
    }
  }
}

// Singleton instance
const whatsappService = new WhatsAppService();

export default whatsappService;
