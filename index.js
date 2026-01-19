const { Client, GatewayIntentBits, Partials } = require('discord.js');

try {
  require('dotenv').config();
} catch {}

const { config, token, generateIncidentNumber } = require('./src/config');
const { createState } = require('./src/state');
const { registerInteractionHandlers } = require('./src/handlers/interaction');
const { registerMessageHandlers } = require('./src/handlers/message');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const state = createState(config);

registerInteractionHandlers(client, { config, state, generateIncidentNumber });
registerMessageHandlers(client, { config, state });

if (!token) {
  console.error('DISCORD_TOKEN ontbreekt. Zet deze als environment variable en start opnieuw.');
  process.exit(1);
}

client.login(token);
