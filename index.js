const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const app = express();
const port = 3000;

// სტატუსის ცვლილების თვალყურის დევნე
let lastStatus = null;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', `\x1b[32mSH : http://localhost:${port} ✅\x1b[0m`);
});

// სტატუსის განახლება მხოლოდ მაშინ, როცა საჭიროა
function updateStatus() {
  const newStatus = { name: "HBRP", type: ActivityType.Playing };

  // მხოლოდ მაშინ განახლდეს, თუ სტატუსი შეიცვალა
  if (lastStatus !== newStatus.name) {
    client.user.setPresence({
      activities: [newStatus],
      status: 'online',
    });

    console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: Playing HBRP`);
    lastStatus = newStatus.name;  // ახალ სტატუსად მივნიშნავთ
  }
}

function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000); // ყოველ 30 წამის შემდეგ
}

client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
  
  updateStatus(); // სტატუსის განახლება ბოტის დაწყებისთანავე
  setInterval(updateStatus, 30001); // 30 წამში ერთხელ განახლდება სტატუსი
  heartbeat();
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
