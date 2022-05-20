import * as app from "../app.js"

export interface Data {
  content: string
  targets: string | null
  channel: string
}

export default new app.Table<Data>({
  name: "dataset",
  description: "Represent the dataset",
  setup: (table) => {
    table.string("content").notNullable()
    table.string("targets").nullable()
    table.string("channel").nullable()
  },
})
