const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  EmbedBuilder, 
  PermissionFlagsBits 
} = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus 
} = require('@discordjs/voice');
const tts = require('discord-tts');

const app = express();
const port = 3000;

// ბოტის კონფიგურაცია
const BOT_CONFIG = {
  name: 'Horizon Beyond Bot',
  version: '2.1.0',
  creator: 'sabbsaa',
  description: 'ულტრა მრავალფუნქციური Discord ბოტი'
};

// ბოტის ინტენტები
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// About Me ტექსტი
const ABOUT_ME = `
🤖 ${BOT_CONFIG.name} - ოფიციალური ბოტი

✨ მთავარი შესაძლებლობები:
• მრავალფუნქციური სერვერის მართვა
• ინტელექტუალური კომუნიკაცია
• დინამიური ინტერაქციები

👨‍💻 შემქმნელი: ${BOT_CONFIG.creator}
🌐 ვერსია: ${BOT_CONFIG.version}
`;

// სტატუსის შეტყობინებები
const statusMessages = [
  "🌐 Horizon Beyond RP-ში",
  "🤖 ბოტის რეჟიმში",
  "📊 სერვერებს ვემსახურები",
  "🎮 თამაშის მხარდაჭერა",
  "💻 ჩართული და მზად",
  "🌈 ინტერაქციული გამოცდილება"
];

const statusTypes = ['online', 'idle', 'dnd'];

let currentStatusIndex = 0;
let currentTypeIndex = 0;

// ვებ სერვერი
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${BOT_CONFIG.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background-color: #2c3e50; 
            color: #ecf0f1; 
            text-align: center;
            padding: 50px;
          }
          pre {
            background-color: #34495e;
            color: #1abc9c;
            padding: 20px;
            border-radius: 10px;
            display: inline-block;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <h1>🤖 ${BOT_CONFIG.name}</h1>
        <pre>${createASCIIArt()}</pre>
        <p>ბოტი მზადაა მუშაობისთვის!</p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32m SH : http://localhost:${port} ✅\x1b[0m`);
});

// ASCII ხელოვნების შექმნის ფუნქცია
function createASCIIArt() {
  return `
╔═══════════════════════════════════════╗
║   🌟 ${BOT_CONFIG.name} 🌟            ║
║                                       ║
║   Created by: ${BOT_CONFIG.creator}   ║
║   Version: ${BOT_CONFIG.version}      ║
╚═══════════════════════════════════════╝
  `;
}

// სტატუსის განახლების ფუნქცია
function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];
  const currentType = statusTypes[currentTypeIndex];
  
  client.user.setPresence({
    activities: [{ 
      name: currentStatus, 
      type: ActivityType.Custom 
    }],
    status: currentType,
  });

  console.log('\x1b[33m[ STATUS ]\x1b[0m', `სტატუსი განახლდა: ${currentStatus} (${currentType})`);
  
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

// ავტორიზაციის ფუნქცია
async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mშესვლა წარმატებით განხორციელდა: ${client.user.tag} ✅\x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mბოტის ID: ${client.user.id} \x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mმიერთებული სერვერები: ${client.guilds.cache.size} \x1b[0m`);
  } catch (error) {
    console.error('\x1b[31m[ ᲨᲔᲪᲓᲝᲛᲐ ]\x1b[0m', 'ავტორიზაციის შეცდომა:', error);
    process.exit(1);
  }
}

// Heartbeat ფუნქცია
function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `ბოტი აქტიურია: ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

// Slash კომანდების რეგისტრაცია
client.on('ready', async () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  console.log(createASCIIArt());
  
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();

  // Slash კომანდების შექმნა
  const guild = client.guilds.cache.first();
  
  // About Me კომანდა
  await guild.commands.create({
    name: 'aboutme',
    description: 'ბოტის შესახებ ინფორმაცია'
  });

  // Say Text კომანდა
  await guild.commands.create({
    name: 'saytext',
    description: 'გაგზავნეთ ტექსტი არხში (მხოლოდ მფლობელს)',
    options: [
      {
        name: 'message',
        type: 3, // STRING
        description: 'გასაგზავნი ტექსტი',
        required: true
      },
      {
        name: 'channel',
        type: 7, // CHANNEL
        description: 'არხი სადაც გაიგზავნება (არჩევითი)',
        required: false
      }
    ]
  });

  // Speak კომანდა
  await guild.commands.create({
    name: 'speak',
    description: 'ბოტი საუბრობს ხმოვან არხში (მხოლოდ მფლობელს)',
    options: [
      {
        name: 'message',
        type: 3, // STRING
        description: 'სათქმელი ტექსტი',
        required: true
      }
    ]
  });
});

// ინტერაქციების დამუშავება
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  // About Me კომანდა
  if (interaction.commandName === 'aboutme') {
    const aboutEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🤖 Horizon Beyond Bot - About Me')
      .setDescription(ABOUT_ME)
      .setFooter({ text: 'ოფიციალური ბოტი' });

    await interaction.reply({ embeds: [aboutEmbed] });
  }

  // Say Text კომანდა
  if (interaction.commandName === 'saytext') {
    // შეამოწმეთ არის თუ არა მომხმარებელი ბოტის მფლობელი
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({ 
        content: '❌ ამ ბრძანების გამოყენების უფლება მხოლოდ ბოტის მფლობელს აქვს!', 
        ephemeral: true 
      });
    }

    const text = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await channel.send(text);
    await interaction.reply({ 
      content: '✅ შეტყობინება წარმატებით გაიგზავნა!', 
      ephemeral: true 
    });
  }

  // Speak კომანდა
  if (interaction.commandName === 'speak') {
    // შეამოწმეთ არის თუ არა მომხმარებელი ბოტის მფლობელი
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({ 
        content: '❌ ბოტში საუბრის უფლება მხოლოდ მფლობელს აქვს!', 
        ephemeral: true 
      });
    }

    const text = interaction.options.getString('message');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ 
        content: '❌ ჯერ ხმოვან არხში შესვლა გსურთ!', 
        ephemeral: true 
      });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const audioResource = createAudioResource(tts.getAudioUrl(text, { lang: 'ka' }));

      player.play(audioResource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      await interaction.editReply('✅ ხმოვან არხში საუბარი დაიწყო!');
    } catch (error) {
      console.error('Voice error:', error);
      await interaction.editReply('❌ ხმოვან არხში საუბრის დროს შეცდომა წარმოიშვა.');
    }
  }
});

// ავტომატური პასუხები
client.on('messageCreate', (message) => {
  // თუ ბოტს მოახსენებენ
  if (message.mentions.has(client.user)) {
    message.reply('გამარჯობა! რით შემიძლია დაგეხმაროთ? 🤖');
  }
});

// ლოგინი
login();

// დაუმუშავებელი შეცდომების დაჭერა
process.on('unhandledRejection', (error) => {
  console.error('დაუმუშავებელი შეცდომა:', error);
});
