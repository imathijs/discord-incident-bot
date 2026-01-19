const https = require('node:https');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { evidenceButtonIds } = require('../constants');

function scheduleMessageDeletion(client, autoDeleteMs, messageId, channelId) {
  if (!autoDeleteMs) return;
  setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (channel) await channel.messages.delete(messageId).catch(() => {});
    } catch {}
  }, autoDeleteMs);
}

function downloadAttachment(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Download failed: ${res.statusCode}`));
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

function buildEvidencePromptRow(type = 'incident') {
  const doneLabel = type === 'appeal' ? 'Voltooi wederwoord' : 'Voltooi incident';
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(evidenceButtonIds.more).setLabel('Meer beelden uploaden').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(evidenceButtonIds.done).setLabel(doneLabel).setStyle(ButtonStyle.Success)
  );
}

module.exports = {
  scheduleMessageDeletion,
  downloadAttachment,
  buildEvidencePromptRow
};
