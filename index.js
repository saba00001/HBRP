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

client.on('messageCreate', async (message) => {
    // Check if the message starts with the activity command
    if (message.content.startsWith('!activity')) {
        // Check if the user has permissions to change the activity
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have permission to change the bot\'s activity.');
        }

        // Extract the activity text
        const activityText = message.content.slice('!activity'.length).trim();
        
        if (!activityText) {
            return message.reply('Please provide an activity text. Usage: !activity <text>');
        }

        try {
            // Set the bot's activity
            client.user.setActivity({
                name: activityText,
                type: ActivityType.Playing
            });

            message.reply(`Bot activity set to: Playing ${activityText}`);
        } catch (error) {
            console.error('Error setting activity:', error);
            message.reply('Failed to set activity.');
        }
    }
});

client.once('ready', () => {
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
    heartbeat();
});

login();
