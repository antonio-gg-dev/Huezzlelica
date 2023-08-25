export interface RawSettings {
  responseTime: number | undefined
  shameTime: number | undefined
}

export class Settings {
  constructor (
    public responseTime: number,
    public shameTime: number
  ) {}

  public toRaw (): RawSettings {
    return {
      responseTime: this.responseTime,
      shameTime: this.shameTime
    }
  }

  public static fromRaw ({ responseTime, shameTime }: RawSettings): Settings {
    return new Settings(
      responseTime ?? 30,
      shameTime ?? 5
    )
  }
}
