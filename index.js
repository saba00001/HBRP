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
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// Mapping of activity types to their corresponding Discord.js ActivityType
const ACTIVITY_TYPES = {
    'play': ActivityType.Playing,
    'watch': ActivityType.Watching,
    'listen': ActivityType.Listening,
    'compete': ActivityType.Competing,
    'custom': ActivityType.Custom
};

let currentStatus = {
    type: ActivityType.Custom,
    name: "🎧 Listening to Spotify"
};

function updateStatus(activityType = currentStatus.type, activityName = currentStatus.name) {
    client.user.setPresence({
        activities: [{ 
            name: activityName, 
            type: activityType 
        }],
        status: 'online' // You can change this to 'dnd', 'idle', etc.
    });
    
    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${activityName} (${Object.keys(ACTIVITY_TYPES).find(key => ACTIVITY_TYPES[key] === activityType)})`);
    
    // Update current status
    currentStatus = { type: activityType, name: activityName };
}

client.on('messageCreate', (message) => {
    // Check if message starts with !activity
    if (!message.content.startsWith('!activity')) return;
    
    // Ignore messages from bots
    if (message.author.bot) return;
    
    // Split the message into parts
    const args = message.content.split(' ');
    
    // Check if the command has enough arguments
    if (args.length < 3) {
        return message.reply('Usage: !activity <type> <status>\nTypes: play, watch, listen, compete, custom');
    }
    
    // Get the activity type and name
    const activityType = args[1].toLowerCase();
    const activityName = args.slice(2).join(' ');
    
    // Check if the activity type is valid
    if (!ACTIVITY_TYPES[activityType]) {
        return message.reply('Invalid activity type. Use: play, watch, listen, compete, custom');
    }
    
    // Update the status
    updateStatus(ACTIVITY_TYPES[activityType], activityName);
    
    // Confirm the status change
    message.reply(`Status updated to ${activityType}: ${activityName}`);
});

async function login() {
    try {
        await client.login(process.env.TOKEN);
        console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
        console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
        console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
    } catch (error) {
        console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
        process.exit(1);
    }
}

function heartbeat() {
    setInterval(() => {
        console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
    }, 30000);
}

client.once('ready', () => {
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
    
    // Initial status
    updateStatus();
    
    heartbeat();
});

login();
