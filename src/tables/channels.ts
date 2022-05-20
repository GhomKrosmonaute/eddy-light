import * as app from "../app.js"

export interface Channel {
  id: string
}

export default new app.Table<Channel>({
  name: "channels",
  description: "Represent a channel",
  setup: (table) => {
    table.string("id").unique().notNullable()
  },
})
