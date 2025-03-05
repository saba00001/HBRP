const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages // Added to enable DM functionality
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

// Store the last sent command message to prevent duplicate sending
let lastCommandMessage = null;

// Conversations will be stored here with more detailed information
const conversationMap = new Map();

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

  // Handle direct messages to the bot
  if (message.channel.type === 'DM') {
    // Ensure the conversation exists in the map
    if (!conversationMap.has(message.author.id)) {
      conversationMap.set(message.author.id, {
        userTag: message.author.tag,
        messages: []
      });
    }

    // Get the conversation for this user
    const userConversation = conversationMap.get(message.author.id);

    // Add the new message to the conversation
    userConversation.messages.push({
      timestamp: new Date(),
      content: message.content,
      author: 'User'
    });

    // Notify the owner about the new message
    const ownerUser = await client.users.fetch(OWNER_ID);
    
    // Prepare a formatted conversation history
    const conversationHistory = userConversation.messages
      .map(msg => `${msg.timestamp.toLocaleString()} - ${msg.author}: ${msg.content}`)
      .join('\n');

    const formattedMessage = `📩 **New DM from ${message.author.tag}**\n\`\`\`\nCONVERSATION HISTORY:\n${conversationHistory}\n\n--- NEW MESSAGE ---\n${message.content}\n\`\`\`\nReply using: !reply ${message.author.id} [your message]`;
    
    await ownerUser.send(formattedMessage);

    return;
  }

  // !conversations command to view all ongoing conversations
  if (message.content === '!conversations') {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    // Prepare conversation list
    let conversationList = 'ONGOING CONVERSATIONS:\n';
    if (conversationMap.size === 0) {
      conversationList += 'No active conversations.';
    } else {
      for (const [userId, conversation] of conversationMap.entries()) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        conversationList += `\n👤 ${conversation.userTag} (ID: ${userId})\n`;
        conversationList += `   Last Message: ${lastMessage.content}\n`;
        conversationList += `   At: ${lastMessage.timestamp.toLocaleString()}\n`;
      }
    }

    // Send the conversation list
    await message.channel.send(`\`\`\`\n${conversationList}\n\`\`\``);
    return;
  }

  // !viewconvo command to view a specific conversation
  if (message.content.startsWith('!viewconvo ')) {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    const userId = message.content.slice(11).trim();
    
    // Check if conversation exists
    if (!conversationMap.has(userId)) {
      const notFoundMsg = await message.reply(`❌ No conversation found with user ID ${userId}`);
      setTimeout(() => safeDelete(notFoundMsg), 3000);
      return;
    }

    // Get the conversation
    const userConversation = conversationMap.get(userId);
    
    // Prepare detailed conversation history
    const conversationHistory = userConversation.messages
      .map(msg => `${msg.timestamp.toLocaleString()} - ${msg.author}: ${msg.content}`)
      .join('\n');

    // Send the conversation history
    await message.channel.send(`📬 Conversation with ${userConversation.userTag} (ID: ${userId}):\n\`\`\`\n${conversationHistory}\n\`\`\``);
    return;
  }

  // !reply command to respond to a DM (only for owner)
  if (message.content.startsWith('!reply ')) {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    const parts = message.content.slice(7).trim().split(' ');
    if (parts.length < 2) {
      const usageMsg = await message.reply('❌ Usage: !reply [user_id] [message]');
      setTimeout(() => safeDelete(usageMsg), 3000);
      return;
    }

    const userId = parts[0];
    const replyText = parts.slice(1).join(' ');

    try {
      // Fetch the user
      const user = await client.users.fetch(userId);

      if (!user) {
        const notFoundMsg = await message.reply(`❌ User with ID ${userId} not found.`);
        setTimeout(() => safeDelete(notFoundMsg), 3000);
        return;
      }

      // Ensure the conversation exists in the map
      if (!conversationMap.has(userId)) {
        conversationMap.set(userId, {
          userTag: user.tag,
          messages: []
        });
      }

      // Get the conversation for this user
      const userConversation = conversationMap.get(userId);

      // Add the reply to the conversation
      userConversation.messages.push({
        timestamp: new Date(),
        content: replyText,
        author: 'Bot Owner'
      });

      // Send direct message
      await user.send(replyText);

      // Delete the original command message
      await safeDelete(message);

      // Optional: Send a confirmation to the owner in the original channel
      const confirmMsg = await message.channel.send(`✅ Reply sent to user ${user.tag}`);
      setTimeout(() => safeDelete(confirmMsg), 3000);

    } catch (error) {
      console.error('Error sending reply:', error);
      const failedMsg = await message.channel.send('❌ Failed to send reply. Check user ID and bot permissions.');
      setTimeout(() => safeDelete(failedMsg), 3000);
    }
    return;
  }

  // !dm command to send a direct message (only for owner)
  if (message.content.startsWith('!dm ')) {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    const parts = message.content.slice(4).trim().split(' ');
    if (parts.length < 2) {
      const usageMsg = await message.reply('❌ Usage: !dm [user_id] [message]');
      setTimeout(() => safeDelete(usageMsg), 3000);
      return;
    }

    const userId = parts[0];
    const dmText = parts.slice(1).join(' ');

    try {
      // Attempt to fetch the user
      const user = await client.users.fetch(userId);

      if (!user) {
        const notFoundMsg = await message.reply(`❌ User with ID ${userId} not found.`);
        setTimeout(() => safeDelete(notFoundMsg), 3000);
        return;
      }

      // Send direct message
      await user.send(dmText);

      // Delete the original command message
      await safeDelete(message);

      // Optional: Send a confirmation to the owner in the original channel
      const confirmMsg = await message.channel.send(`✅ DM sent to user ${user.tag}`);
      setTimeout(() => safeDelete(confirmMsg), 3000);

    } catch (error) {
      console.error('Error sending DM:', error);
      const failedMsg = await message.channel.send('❌ Failed to send DM. Check user ID and bot permissions.');
      setTimeout(() => safeDelete(failedMsg), 3000);
    }
    return;
  }

  // !sms command to send a message in the current channel (only for owner)
  if (message.content.startsWith('!sms ')) {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    const smsText = message.content.slice(5).trim();
    if (smsText) {
      try {
        // Prevent duplicate sending by checking the last command message
        if (lastCommandMessage && lastCommandMessage.content === message.content) {
          const duplicateMsg = await message.reply('❌ Message already sent. Duplicate prevented.');
          setTimeout(() => safeDelete(duplicateMsg), 3000);
          return;
        }

        // Update the last command message
        lastCommandMessage = message;

        // Delete only the original command message
        await safeDelete(message);

        // Send the SMS in the current channel (this message will remain)
        await message.channel.send(smsText);
      } catch (error) {
        console.error('Error sending SMS:', error);
        const errorMsg = await message.channel.send('❌ Failed to send SMS.');
        setTimeout(() => safeDelete(errorMsg), 3000);
      }
    } else {
      const invalidMsg = await message.reply('❌ Please provide a message text after !sms');
      setTimeout(() => safeDelete(invalidMsg), 3000);
    }
    return;
  }

  // !send command to send a message to a specific channel (only for owner)
  if (message.content.startsWith('!send ')) {
    // Check owner permissions
    if (!isOwner) {
      const deniedMsg = await message.reply('❌ Only the bot owner can use this command.');
      setTimeout(() => safeDelete(deniedMsg), 3000);
      return;
    }

    const parts = message.content.slice(6).trim().split(' ');
    if (parts.length < 2) {
      const usageMsg = await message.reply('❌ Usage: !send [channel] [message]');
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
      setTimeout(() => safeDelete(notFoundMsg), 3000);
      return;
    }

    try {
      // Prevent duplicate sending by checking the last command message
      if (lastCommandMessage && lastCommandMessage.content === message.content) {
        const duplicateMsg = await message.reply('❌ Message already sent. Duplicate prevented.');
        setTimeout(() => safeDelete(duplicateMsg), 3000);
        return;
      }

      // Update the last command message
      lastCommandMessage = message;

      // Delete the original command message
      await safeDelete(message);

      // Send message to the target channel
      await targetChannel.send(smsText);
    } catch (error) {
      console.error('Error sending message:', error);
      const failedMsg = await message.channel.send('❌ Failed to send message. Check bot permissions.');
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
