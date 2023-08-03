import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'

const random = new Random()

export const bindings = Object.freeze({
  random,
  colorGenerator: new ColorGenerator(random)
})
