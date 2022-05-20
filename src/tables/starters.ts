import * as app from "../app.js"

export interface Starter {
  part: number
}

export default new app.Table<Starter>({
  name: "starters",
  description: "Represent the lexical starters",
  setup: (table) => {
    table
      .integer("part")
      .unsigned()
      .references("id")
      .inTable("parts")
      .notNullable()
  },
})
