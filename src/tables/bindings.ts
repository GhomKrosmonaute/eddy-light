import * as app from "../app.js"

export interface Binding {
  part_1: number
  part_2: number
}

export default new app.Table<Binding>({
  name: "bindings",
  description: "Represent the lexical bindings",
  setup: (table) => {
    table
      .integer("part_1")
      .unsigned()
      .references("id")
      .inTable("parts")
      .notNullable()
    table
      .integer("part_2")
      .unsigned()
      .references("id")
      .inTable("parts")
      .notNullable()
  },
})
