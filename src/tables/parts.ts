import * as app from "../app.js"

export interface Part {
  id: number
  text: string
}

export default new app.Table<Part>({
  name: "parts",
  description: "Represent the bot lexical parts",
  priority: 1,
  setup: (table) => {
    table.increments("id").unsigned()
    table.string("text").unique().notNullable()
  },
})
