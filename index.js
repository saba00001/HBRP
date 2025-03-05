const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();

// Bot configuration
const config = {
  ownerId: '1326983284168720505', // Replace with your Discord user ID
  statusMessages: [
    "🤖 Hi,I am Horizon Beyond Role Play Official Bot"
  ],
  statusTypes: ['online', 'idle', 'dnd']
};

class DiscordBot {
  constructor() {
    // Create client with necessary intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    // Status tracking
    this.currentStatusIndex = 0;
    this.currentTypeIndex = 0;

    // Setup event listeners
    this.setupEventListeners();
  }

  // Safe message deletion method
  async safeDelete(message) {
    try {
      if (message && message.deletable) {
        await message.delete();
      }
    } catch (error) {
      console.error('Message deletion error:', error);
    }
  }

  // Update bot status method
  updateStatus() {
    const currentStatus = config.statusMessages[this.currentStatusIndex];
    const currentType = config.statusTypes[this.currentTypeIndex];

    this.client.user.setPresence({
      activities: [{ 
        name: currentStatus, 
        type: ActivityType.Custom 
      }],
      status: currentType
    });

    console.log(
      '\x1b[33m[ STATUS ]\x1b[0m', 
      `Updated status: ${currentStatus} (${currentType})`
    );

    // Cycle through status messages and types
    this.currentStatusIndex = (this.currentStatusIndex + 1) % config.statusMessages.length;
    this.currentTypeIndex = (this.currentTypeIndex + 1) % config.statusTypes.length;
  }

  // Setup event listeners
  setupEventListeners() {
    // Ready event
    this.client.once('ready', () => {
      console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mBot Online: ${this.client.user.tag} \x1b[0m`);
      console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${this.client.ws.ping} ms \x1b[0m`);
      console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mServers: ${this.client.guilds.cache.size} \x1b[0m`);

      // Initial status update and periodic status rotation
      this.updateStatus();
      setInterval(() => this.updateStatus(), 15000);

      // Heartbeat logging
      setInterval(() => {
        console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot active at ${new Date().toLocaleTimeString()}`);
      }, 30000);
    });

    // Message handling
    this.client.on('messageCreate', async (message) => {
      // Ignore DM and bot messages
      if (message.author.bot || message.channel.type === 'DM') return;

      // Check if the user is the owner
      const isOwner = message.author.id === config.ownerId;

      // !sms command (send message in current channel)
      if (message.content.startsWith('!sms ')) {
        if (!isOwner) {
          const deniedMsg = await message.reply('❌ Only bot owner can use this command.');
          setTimeout(() => this.safeDelete(deniedMsg), 3000);
          return;
        }

        const smsText = message.content.slice(5).trim();
        if (!smsText) {
          const invalidMsg = await message.reply('❌ Please provide message text.');
          setTimeout(() => this.safeDelete(invalidMsg), 3000);
          return;
        }

        try {
          await this.safeDelete(message);
          await message.channel.send(smsText);
        } catch (error) {
          console.error('SMS send error:', error);
          const errorMsg = await message.channel.send('❌ Failed to send message.');
          setTimeout(() => this.safeDelete(errorMsg), 3000);
        }
      }

      // !send command (send message to specific channel)
      if (message.content.startsWith('!send ')) {
        if (!isOwner) {
          const deniedMsg = await message.reply('❌ Only bot owner can use this command.');
          setTimeout(() => this.safeDelete(deniedMsg), 3000);
          return;
        }

        const parts = message.content.slice(6).trim().split(' ');
        if (parts.length < 2) {
          const usageMsg = await message.reply('❌ Usage: !send [channel] [message]');
          setTimeout(() => this.safeDelete(usageMsg), 3000);
          return;
        }

        const channelName = parts[0];
        const smsText = parts.slice(1).join(' ');

        const targetChannel = message.guild.channels.cache.find(
          channel => channel.name.toLowerCase() === channelName.toLowerCase()
        );

        if (!targetChannel) {
          const notFoundMsg = await message.reply(`❌ Channel #${channelName} not found.`);
          setTimeout(() => this.safeDelete(notFoundMsg), 3000);
          return;
        }

        try {
          await this.safeDelete(message);
          await targetChannel.send(smsText);
        } catch (error) {
          console.error('Channel message send error:', error);
          const failedMsg = await message.channel.send('❌ Failed to send message.');
          setTimeout(() => this.safeDelete(failedMsg), 3000);
        }
      }
    });
  }

  // Login method
  async login() {
    try {
      await this.client.login(process.env.TOKEN);
    } catch (error) {
      console.error('\x1b[31m[ LOGIN ERROR ]\x1b[0m', error);
      process.exit(1);
    }
  }
}

// Initialize and start the bot
const bot = new DiscordBot();
bot.login();
