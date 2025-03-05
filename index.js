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

// Owner's Discord user ID (replace with your actual Discord user ID)
const OWNER_ID = '1326983284168720505';

const statusMessages = ["🤖 Hi, I am Horizon Beyond Role Play Official Bot"];
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

client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if the user is the owner
  const isOwner = message.author.id === OWNER_ID;

  // !sms command to send a message in the current channel (only for owner)
  if (message.content.startsWith('!sms ')) {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      // Delete denial message after 3 seconds
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    const smsText = message.content.slice(5).trim();
    if (smsText) {
      try {
        // Delete the original command message
        await safeDelete(message);

        // Send the SMS in the current channel
        const sentMessage = await message.channel.send(smsText);

        // Delete the sent message after a short delay
        setTimeout(() => safeDelete(sentMessage), 5000);
      } catch (error) {
        console.error('Error sending SMS:', error);
        const errorMsg = await message.channel.send('❌ Failed to send SMS.');
        // Delete error message after 3 seconds
        setTimeout(() => safeDelete(errorMsg), 3000);
      }
    } else {
      const invalidMsg = await message.reply('❌ Please provide a message text after !sms');
      // Delete invalid message after 3 seconds
      setTimeout(() => safeDelete(invalidMsg), 3000);
    }
    return;
  }

  // !send command to send a message to a specific channel (only for owner)
  if (message.content.startsWith('!send ')) {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      // Delete denial message after 3 seconds
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    const parts = message.content.slice(6).trim().split(' ');
    if (parts.length < 2) {
      const usageMsg = await message.reply('❌ Usage: !send [channel] [message]');
      // Delete usage message after 3 seconds
      setTimeout(() => safeDelete(usageMsg), 3000);
      return;
    }

    const channelName = parts[0];
    const smsText = parts.slice(1).join(' ');

    // Find the target channel
    const targetChannel = message.guild.channels.cache.find(
      channel => channel.name.toLowerCase() === channelName.toLowerCase()
    );

    if (!targetChannel) {
      const notFoundMsg = await message.reply(`❌ Channel #${channelName} not found.`);
      // Delete not found message after 3 seconds
      setTimeout(() => safeDelete(notFoundMsg), 3000);
      return;
    }

    try {
      // Delete the original command message
      await safeDelete(message);

      // Send message to the target channel
      const sentMessage = await targetChannel.send(smsText);

      // Delete the sent message after a short delay
      setTimeout(() => safeDelete(sentMessage), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      const failedMsg = await message.channel.send('❌ Failed to send message. Check bot permissions.');
      // Delete failed message after 3 seconds
      setTimeout(() => safeDelete(failedMsg), 3000);
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
