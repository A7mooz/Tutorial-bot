const { Client, Intents } = require("discord.js");
const client = new Client({
  intents: Object.keys(Intents.FLAGS),
});

const loadCommand = require("./loaders/load-command");
const loadFeatures = require("./loaders/load-features");

client.on("ready", () => {
  console.log(`I'm logged in as ${client.user.tag}`);

  client.user.setPresence({
    activity: {
      name: "Hi",
      type: "WATCHING",
    },
    status: "idle",
  });

  loadFeatures(client);
  loadCommand(client);
});

require("dotenv").config();

client.login(process.env.token);
