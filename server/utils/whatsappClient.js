const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;

const initializeWhatsApp = () => {
    console.log('Initializing WhatsApp Client...');
    
    // LocalAuth stores the session data on your computer/server.
    // This means you only scan the QR code ONE time.
    // The session is saved in the .wwebjs_auth folder.
    client = new Client({
        authStrategy: new LocalAuth({
            clientId: "admin-session",
            dataPath: "./.wwebjs_auth"
        }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    });

    client.on('qr', (qr) => {
        console.log('------------------------------------------------');
        console.log('WHATSAPP QR CODE RECEIVED');
        console.log('To set the Sender Number (Business Number):');
        console.log('1. Open WhatsApp or WhatsApp Business on the phone you want to send from.');
        console.log('2. Go to Settings > Linked Devices > Link a Device.');
        console.log('3. Scan the code below.');
        console.log('NOTE: You only need to do this ONCE. The session will be saved locally.');
        console.log('------------------------------------------------');
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('------------------------------------------------');
        console.log('WhatsApp Client is Ready!');
        console.log('------------------------------------------------');
    });

    client.on('authenticated', () => {
        console.log('WhatsApp Authenticated!');
    });

    client.on('auth_failure', (msg) => {
        console.error('WhatsApp Authentication Failure:', msg);
    });

    client.initialize();
};

const sendWhatsAppMessage = async (to, message) => {
    if (!client) {
        console.error('WhatsApp client not initialized');
        return false;
    }
    
    try {
        // Strip '+' from the number if present
        const cleanNumber = to.replace('+', '').replace(/\s/g, '');
        
        // WhatsApp ID format: number@c.us
        const chatId = `${cleanNumber}@c.us`;
        
        // Retrieve internal ID just in case (optional detailed check)
        // const contact = await client.getNumberId(chatId);
        
        await client.sendMessage(chatId, message);
        console.log(`WhatsApp message sent to ${cleanNumber}`);
        return true;
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        return false;
    }
};

module.exports = { initializeWhatsApp, sendWhatsAppMessage };
