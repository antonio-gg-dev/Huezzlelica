export interface RawSettings {
  responseTime: number | undefined
}

export class Settings {
  constructor (
    public responseTime: number
  ) {}

  public toRaw (): RawSettings {
    return {
      responseTime: this.responseTime
    }
  }

  public static fromRaw ({ responseTime }: RawSettings): Settings {
    return new Settings(
      responseTime ?? 30
    )
  }
}
