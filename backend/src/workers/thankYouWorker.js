import dotenv from 'dotenv';
import ThankYouOutbox from '../models/ThankYouOutbox.js';
import whatsappService from '../services/whatsappService.js';

dotenv.config();

const POLL_INTERVAL = 10000; // 10 seconds
const BATCH_SIZE = 10;

class ThankYouWorker {
  constructor() {
    this.isRunning = false;
  }

  async start() {
    console.log('Thank You Worker started...');
    this.isRunning = true;
    
    while (this.isRunning) {
      try {
        await this.processQueue();
      } catch (error) {
        console.error('Error in worker loop:', error);
      }
      
      // Wait before next poll
      await this.sleep(POLL_INTERVAL);
    }
  }

  stop() {
    console.log('Thank You Worker stopping...');
    this.isRunning = false;
  }

  async processQueue() {
    const pendingMessages = await ThankYouOutbox.findPending(BATCH_SIZE);
    
    if (pendingMessages.length === 0) {
      return;
    }
    
    console.log(`Processing ${pendingMessages.length} pending thank you messages...`);
    
    for (const message of pendingMessages) {
      try {
        await this.sendMessage(message);
        await ThankYouOutbox.markAsSent(message.id);
        console.log(`✓ Message sent to ${message.phone}`);
      } catch (error) {
        console.error(`✗ Failed to send message to ${message.phone}:`, error.message);
        await ThankYouOutbox.markAsFailed(message.id, error.message);
      }
    }
  }

  async sendMessage(message) {
    // Send via Baileys WhatsApp
    await whatsappService.sendMessage(message.phone, message.message);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run worker if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new ThankYouWorker();
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received');
    worker.stop();
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT signal received');
    worker.stop();
  });
  
  worker.start().catch(console.error);
}

export default ThankYouWorker;
