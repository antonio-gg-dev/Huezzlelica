import Color from 'colorjs.io'
import { Random } from '@/services/Random'

export class ColorGenerator {
  constructor (
    private readonly random: Random
  ) {}

  public generateMain (pairColor: string | null = null): string {
    const hue = this.random.minMax(0, 360)
    const saturation = this.random.minMax(60, 90)
    const lightness = this.random.minMax(40, 60)

    let color = (new Color('hsl', [hue, saturation, lightness]))
      .to('srgb')
      .toString({ format: 'hex' })

    if (!pairColor) {
      return color
    }

    const contrast = Color.contrast(color, pairColor, { algorithm: 'wcag21' })

    if (contrast < 1.6 || contrast > 1.7) {
      color = this.generateMain(pairColor)
    }

    return color
  }

  public responseMix (firstColor: string, secondColor: string): string {
    const color = Color.mix(firstColor, secondColor, 0.5, {
      space: 'srgb',
      outputSpace: 'srgb'
    })

    return new Color('srgb', color.coords)
      .toString({ format: 'hex' })
  }

  public responseVariation (responseColor: string): string {
    const color = new Color(responseColor)
    color.hsl.h += this.random.minMax(0, 30) * this.random.from([-1, 1])
    color.hsl.s += this.random.minMax(0, 30) * this.random.from([-1, 1])
    color.hsl.l += this.random.minMax(0, 30) * this.random.from([-1, 1])

    return color.toString({ format: 'hex' })
  }
}
