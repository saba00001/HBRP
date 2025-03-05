const { Client, GatewayIntentBits, ActivityType, ChannelType } = require('discord.js');
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

// Owner's Discord user ID (replace with your actual Discord user ID)
const OWNER_ID = '1326983284168720505';

const statusMessages = ["🚫 ყველა შეტყობინება გამორთულია", "⛔ კომუნიკაცია შეზღუდულია"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

async function safeDelete(message) {
  try {
    if (message && message.deletable) {
      await message.delete();
    }
  } catch (error) {
    console.error('Error deleting message:', error);
  }
}

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

// Completely block all messages and interactions
client.on('messageCreate', async (message) => {
  // Block all messages in any context (DM or Server)
  if (message.author.id !== OWNER_ID) {
    try {
      // If not in DM, try to delete the message
      if (message.channel.type !== ChannelType.DM) {
        await safeDelete(message);
      }

      // Send a blocking message
      const blockMessage = await message.reply("⛔ შეტყობინებები გამორთულია. / Messages are disabled.");
      
      // Delete the block message after 3 seconds
      setTimeout(() => {
        safeDelete(blockMessage).catch(console.error);
      }, 3000);
    } catch (error) {
      console.error('Error handling blocked message:', error);
    }
    return;
  }
});

// Block all interactions completely
client.on('interactionCreate', async (interaction) => {
  // Block interactions for non-owner
  if (interaction.user.id !== OWNER_ID) {
    try {
      await interaction.reply({ 
        content: "⛔ ურთიერთქმედება გამორთულია / Interactions are disabled", 
        ephemeral: true 
      });
    } catch (error) {
      console.error('Error handling interaction:', error);
    }
    return;
  }
});

// Only allow owner commands in server
client.on('messageCreate', async (message) => {
  // Ignore messages from non-owners
  if (message.author.id !== OWNER_ID) return;

  // Owner-only commands can be added here if needed
  if (message.content.startsWith('!owner')) {
    // Example owner command
    message.reply('👑 Owner command recognized');
  }
});

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
});

login();
