const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences],
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32mSH : http://localhost:${port} ✅\x1b[0m`);
});

function updateStatus() {
  if (!client.user) return; 

  // Forcefully set the status to override any existing statuses
  client.user.setPresence({
    activities: [{ name: "HBRP", type: ActivityType.Playing }],
    status: 'online',
    afk: false
  });

  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: Playing HBRP`);
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

function setStatusInterval() {
  // More aggressive status update interval
  setInterval(() => {
    updateStatus();
  }, 2000); // Every 2 seconds to ensure status remains consistent
}

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);

  // Immediately set and then continuously maintain the status
  updateStatus();
  setStatusInterval();
  heartbeat();
});

// Add event listener to handle potential status changes by other bots
client.on('presenceUpdate', (oldPresence, newPresence) => {
  // Check if the presence update is for a bot
  if (newPresence.user.bot) {
    updateStatus(); // Immediately reset status if another bot tries to change it
  }
});

async function login() {
  try {
    await client.login(process.env.TOKEN);
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
    process.exit(1);
  }
}

login();
