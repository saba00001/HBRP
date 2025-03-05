const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildPresences
  ],
  ws: {
    properties: {
      // გამორთეთ სტანდარტული სტატუს სინქრონიზაცია
      status: 'invisible'
    }
  }
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32mSH : http://localhost:${port} ✅\x1b[0m`);
});

async function setFinalStatus() {
  try {
    if (!client.user) return;

    console.log('\x1b[33m[ STATUS DEBUG ]\x1b[0m', 'Attempting to set final status');

    // სტატუსის დაყენება რამდენიმე მეთოდით
    await client.user.setPresence({
      activities: [{ 
        name: "HBRP", 
        type: ActivityType.Competing 
      }],
      status: 'online'
    });

    // დამატებითი დაცვა
    await client.user.setActivity("HBRP", { type: ActivityType.Competing });
    
    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Locked status to: Competing in HBRP`);
  } catch (error) {
    console.error('\x1b[31m[ STATUS ERROR ]\x1b[0m', error);
  }
}

function createPersistentStatusProtection() {
  // ინტერვალი სტატუსის პერმანენტული დაცვისთვის
  const statusProtector = setInterval(async () => {
    try {
      await setFinalStatus();
    } catch (error) {
      console.error('\x1b[31m[ STATUS PROTECT ERROR ]\x1b[0m', error);
    }
  }, 5000); // ყოველ 5 წამში

  // იმ შემთხვევაში თუ დაიხურება ინტერვალი
  return () => clearInterval(statusProtector);
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

  // დაყოვნება სრული ჩატვირთვის შემდეგ
  await new Promise(resolve => setTimeout(resolve, 2000));

  // სტატუსის საბოლოო დაყენება
  await setFinalStatus();

  // სტატუსის დამცავი მექანიზმი
  const stopStatusProtector = createPersistentStatusProtection();

  // heartbeat გაშვება
  heartbeat();

  // სტატუსის ცვლილების აღკვეთა
  client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (newPresence.user.id === client.user.id) {
      console.log('\x1b[33m[ STATUS DEBUG ]\x1b[0m', 'Presence update detected, blocking...');
      await setFinalStatus();
    }
  });
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
