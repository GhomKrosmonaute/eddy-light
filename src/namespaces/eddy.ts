import * as app from "../app.js"

import parts, { Part } from "../tables/parts.js"
import enders from "../tables/enders.js"
import starters from "../tables/starters.js"
import bindings, { Binding } from "../tables/bindings.js"

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
) {
  const starter = await starters.query.orderByRaw("random()").first()

  if (!starter) throw new Error("No starter found")

  const words: number[] = [starter.part]

  let last: number = starter.part

  while (true) {
    let word = null
    let wordIndex = 0

    // todo: use bindings to get best next words. then pick a random with easing

    const nextWords = await app.db.raw(
      `
      select parts.id from parts
      inner join bindings
      on bindings.part_1 = parts.id 
      and bintings.part_2 = ?
      where ???
      order by ???
    `,
      [last]
    )

    while (word === null) {
      if (Math.random() < 0.5) {
        word = nextWords[wordIndex]
      } else wordIndex++
    }

    words.push(word.id)

    last = word.id

    if (words.length < maxWordCount) break
    if (words.length > minWordCount) {
      if (await enders.query.where({ part: last }).first()) {
        break
      }
    }
  }

  const texts = await parts.query
    .select("text")
    .whereRaw(words.map((id) => `id = ${id}`).join(" or "))

  return texts.map(({ text }) => text).join(" ")
}

/**
 * check emotes, links, insults, mentions, punctuation
 * @param content
 */
export async function injectContent(content: string) {
  const words = content
    //.replace(/(['!.])/g, " $1 ")
    .split(/\s+/)
    .flat()

  const data = await parts.query
    .insert(words.map((text) => ({ text })))
    .onConflict("text")
    .ignore()
    .returning("id")

  if (data.length === 0) throw new Error("Error on insert data")

  await starters.query.insert({ part: data[0].id })

  const _bindings: Binding[] = []

  for (const part of data) {
    const next = data[data.indexOf(part) + 1]

    if (next) {
      _bindings.push({
        part_1: part.id,
        part_2: next.id,
      })
    } else {
      await enders.query.insert({ part: part.id })
    }
  }

  await bindings.query.insert(_bindings)
}
