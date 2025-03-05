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
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

const statusTypes = {
  watching: ActivityType.Watching,
  playing: ActivityType.Playing,
  listening: ActivityType.Listening,
  streaming: ActivityType.Streaming
};

let forcedStatus = { type: 'playing', message: 'GTA IV Vanguard' };

async function setCustomStatus(type, message) {
  if (!statusTypes[type]) {
    console.log('\x1b[31m[ ERROR ]\x1b[0m', 'Invalid type!');
    return;
  }
  forcedStatus = { type, message };
  await client.user.setPresence({
    activities: [{ name: message, type: statusTypes[type] }],
    status: 'dnd'
  });
  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Set custom status: ${type} ${message}`);
}

function forceStatusLoop() {
  setInterval(() => {
    client.user.setPresence({
      activities: [{ name: forcedStatus.message, type: statusTypes[forcedStatus.type] }],
      status: 'dnd'
    });
    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Forced status reset: ${forcedStatus.message}`);
  }, 3000); // ყოველ 3 წამში აყენებს იძულებით
}

client.on('messageCreate', (message) => {
  if (!message.content.startsWith('!status') || message.author.bot) return;

  const args = message.content.split(' ');
  const type = args[1];
  const text = args.slice(2).join(' ');

  if (!type || !text) {
    return message.reply('⛔ გამოიყენე: **!status [watching|playing|listening] [ტექსტი]**');
  }

  setCustomStatus(type, text);
  message.reply(`✅ სტატუსი შეცვლილია: **${type} ${text}**`);
});

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  setCustomStatus('playing', 'HB:RP');
  forceStatusLoop(); // აქტივიტის იძულებითი განახლება
});

async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
    process.exit(1);
  }
}

login();
