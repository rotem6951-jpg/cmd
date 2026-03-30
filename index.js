require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// ===== אזהרות =====
const warnings = {};

function addWarning(userId, staff, reason) {
  if (!warnings[userId]) warnings[userId] = [];

  warnings[userId].push({
    staff,
    reason,
    date: new Date()
  });
}

// ===== פונקציית אישור =====
async function sendApproval(interaction, type, member, reason) {

  // ✔ בדיקה מלאה
  if (!member || !member.user) {
    return interaction.reply({
      content: "❌ המשתמש לא נמצא או לא תקין",
      ephemeral: true
    });
  }

  const channel = await client.channels.fetch(process.env.APPROVAL_CHANNEL_ID);

  const embed = new EmbedBuilder()
    .setColor("Yellow")
    .setTitle(`⚠️ בקשת ${type}`)
    .addFields(
      { name: "👤 משתמש", value: member.user.tag },
      { name: "📝 סיבה", value: reason },
      { name: "👮 מבקש", value: interaction.user.tag },
      { name: "📅 תאריך", value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`approve_${type}_${member.id}`)
      .setLabel("✅ אשר")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`deny_${type}_${member.id}`)
      .setLabel("❌ דחה")
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({ embeds: [embed], components: [row] });

  await interaction.reply({
    content: "📩 נשלח לאישור צוות",
    ephemeral: true
  });
}
// ===== INTERACTIONS =====
client.on("interactionCreate", async interaction => {

  // ===== פקודות =====
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    // ===== KICK =====
    if (commandName === "kick") {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason");

      await sendApproval(interaction, "kick", user, reason);
      return;
    }

    // ===== BAN =====
    if (commandName === "ban") {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason");

      await sendApproval(interaction, "ban", user, reason);
      return;
    }

    // ===== CMUTE =====
    if (commandName === "cmute") {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason");
      const time = interaction.options.getString("time");

      let duration = 0;
      if (time.endsWith("m")) duration = parseInt(time) * 60000;
      if (time.endsWith("h")) duration = parseInt(time) * 3600000;

      await user.timeout(duration, reason);

      await interaction.reply({
        content: `🔇 ${user.user.tag} קיבל מיוט`,
        ephemeral: true
      });
    }

    // ===== VMUTE =====
    if (commandName === "vmute") {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason");
      const time = interaction.options.getString("time");

      let duration = 0;
      if (time.endsWith("m")) duration = parseInt(time) * 60000;
      if (time.endsWith("h")) duration = parseInt(time) * 3600000;

      await user.timeout(duration, reason);

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🎧 מיוט בוויס")
        .addFields(
          { name: "👤 משתמש", value: user.user.tag },
          { name: "📝 סיבה", value: reason },
          { name: "⏱ זמן", value: time },
          { name: "👮 נתן", value: interaction.user.tag },
          { name: "📅 תאריך", value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        );

      await interaction.reply({ embeds: [embed] });
    }

    // ===== VUNMUTE =====
    if (commandName === "vunmute") {
      const user = interaction.options.getMember("user");

      await user.timeout(null);

      await interaction.reply({
        content: `🔊 ${user.user.tag} הוסר מיוט`,
        ephemeral: true
      });
    }

    // ===== WARN =====
    if (commandName === "warn") {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason");

      addWarning(user.id, interaction.user.tag, reason);

      const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle("⚠️ אזהרה")
        .addFields(
          { name: "👤 משתמש", value: user.user.tag },
          { name: "📝 סיבה", value: reason },
          { name: "👮 נתן", value: interaction.user.tag },
          { name: "📅 תאריך", value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
        );

      await interaction.reply({ embeds: [embed] });
    }

    // ===== WARNINGS =====
    if (commandName === "warnings") {
      const user = interaction.options.getMember("user");

      const userWarnings = warnings[user.id] || [];

      let text = userWarnings.length
        ? userWarnings
            .map(
              (w, i) =>
                `#${i + 1}\n👮 ${w.staff}\n📝 ${w.reason}\n📅 <t:${Math.floor(
                  w.date.getTime() / 1000
                )}:F>`
            )
            .join("\n\n")
        : "אין אזהרות";

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`📄 אזהרות של ${user.user.tag}`)
        .setDescription(text);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }

  // ===== כפתורים =====
  if (interaction.isButton()) {
    const [action, type, userId] = interaction.customId.split("_");

    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    if (action === "approve") {
      if (type === "kick") {
        await member.kick("אושר ע״י צוות").catch(() => {});
      }

      if (type === "ban") {
        await member.ban({ reason: "אושר ע״י צוות" }).catch(() => {});
      }

      await interaction.update({
        content: `✅ אושר ${type} על ${member.user.tag}`,
        components: []
      });
    }

    if (action === "deny") {
      await interaction.update({
        content: `❌ נדחה ${type}`,
        components: []
      });
    }
  }
});

client.login(process.env.TOKEN);