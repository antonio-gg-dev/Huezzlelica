export interface RawSettings {
  responseTime: number | undefined
  shameTime: number | undefined
  highScoreRound: number | undefined
  highScoreAt: string | undefined
}

export class Settings {
  constructor (
    public responseTime: number,
    public shameTime: number,
    public highScoreRound: number | null,
    public highScoreAt: string | null
  ) {}

  public setHighScore (round: number | null, at: string | null) {
    this.highScoreRound = round
    this.highScoreAt = at
  }

  public toRaw (): RawSettings {
    return {
      responseTime: this.responseTime,
      shameTime: this.shameTime,
      highScoreRound: this.highScoreRound ?? undefined,
      highScoreAt: this.highScoreAt ?? undefined
    }
  }

  public static fromRaw ({ responseTime, shameTime, highScoreRound, highScoreAt }: RawSettings): Settings {
    return new Settings(
      responseTime ?? 30,
      shameTime ?? 5,
      highScoreRound ?? null,
      highScoreAt ?? null
    )
  }
}
