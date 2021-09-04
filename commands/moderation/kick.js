module.exports = {
  commands: ["kick", "k"],
  modOnly: true,
  description: "Kicks a user",
  expectedArgs: "<user> (reason)",
  permissions: ["KICK_MEMBERS"],
  callback: (message, args) => {
    const user = message.mentions.users.first() || args[0];

    if (user) {
      const member = message.guild.members.cache.get(user.id);
      const reason = args.slice(1).join(" ") || undefined;

      if (member) {
        member
          .kick(reason)
          .then(() => {
            message.reply(
              `You've kicked **${member.user.tag}**\n Reason: \`${reason}\``
            );
          })
          .catch((e) => {
            message.reply(`Couldn't kick this member\n \`${e}\``);
            console.log(e);
          });
      } else {
        message.reply("Coundn't find this member in this guild!");
      }
    } else {
      message.reply("Please mention someone to kick!");
    }
  },
};
