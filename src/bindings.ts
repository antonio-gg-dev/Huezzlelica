import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'
import { TokenValidator } from '@/services/TokenValidator'
import { TimeoutUser } from '@/services/TimeoutUser'
import { SettingsRepository } from '@/services/SettingsRepository'

const random = new Random()

export const bindings = Object.freeze({
  random,
  colorGenerator: new ColorGenerator(random),
  tokenValidator: new TokenValidator(),
  timeoutUser: new TimeoutUser(),
  settingsRepository: new SettingsRepository(localStorage)
})
