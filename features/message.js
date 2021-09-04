module.exports = (client) => {
  client.on("messageCreate", (message) => {
    if (message.content === "hi") {
      message.reply("hello");
    }
  });
};
