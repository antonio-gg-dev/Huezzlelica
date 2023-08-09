import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'
import { TokenValidator } from '@/services/TokenValidator'

const random = new Random()

export const bindings = Object.freeze({
  random,
  colorGenerator: new ColorGenerator(random),
  tokenValidator: new TokenValidator()
})
