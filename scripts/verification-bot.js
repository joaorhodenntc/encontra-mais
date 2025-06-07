const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

client.on('ready', () => {
  console.log(`Bot está online como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignora mensagens que não são do webhook
  if (!message.webhookId) return;

  // Verifica se a mensagem é sobre verificação
  if (!message.embeds?.[0]?.title?.includes('Nova Verificação de Identidade')) return;

  const embed = message.embeds[0];
  const professionalName = embed.fields.find(f => f.name === '👤 Profissional')?.value;
  const professionalEmail = embed.fields.find(f => f.name === '📧 Email')?.value;

  if (!professionalName || !professionalEmail) return;

  // Cria botões de aprovação/reprovação
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('approve_verification')
        .setLabel('✅ Aprovar')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('reject_verification')
        .setLabel('❌ Reprovar')
        .setStyle(ButtonStyle.Danger)
    );

  // Envia mensagem com botões
  await message.reply({
    content: 'Escolha uma ação:',
    components: [row]
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId } = interaction;
  const message = interaction.message;
  const originalEmbed = message.reference?.messageId 
    ? (await message.channel.messages.fetch(message.reference.messageId)).embeds[0]
    : null;

  if (!originalEmbed) return;

  const professionalEmail = originalEmbed.fields.find(f => f.name === '📧 Email')?.value;
  if (!professionalEmail) return;

  try {
    let confirmEmbed;

    if (customId === 'approve_verification') {
      // Atualiza o status no Supabase
      const { error } = await supabase
        .from('professionals')
        .update({ 
          verified: true,
          verification_status: 'approved'
        })
        .eq('email', professionalEmail);

      if (error) throw error;

      // Cria embed de confirmação
      confirmEmbed = new EmbedBuilder()
        .setTitle('✅ Verificação Aprovada')
        .setColor(0x00FF00)
        .setDescription(`A verificação de ${professionalEmail} foi aprovada.`)
        .setTimestamp();
    } else if (customId === 'reject_verification') {
      // Atualiza o status no Supabase
      const { error } = await supabase
        .from('professionals')
        .update({ 
          verified: false,
          verification_status: 'rejected'
        })
        .eq('email', professionalEmail);

      if (error) throw error;

      // Cria embed de confirmação
      confirmEmbed = new EmbedBuilder()
        .setTitle('❌ Verificação Reprovada')
        .setColor(0xFF0000)
        .setDescription(`A verificação de ${professionalEmail} foi reprovada.`)
        .setTimestamp();
    }

    // Responde à interação com o embed de confirmação
    await interaction.reply({ embeds: [confirmEmbed] });

    // Deleta a mensagem de ação
    await message.delete();
  } catch (error) {
    console.error('Erro ao processar verificação:', error);
    if (!interaction.replied) {
      await interaction.reply({
        content: '❌ Ocorreu um erro ao processar a verificação.',
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN); 