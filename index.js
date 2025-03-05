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

// Store temporary SMS messages
const smsMessages = new Map();

const statusMessages = ["🤖 Hi, I am Horizon Beyond Role Play Official Bot"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

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

function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];
  const currentType = statusTypes[currentTypeIndex];
  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Custom }],
    status: currentType,
  });
  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // !sms command to store a temporary SMS message
  if (message.content.startsWith('!sms ')) {
    const smsText = message.content.slice(5).trim();
    if (smsText) {
      smsMessages.set(message.author.id, smsText);
      message.reply(`✉️ SMS message saved. Use !send [channel] to send it.`);
    } else {
      message.reply('❌ Please provide a message text after !sms');
    }
    return;
  }

  // !send command to send the stored SMS to a specific channel
  if (message.content.startsWith('!send ')) {
    const parts = message.content.slice(6).trim().split(' ');
    if (parts.length < 2) {
      message.reply('❌ Usage: !send [channel] [optional additional text]');
      return;
    }

    const channelName = parts[0];
    const additionalText = parts.slice(1).join(' ');

    // Check if user has a stored SMS
    const storedSms = smsMessages.get(message.author.id);
    if (!storedSms) {
      message.reply('❌ No SMS message saved. Use !sms to save a message first.');
      return;
    }

    // Find the target channel
    const targetChannel = message.guild.channels.cache.find(
      channel => channel.name.toLowerCase() === channelName.toLowerCase()
    );

    if (!targetChannel) {
      message.reply(`❌ Channel #${channelName} not found.`);
      return;
    }

    // Combine stored SMS with additional text if provided
    const finalMessage = additionalText 
      ? `${storedSms}\n\n${additionalText}` 
      : storedSms;

    try {
      await targetChannel.send(finalMessage);
      message.reply(`✅ Message sent to #${channelName}`);
      
      // Clear the stored SMS after sending
      smsMessages.delete(message.author.id);
    } catch (error) {
      console.error('Error sending message:', error);
      message.reply('❌ Failed to send message. Check bot permissions.');
    }
    return;
  }
});

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});

login();
