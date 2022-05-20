import * as app from "../app.js"

import channels from "../tables/channels.js"

export default new app.Command({
  name: "setup",
  description: "The setup command",
  channelType: "all",
  guildOwnerOnly: true,
  async run(message) {
    await channels.query
      .insert({ id: message.channel.id })
      .onConflict("id")
      .ignore()

    return message.reply("Tout le monde peut discuter avec moi dans ce salon.")
  },
})
