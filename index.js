const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32mSH : http://localhost:${port} ✅\x1b[0m`);
});

const statusMessages = ["🎧 Listening to Spotify", "🎮 Playing VALORANT", "🛠️ Developing Vanguard"];
const statusTypes = ['dnd', 'idle', 'online'];
let currentIndex = 0;

function updateStatus() {
  client.user.setPresence({
    activities: [{ name: statusMessages[currentIndex], type: ActivityType.Playing }],
    status: statusTypes[currentIndex],
  });

  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${statusMessages[currentIndex]} (${statusTypes[currentIndex]})`);

  currentIndex = (currentIndex + 1) % statusMessages.length; // ცვლის სტატუსს ციკლურად
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
  
  updateStatus();
  setInterval(updateStatus, 30000); // სტატუსის განახლება ყოველ 30 წამში
  heartbeat();
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
