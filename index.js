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
const OWNER_IDS = ['1326983284168720505']; // შეცვალე შენი Discord ID-ით
const BOT_ACTIVITY_STATUS = "Horizon Beyond Server";

// Logging function
function log(type, message, color = '\x1b[37m') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[ ${type} ] ${timestamp}: ${message}\x1b[0m`);
}

// Update bot status function (გასწორებული)
function updateBotStatus() {
  if (!client.user) {
    log('ERROR', 'client.user is not ready yet!', '\x1b[31m');
    return;
  }

  client.user.setPresence({
    activities: [{ 
      name: BOT_ACTIVITY_STATUS, 
      type: ActivityType.Playing  // შეცვლილია Watching-ზე
    }],
    status: 'online',
  });

  log('STATUS', `Bot status set to: ${BOT_ACTIVITY_STATUS}`, '\x1b[33m');
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

// Bot ready event (ახლა სტატუსი აქაა, რომ client.user უკვე მზად იყოს)
client.once('ready', () => {
  log('LOGIN', `Logged in as: ${client.user.tag}`, '\x1b[32m');
  log('INFO', `Bot ID: ${client.user.id}`, '\x1b[35m');
  log('INFO', `Connected to ${client.guilds.cache.size} server(s)`, '\x1b[34m');
  log('INFO', `Ping: ${client.ws.ping} ms`, '\x1b[34m');

  updateBotStatus(); // აქედან იძახება, რომ 100% იმუშაოს!
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  log('UNHANDLED REJECTION', error, '\x1b[31m');
});

// Login to Discord
login();
