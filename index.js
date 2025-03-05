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

// Configuration for playing panel
const PLAYING_PANELS = [
    { name: "HBRP", details: "High Base RP Server" },
    { name: "Valorant", details: "Competitive Gameplay" },
    { name: "GTA V", details: "Role Play Server" }
];

client.on('messageCreate', (message) => {
    // Check if message starts with !playing
    if (!message.content.startsWith('!playing')) return;
    
    // Ignore messages from bots
    if (message.author.bot) return;
    
    // Split the message into parts
    const args = message.content.split(' ');
    
    // Check if the command has enough arguments
    if (args.length < 2) {
        return message.reply('Usage: !playing <game name>\nAvailable games: ' + 
            PLAYING_PANELS.map(panel => panel.name).join(', '));
    }
    
    // Get the game name (everything after !playing)
    const gameName = args.slice(1).join(' ');
    
    // Find the matching panel
    const selectedPanel = PLAYING_PANELS.find(panel => 
        panel.name.toLowerCase() === gameName.toLowerCase()
    );
    
    // If no matching panel found
    if (!selectedPanel) {
        return message.reply('Game not found. Available games: ' + 
            PLAYING_PANELS.map(panel => panel.name).join(', '));
    }
    
    // Update the playing panel
    client.user.setActivity({
        name: selectedPanel.name,
        type: ActivityType.Playing,
        details: selectedPanel.details
    });
    
    // Confirm the status change
    message.reply(`Now playing: ${selectedPanel.name} (${selectedPanel.details})`);
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
    
    // Set initial playing panel
    client.user.setActivity({
        name: "HBRP",
        type: ActivityType.Playing,
        details: "High Base RP Server"
    });
    
    heartbeat();
});

login();
