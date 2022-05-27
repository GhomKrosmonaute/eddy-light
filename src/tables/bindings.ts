import * as app from "../app.js"

export interface Binding {
  left_id: number
  right_id: number
}

export default new app.Table<Binding>({
  name: "bindings",
  description: "Represent the lexical bindings",
  setup: (table) => {
    table
      .integer("left_id")
      .unsigned()
      .references("id")
      .inTable("parts")
      .onDelete("cascade")
      .notNullable()
    table
      .integer("right_id")
      .unsigned()
      .references("id")
      .inTable("parts")
      .onDelete("cascade")
      .notNullable()
  },
})
