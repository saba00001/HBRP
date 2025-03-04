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

    // Change About Me
    if (message.content.startsWith('!aboutme')) {
      const newAboutMe = message.content.slice(8).trim();
      
      if (!newAboutMe) {
        return message.reply('Please provide an About Me description');
      }

      try {
        await client.user.setProfile({ bio: newAboutMe });
        message.reply(`About Me updated to: "${newAboutMe}"`);
        log('PROFILE', `About Me changed to: ${newAboutMe}`, '\x1b[33m');
      } catch (error) {
        log('ERROR', `Failed to update About Me: ${error}`, '\x1b[31m');
        message.reply('Failed to update About Me');
      }
    }

    // Change Playing status
    if (message.content.startsWith('!playing')) {
      const newPlayingStatus = message.content.slice(8).trim();
      
      if (!newPlayingStatus) {
        return message.reply('Please provide a playing status');
      }

      try {
        client.user.setActivity({
          name: newPlayingStatus,
          type: ActivityType.Playing
        });

        message.reply(`Playing status updated to: "${newPlayingStatus}"`);
        log('STATUS', `Playing status changed to: ${newPlayingStatus}`, '\x1b[33m');
      } catch (error) {
        log('ERROR', `Failed to update playing status: ${error}`, '\x1b[31m');
        message.reply('Failed to update playing status');
      }
    }
  });
}

// Bot ready event
client.once('ready', () => {
  log('INFO', `Ping: ${client.ws.ping} ms`, '\x1b[34m');
  
  // Set initial playing status
  setPlayingStatus();
  
  // Start heartbeat
  startHeartbeat();
  
  // Setup message commands
  setupMessageCommands();

  // Set initial About Me
  client.user.setProfile({ bio: BOT_ABOUT_ME })
    .then(() => log('PROFILE', `About Me set to: ${BOT_ABOUT_ME}`, '\x1b[35m'))
    .catch(error => log('ERROR', `Failed to set About Me: ${error}`, '\x1b[31m'));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  log('UNHANDLED REJECTION', error, '\x1b[31m');
});

// Login to Discord
login();
