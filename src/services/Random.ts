export class Random {
  public minMax (min: number, max: number): number {
    return min + (Math.random() * (max - min))
  }

  public from <T> (values: T[]): T {
    return values[Math.floor(this.minMax(0, values.length))]
  }
}
