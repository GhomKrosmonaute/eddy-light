import * as app from "../app.js"

import path from "path"
import chalk from "chalk"
import fs from "fs/promises"

import parts, { Part } from "../tables/parts.js"
import enders from "../tables/enders.js"
import starters from "../tables/starters.js"
import bindings, { Binding } from "../tables/bindings.js"

export const datasetHandler = new app.Handler(
  path.join(process.cwd(), "datasets")
)

datasetHandler.on("load", (_path, client) => {
  const handler = new app.Handler(_path)

  handler.on("load", async (__path) => {
    const sentence = await fs.readFile(__path, "utf-8")

    await app.injectContent(sentence)

    app.log(`loaded dataset sentence ${chalk.blueBright(sentence)}`)
  })

  return handler.load(client)
})

/**
 * check emotes, links, insults, mentions, punctuation
 * @param content
 */
export async function injectContent(content: string) {
  const sentences = content
    .replace(/([.,;?])\s+([a-z])/gi, "$1 %$2")
    .split(/[.,;?] %/)

  for (const sentence of sentences) {
    const words = sentence
      .toLowerCase()
      //.replace(/(['!.])/g, " $1 ")
      .split(/\s+/)
      .flat()

    if (words.length === 0) continue

    const data = await parts.query
      .insert(words.map((text) => ({ text })))
      .onConflict("text")
      .ignore()
      .returning("id")

    if (data.length > 0) await starters.query.insert({ part: data[0].id })

    if (data.length > 1) {
      const _bindings: Binding[] = []

      for (const part of data) {
        const next = data[data.indexOf(part) + 1]

        if (next) {
          _bindings.push({
            left_id: part.id,
            right_id: next.id,
          })
        } else {
          await enders.query.insert({ part: part.id })
        }
      }

      await bindings.query.insert(_bindings)
    }
  }
}

/**
 * build response with dataset and context
 * @param channel
 * @param target
 * @param context
 */
export async function generateResponse(
  channel: string,
  target: string,
  context: string
): Promise<string> {
  return "[*response generator is not yet implemented*]"
}

/**
 * build a sentence from dataset
 */
export async function generateSentence(
  minWordCount: number,
  maxWordCount: number
  // datasetId: number
) {
  const starter = await starters.query.orderByRaw("random()").first()

  if (!starter) throw new Error("No starter found")

  const words: number[] = [starter.part]

  let last: number = starter.part

  while (true) {
    let word: null | Pick<Part, "id"> = null
    let wordIndex = 0

    // use bindings to get best next words.

    const { rows: nextWords } = (await app.db.raw(
      `
        select r.id as id
        from parts l
        left join bindings b on b.left_id = l.id
        left join parts r on b.right_id = r.id
        where l.id = ?
        group by r.id
        order by count(b) desc
    `,
      [last]
    )) as { rows: Pick<Part, "id">[] }

    console.assert(last !== null)

    if (nextWords.length === 0) break

    // then pick a random with exponential easing

    while (word === null && wordIndex < nextWords.length) {
      if (Math.random() < 0.5) {
        word = nextWords[wordIndex] ?? null
      } else wordIndex++
    }

    if (word === null) {
      word = nextWords[Math.floor(Math.random() * nextWords.length)] ?? null
    }

    if (word === null) {
      break
    }

    words.push(word.id)

    last = word.id

    if (words.length > maxWordCount) break
    if (words.length > minWordCount) {
      if (await enders.query.where({ part: last }).first()) {
        if (Math.random() < 0.5) break
      }
    }
  }

  const texts = await parts.query
    .select("text")
    .whereRaw(words.map((id) => `id = ${id}`).join(" or "))

  return texts.map(({ text }) => text).join(" ")
}
