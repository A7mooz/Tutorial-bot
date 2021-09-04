module.exports = {
  commands: ["ban", "b"],
  modOnly: ["826766579084689418"],
  description: "Bans a user",
  expectedArgs: "<user> (reason)",
  permissions: ["BAN_MEMBERS"],
  callback: (message, args) => {
    const user = message.mentions.users.first() || args[0];

    if (user) {
      const member = message.guild.members.cache.get(user.id);
      const reason = args.slice(1).join(" ") || undefined;

      if (member) {
        member
          .ban({
            reason: reason,
          })
          .then(() => {
            message.reply(
              `You've banned **${member.user.tag}**\n Reason: \`${reason}\``
            );
          })
          .catch((e) => {
            message.reply(`Couldn't ban this member\n \`${e}\``);
            console.log(e);
          });
      } else {
        message.reply("Coundn't find this member in this guild!");
      }
    } else {
      message.reply("Please mention someone to ban!");
    }
  },
};
