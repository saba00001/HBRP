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
const OWNER_IDS = ['1326983284168720505']; // Replace with your Discord ID

// Logging function
function log(type, message, color = '\x1b[37m') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[ ${type} ] ${timestamp}: ${message}\x1b[0m`);
}

// Available activity types
const ACTIVITY_TYPES = {
  PLAYING: ActivityType.Playing,
  STREAMING: ActivityType.Streaming,
  LISTENING: ActivityType.Listening,
  WATCHING: ActivityType.Watching,
  COMPETING: ActivityType.Competing
};

// Update bot status function
function updateBotStatus(status = "Horizon Beyond Server", type = "WATCHING") {
  if (!client.user) {
    log('ERROR', 'client.user is not ready yet!', '\x1b[31m');
    return false;
  }

  try {
    client.user.setPresence({
      activities: [{ 
        name: status, 
        type: ACTIVITY_TYPES[type] || ActivityType.Watching
      }],
      status: 'online',
    });

    log('STATUS', `Bot status set to: ${status} (${type})`, '\x1b[33m');
    return true;
  } catch (error) {
    log('ERROR', `Failed to update status: ${error}`, '\x1b[31m');
    return false;
  }
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

// Bot ready event
client.once('ready', () => {
  log('LOGIN', `Logged in as: ${client.user.tag}`, '\x1b[32m');
  log('INFO', `Bot ID: ${client.user.id}`, '\x1b[35m');
  log('INFO', `Connected to ${client.guilds.cache.size} server(s)`, '\x1b[34m');
  log('INFO', `Ping: ${client.ws.ping} ms`, '\x1b[34m');

  updateBotStatus(); // Set default status
});

// Command to update status
client.on('messageCreate', async (message) => {
  // Check if the message is from an owner
  if (!OWNER_IDS.includes(message.author.id)) return;

  // Check if message starts with a specific prefix
  if (!message.content.startsWith('!status')) return;

  // Split the command into parts
  const args = message.content.slice(7).trim().split(' ');
  
  // If no arguments, show usage
  if (args.length === 0) {
    return message.reply({
      content: 'Usage: !status <type> <message>\n' +
               'Types: PLAYING, STREAMING, LISTENING, WATCHING, COMPETING\n' +
               'Example: !status WATCHING Discord Servers'
    });
  }

  // Determine activity type (first argument)
  const type = args[0].toUpperCase();
  
  // Rest of the arguments become the status message
  const status = args.slice(1).join(' ') || "Horizon Beyond Server";

  // Update status
  const success = updateBotStatus(status, type);
  
  // Respond to the user
  if (success) {
    message.reply(`Status updated to: ${status} (${type})`);
  } else {
    message.reply('Failed to update status. Check console for details.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  log('UNHANDLED REJECTION', error, '\x1b[31m');
});

// Login to Discord
login();
