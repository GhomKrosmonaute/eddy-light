import * as app from "../app.js"

import words from "../tables/parts.js"
import channels from "../tables/channels.js"

const listener: app.Listener<"messageCreate"> = {
  event: "messageCreate",
  description: "Handle message for eddy",
  async run(message) {
    if (!app.isNormalMessage(message)) return

    if (message.author.bot) return

    if (!(await channels.query.where({ id: message.channel.id }).first()))
      return

    if (new RegExp(`^<@!?${message.client.user.id}>$`).test(message.content))
      return message.reply("Oui ?")

    await app.injectContent(message.content)

    if (message.content.includes("?") || Math.random() < 0.8)
      return message.reply(
        await app.generateResponse(
          message.channel.id,
          message.author.id,
          message.content
        )
      )
  },
}

export default listener
