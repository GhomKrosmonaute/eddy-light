import * as app from "../app.js"

export interface Starter {
  part: number
}

export default new app.Table<Starter>({
  name: "enders",
  description: "Represent the lexical enders",
  setup: (table) => {
    table
      .integer("part")
      .unsigned()
      .references("id")
      .inTable("parts")
      .onDelete("cascade")
      .notNullable()
  },
})
