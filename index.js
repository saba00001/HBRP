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
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

// Configuration
const OWNER_IDS = ['1326983284168720505']; // შენი Discord ID ჩასვი აქ
const BOT_ABOUT_ME = "Horizon Beyond Role Play Official Bot";
const BOT_ACTIVITY_STATUS = "Horizon Beyond Server";

// Logging function
function log(type, message, color = '\x1b[37m') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[ ${type} ] ${timestamp}: ${message}\x1b[0m`);
}

// Login function
async function login() {
  try {
    await client.login(process.env.TOKEN);
  } catch (error) {
    log('ERROR', `Failed to log in: ${error}`, '\x1b[31m');
    process.exit(1);
  }
}

// Update bot status function
function updateBotStatus() {
  if (client.user) {
    client.user.setPresence({
      activities: [{ 
        name: BOT_ACTIVITY_STATUS, 
        type: ActivityType.Watching  // შეცვლილია Custom -> Watching
      }],
      status: 'online',
    });
    log('STATUS', `Bot status set to: ${BOT_ACTIVITY_STATUS}`);
  }
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
    if (!OWNER_IDS.includes(message.author.id)) return;

    if (message.content.startsWith('!sms')) {
      const parts = message.content.split(' ');

      if (parts.length < 3) {
        return message.reply('Usage: !sms #channel Your message here');
      }

      const channel = message.mentions.channels.first() || 
                      message.guild.channels.cache.get(parts[1].replace(/\D/g, ''));

      if (!channel) {
        return message.reply('Invalid channel. Please use a channel mention or ID.');
      }

      const messageText = parts.slice(2).join(' ');

      try {
        await channel.send(messageText);
        await message.reply(`Message sent to ${channel}`);
        log('SMS', `Message sent to ${channel.name}`, '\x1b[33m');
      } catch (error) {
        log('ERROR', `Failed to send SMS: ${error}`, '\x1b[31m');
        await message.reply('Failed to send the message.');
      }
    }

    if (message.content.startsWith('!activity')) {
      const newActivityStatus = message.content.slice(9).trim();
      
      if (!newActivityStatus) {
        return message.reply('Please provide an activity status.');
      }

      try {
        client.user.setPresence({
          activities: [{ 
            name: newActivityStatus, 
            type: ActivityType.Playing  // შეცვლილია Custom -> Playing
          }],
          status: 'online',
        });

        message.reply(`Activity status updated to: "${newActivityStatus}"`);
        log('STATUS', `Activity status changed to: ${newActivityStatus}`, '\x1b[33m');
      } catch (error) {
        log('ERROR', `Failed to update activity status: ${error}`, '\x1b[31m');
        message.reply('Failed to update activity status.');
      }
    }
  });
}

// Bot ready event
client.once('ready', () => {
  log('LOGIN', `Logged in as: ${client.user.tag}`, '\x1b[32m');
  log('INFO', `Bot ID: ${client.user.id}`, '\x1b[35m');
  log('INFO', `Connected to ${client.guilds.cache.size} server(s)`, '\x1b[34m');
  log('INFO', `Ping: ${client.ws.ping} ms`, '\x1b[34m');

  updateBotStatus();
  startHeartbeat();
  setupMessageCommands();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  log('UNHANDLED REJECTION', error, '\x1b[31m');
});

// Login to Discord
login();
