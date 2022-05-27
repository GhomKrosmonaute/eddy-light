import * as app from "../app.js"

import parts from "../tables/parts.js"
import bindings from "../tables/bindings.js"

export default new app.Command({
  name: "data",
  aliases: ["spec"],
  description: "The data command",
  channelType: "all",
  async run(message) {
    return message.send({
      embeds: [
        new app.SafeMessageEmbed().setTitle("Data overview").setDescription(
          app.code.stringify({
            lang: "yml",
            content: [
              "word_count: " +
                (await parts.query
                  .count({ count: "*" })
                  .then((d) => d[0].count)),
              "bind_count: " +
                (await bindings.query
                  .count({ count: "*" })
                  .then((d) => d[0].count)),
            ].join("\n"),
          })
        ),
      ],
    })
  },
})
