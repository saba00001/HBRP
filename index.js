const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

const app = express();
const port = 3000;

// Express server setup
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});

app.listen(port, () => {
    console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

// Configuration
const OWNER_IDS = ['1326983284168720505']; // შეცვალე შენი Discord ID-თ
const BOT_ABOUT_ME = "Horizon Beyond Role Play Official Bot";
const BOT_PLAYING_STATUS = "Horizon Beyond Server";

// Logging function
function log(type, message, color = '\x1b[37m') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${color}[ ${type} ] ${timestamp}: ${message}\x1b[0m`);
}

// Login function
async function login() {
    try {
        await client.login(process.env.TOKEN);
        log('LOGIN', `Logged in as: ${client.user.tag}`, '\x1b[32m');
        log('INFO', `Bot ID: ${client.user.id}`, '\x1b[35m');
        log('INFO', `Connected to ${client.guilds.cache.size} server(s)`, '\x1b[34m');

        // Set profile bio (About Me)
        if (client.user.setProfile) {
            await client.user.setProfile({ bio: BOT_ABOUT_ME });
            log('PROFILE', `About Me set to: ${BOT_ABOUT_ME}`, '\x1b[35m');
        } else {
            log('ERROR', 'setProfile() method is not available in this API version', '\x1b[31m');
        }

    } catch (error) {
        log('ERROR', `Failed to log in: ${error}`, '\x1b[31m');
        process.exit(1);
    }
}

// Set Playing status function
function setPlayingStatus() {
    client.user.setActivity({
        name: BOT_PLAYING_STATUS,
        type: ActivityType.Playing
    });
    log('STATUS', `Playing status set to: ${BOT_PLAYING_STATUS}`);
}

// Message command handler
function setupMessageCommands() {
    client.on('messageCreate', async (message) => {
        if (!OWNER_IDS.includes(message.author.id)) return; // მხოლოდ მფლობელს აქვს წვდომა

        // Send message as bot
        if (message.content.startsWith('!sms')) {
            const args = message.content.split(' ');
            if (args.length < 3) {
                return message.reply('Usage: !sms #channel Your message here');
            }

            const channel = message.mentions.channels.first();
            if (!channel) {
                return message.reply('Invalid channel. Please mention a valid channel.');
            }

            const text = args.slice(2).join(' ');

            try {
                await channel.send(text);
                log('SMS', `Message sent to ${channel.name}: "${text}"`, '\x1b[33m');
                await message.reply(`✅ Message sent to ${channel}`);
            } catch (error) {
                log('ERROR', `Failed to send SMS: ${error}`, '\x1b[31m');
                await message.reply('❌ Failed to send the message.');
            }
        }
    });
}

// Bot ready event
client.once('ready', () => {
    log('INFO', `Ping: ${client.ws.ping} ms`, '\x1b[34m');

    // Set initial playing status
    setPlayingStatus();

    // Setup message commands
    setupMessageCommands();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    log('UNHANDLED REJECTION', error, '\x1b[31m');
});

// Login to Discord
login();
