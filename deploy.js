require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("קיק משתמש")
    .addUserOption(option =>
      option.setName("user").setDescription("משתמש").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("סיבה").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("באן משתמש")
    .addUserOption(option =>
      option.setName("user").setDescription("משתמש").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("סיבה").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("cmute")
    .setDescription("מיוט בצ'אט")
    .addUserOption(option =>
      option.setName("user").setDescription("משתמש").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("time").setDescription("זמן (10m / 1h)").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("סיבה").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("vmute")
    .setDescription("מיוט בוויס")
    .addUserOption(option =>
      option.setName("user").setDescription("משתמש").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("time").setDescription("זמן (10m / 1h)").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("סיבה").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("vunmute")
    .setDescription("הורדת מיוט בוויס")
    .addUserOption(option =>
      option.setName("user").setDescription("משתמש").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("אזהרה למשתמש")
    .addUserOption(option =>
      option.setName("user").setDescription("משתמש").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("סיבה").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("צפייה באזהרות")
    .addUserOption(option =>
      option.setName("user").setDescription("משתמש").setRequired(true)
    )
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🚀 מעלה פקודות...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ הפקודות עלו בהצלחה!");
  } catch (error) {
    console.error(error);
  }
})();