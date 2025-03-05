const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildPresences
  ],
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32mSH : http://localhost:${port} ✅\x1b[0m`);
});

async function setPermanentStatus() {
  try {
    if (!client.user) return;

    // ძლიერი სტატუსის დაყენება
    await client.user.setActivity({
      name: "HBRP",
      type: ActivityType.Playing
    });

    await client.user.setStatus('online');

    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Locked status to: Playing HBRP`);
  } catch (error) {
    console.error('\x1b[31m[ STATUS ERROR ]\x1b[0m', error);
  }
}

function createStatusProtector() {
  const originalSetActivity = client.user.setActivity.bind(client.user);
  const originalSetStatus = client.user.setStatus.bind(client.user);

  client.user.setActivity = async (...args) => {
    if (args[0]?.name !== "HBRP") {
      console.log('\x1b[31m[ STATUS BLOCK ]\x1b[0m', 'Blocked unauthorized status change');
      return setPermanentStatus();
    }
    return originalSetActivity(...args);
  };

  client.user.setStatus = async (...args) => {
    if (args[0] !== 'online') {
      console.log('\x1b[31m[ STATUS BLOCK ]\x1b[0m', 'Blocked unauthorized status change');
      return setPermanentStatus();
    }
    return originalSetStatus(...args);
  };
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

client.once('ready', async () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);

  // დაელოდეთ მცირე ხანს სანამ სრულად მზად იქნება
  await new Promise(resolve => setTimeout(resolve, 1000));

  // სტატუსის დაყენება
  await setPermanentStatus();

  // სტატუსის დამცავი მექანიზმის შექმნა
  createStatusProtector();

  // პერიოდული განახლება
  setInterval(setPermanentStatus, 5000);

  // heartbeat გაშვება
  heartbeat();
});

// სტატუსის ცვლილების აღკვეთა
client.on('presenceUpdate', async (oldPresence, newPresence) => {
  if (newPresence.user.id === client.user.id) {
    await setPermanentStatus();
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
