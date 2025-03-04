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
const OWNER_IDS = ['1326983284168720505']; // Replace with your Discord User ID
const BOT_ABOUT_ME = "Horizon Beyond Role Play Official Bot";
const BOT_ACTIVITY_STATUS = "🎮 Playing Horizon Beyond Role Play";

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
  } catch (error) {
    log('ERROR', `Failed to log in: ${error}`, '\x1b[31m');
    process.exit(1);
  }
}

// Update bot status function
function updateBotStatus() {
  client.user.setPresence({
    activities: [{ 
      name: BOT_ACTIVITY_STATUS, 
      type: ActivityType.Custom 
    }],
    status: 'online',
  });
  log('STATUS', `Bot status set to: ${BOT_ACTIVITY_STATUS}`);
}

// Heartbeat function to keep bot alive
function startHeartbeat() {
  setInterval(() => {
    log('HEARTBEAT', 'Bot is alive', '\x1b[36m');
  }, 30000);
}

// Message sending command
function setupMessageCommands() {
  client.on('messageCreate', async (message) => {
    // Check if the message is from an owner
    if (!OWNER_IDS.includes(message.author.id)) return;

    // Send message to a specific channel
    if (message.content.startsWith('!sms')) {
      // Split the message into parts
      const parts = message.content.split(' ');
      
      // Check if the command has at least 3 parts (command, channel, message)
      if (parts.length < 3) {
        return message.reply('Usage: !sms #channel Your message here');
      }

      // Extract the channel mention
      const channelMention = parts[1];
      
      // Remove the channel mention from parts and rejoin the rest as the message
      const messageText = parts.slice(2).join(' ');

      // Find the channel by its mention
      const channel = message.mentions.channels.first();
      
      if (!channel) {
        return message.reply('Invalid channel. Please use a channel mention.');
      }

      try {
        // Send the message to the specified channel
        await channel.send(messageText);
        
        // Confirm the message was sent
        await message.reply(`Message sent to ${channel}`);
        log('SMS', `Message sent to ${channel.name}`, '\x1b[33m');
      } catch (error) {
        log('ERROR', `Failed to send SMS: ${error}`, '\x1b[31m');
        await message.reply('Failed to send the message.');
      }
    }

    // Change activity status
    if (message.content.startsWith('!activity')) {
      const newActivityStatus = message.content.slice(9).trim();
      
      if (!newActivityStatus) {
        return message.reply('Please provide an activity status');
      }

      try {
        client.user.setPresence({
          activities: [{ 
            name: newActivityStatus, 
            type: ActivityType.Custom 
          }],
          status: 'online',
        });

        message.reply(`Activity status updated to: "${newActivityStatus}"`);
        log('STATUS', `Activity status changed to: ${newActivityStatus}`, '\x1b[33m');
      } catch (error) {
        log('ERROR', `Failed to update activity status: ${error}`, '\x1b[31m');
        message.reply('Failed to update activity status');
      }
    }
  });
}

// Bot ready event
client.once('ready', () => {
  log('INFO', `Ping: ${client.ws.ping} ms`, '\x1b[34m');
  
  // Set initial status
  updateBotStatus();
  
  // Start heartbeat
  startHeartbeat();
  
  // Setup message commands
  setupMessageCommands();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  log('UNHANDLED REJECTION', error, '\x1b[31m');
});

// Login to Discord
login();
