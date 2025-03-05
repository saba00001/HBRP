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

// Default initial status
const DEFAULT_STATUS = {
    name: "VALORANT",
    type: ActivityType.Playing
};

// Replace with YOUR Discord User ID 
const OWNER_ID = process.env.1326983284168720505;

const STATUS_TYPES = {
    play: ActivityType.Playing,
    listen: ActivityType.Listening,
    watch: ActivityType.Watching,
    compete: ActivityType.Competing
};

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

function setCustomStatus(game, type = 'play') {
    const activityType = STATUS_TYPES[type] || ActivityType.Playing;
    
    client.user.setPresence({
        activities: [{ 
            name: game, 
            type: activityType 
        }],
        status: 'online',
    });
    
    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${game} (${type})`);
    return `Status updated to ${type} ${game}`;
}

// Event listener for status change command
client.on('messageCreate', message => {
    // Check if the message starts with !status
    if (!message.content.startsWith('!status')) return;
    
    // Prevent usage in DMs
    if (!message.guild) return;
    
    // Check if the message author is the bot owner
    if (message.author.id !== OWNER_ID) {
        return message.reply('ამ კომანდის გამოყენების უფლება გაქვს მხოლოდ ბოტის მფლობელს.');
    }
    
    // Parse the command
    const args = message.content.slice('!status'.length).trim().split(/ +/);
    
    // If no arguments, show current status
    if (args.length === 0) {
        const currentActivity = client.user.presence.activities[0];
        return message.reply(`Current status: ${currentActivity ? `${currentActivity.type} ${currentActivity.name}` : 'No status set'}`);
    }
    
    // Determine type (optional)
    let type = 'play';
    let statusText = args.join(' ');
    
    // Check if first argument is a valid status type
    if (Object.keys(STATUS_TYPES).includes(args[0])) {
        type = args[0];
        statusText = args.slice(1).join(' ');
    }
    
    // Validate status text
    if (!statusText) {
        return message.reply('გთხოვთ შეიყვანოთ სტატუსის ტექსტი.');
    }
    
    // Set the status
    const response = setCustomStatus(statusText, type);
    message.reply(response);
});

client.once('ready', () => {
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
    
    // Set initial default status
    setCustomStatus(DEFAULT_STATUS.name, Object.keys(STATUS_TYPES).find(key => STATUS_TYPES[key] === DEFAULT_STATUS.type));
});

login();
