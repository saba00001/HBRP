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

// Configuration for bot's about me and activities
const botConfig = {
  aboutMe: "Horizon Beyond Role Play Official Bot - Your ultimate companion for immersive roleplay experiences! Created by sabbsaa with love and dedication.",
  statusMessages: [
    "Exploring Roleplay Universes",
    "Creating Epic Storylines",
    "Connecting Roleplayers Worldwide",
    "Bringing Imagination to Life"
  ],
  statusTypes: [
    { type: ActivityType.Playing, name: "Roleplay Simulator" },
    { type: ActivityType.Watching, name: "Character Stories" },
    { type: ActivityType.Competing, name: "Narrative Challenges" },
    { type: ActivityType.Streaming, name: "Roleplay Adventures" }
  ]
};

let currentStatusIndex = 0;

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
  const currentStatus = botConfig.statusMessages[currentStatusIndex];
  const currentStatusType = botConfig.statusTypes[currentStatusIndex];
  
  client.user.setPresence({
    activities: [{ 
      name: currentStatus, 
      type: currentStatusType.type 
    }],
    status: 'online',
  });
  
  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentStatusType.type})`);
  
  currentStatusIndex = (currentStatusIndex + 1) % botConfig.statusMessages.length;
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

client.once('ready', async () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  
  // Set bot's about me (bio)
  try {
    await client.user.edit({
      bio: botConfig.aboutMe
    });
    console.log('\x1b[36m[ PROFILE ]\x1b[0m', '\x1b[32mBot profile updated successfully! ✅\x1b[0m');
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to update bot profile:', error);
  }
  
  updateStatus();
  setInterval(updateStatus, 15000);
  heartbeat();
});

// Message spoofing functionality
client.on('messageCreate', async (message) => {
  // Check if the message starts with a specific command to send a spoofed message
  if (message.content.startsWith('!spoofmessage')) {
    // Split the command to get the message to spoof
    const spoofMessage = message.content.slice('!spoofmessage'.length).trim();
    
    if (spoofMessage) {
      // Send the spoofed message in the same channel
      await message.channel.send(spoofMessage);
      
      // Optionally, delete the original command message
      await message.delete();
    } else {
      message.reply('Please provide a message to spoof. Usage: !spoofmessage Your message here');
    }
  }
});

login();
