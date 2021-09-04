const prefix = process.env.prefix;
const modRoles = ["802210029468909639", "802210116219961404"];

const validatePermissions = (permissions) => {
  const validPermissions = [
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
  ];

  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node "${permission}"`);
    }
  }
};

const allCommands = {};

let recentlyRan = []; // guildId-userId-command

module.exports = (commandOptions) => {
  let { commands, permissions = [] } = commandOptions;

  // Ensure the command and aliases are in an array
  if (typeof commands === "string") {
    commands = [commands];
  }

  // console.log(`Registering command "${commands[0]}"`)

  // Ensure the permissions are in an array and are all valid
  if (permissions.length) {
    if (typeof permissions === "string") {
      permissions = [permissions];
    }

    validatePermissions(permissions);
  }

  for (const command of commands) {
    allCommands[command] = {
      ...commandOptions,
      commands,
      permissions,
    };
  }
};

module.exports.listen = (client) => {
  // Listen for messages
  client.on("messageCreate", async (message) => {
    const { member, content, guild, channel } = message;

    // Split on any number of spaces
    const args = content.split(/[ ]+/);

    // Remove the command which is the first index
    const name = args.shift().toLowerCase();

    if (name.startsWith(prefix)) {
      const command = allCommands[name.replace(prefix, "")];

      if (!command) return;

      // A command has been ran

      const {
        commands,
        permissions = [],
        expectedArgs = "",
        modOnly,
        minArgs = 0,
        maxArgs = null,
        cooldown = -1,
        requiredChannel = "",
        requiredRoles = [],
        callback,
      } = command;

      // Ensure we are in the right channel
      if (requiredChannel && requiredChannel !== channel.name) {
        //<#ID>
        const foundChannel = guild.channels.cache.find((channel) => {
          return channel.name === requiredChannel;
        });

        message.reply(
          `You can only run this command inside of <#${foundChannel.id}>.`
        );
        return;
      }

      // Ensure the user has the required permissions
      for (const permission of permissions) {
        if (modOnly) {
          if (modOnly === true) {
            if (
              !member.roles.cache.find((r) => modRoles.includes(r.id)) &&
              !member.permissions.has(permission)
            ) {
              return message.delete();
            }
          }

          for (i in modOnly) {
            if (
              !member.roles.cache.find((r) => r.id === modOnly[i]) &&
              !member.permissions.has(permission)
            ) {
              return message.delete();
            }
          }
        } else if (!member.permissions.has(permission)) {
          return message.delete();
        }
      }

      if (!permissions.length) {
        if (modOnly === true) {
          if (!member.roles.cache.find((r) => modRoles.includes(r.id))) {
            return message.delete();
          }
        }

        for (i in modOnly) {
          if (!member.roles.cache.find((r) => r.id === modOnly[i])) {
            return message.delete();
          }
        }
      }

      // Ensure the user has the required roles
      for (const requiredRole of requiredRoles) {
        const role = guild.roles.cache.find(
          (role) => role.name === requiredRole
        );

        if (!role || !member.roles.cache.has(role.id)) {
          message.reply(
            `You must have the "${requiredRole}" role to use this command.`
          );
          return message.delete();
        }
      }

      // Ensure the user has not ran this command too frequently
      //guildId-userId-command
      let cooldownString = `${guild.id}-${member.id}-${commands[0]}`;

      if (cooldown > 0 && recentlyRan.includes(cooldownString)) {
        message.reply("You cannot use that command so soon, please wait.");
        return message.delete();
      }

      // Ensure we have the correct number of arguments
      if (
        args.length < minArgs ||
        (maxArgs !== null && args.length > maxArgs)
      ) {
        message.reply(
          `Incorrect syntax! Use ${prefix}${alias} ${expectedArgs}`
        );
        return message.delete();
      }

      if (cooldown > 0) {
        recentlyRan.push(cooldownString);

        setTimeout(() => {
          recentlyRan = recentlyRan.filter((string) => {
            return string !== cooldownString;
          });
        }, 1000 * cooldown);
      }

      // Handle the custom command code
      callback(message, args, args.join(" "), client, prefix);
    }
  });
};
