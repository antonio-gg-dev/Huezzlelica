export enum Theme {
  Light = 'Light',
  Dark = 'Dark',
  Numerica = 'Numerica'
}

export interface RawSettings {
  responseTime: number | undefined
  shameTime: number | undefined
  highScoreRound: number | undefined
  highScoreAt: string | undefined
  shameRounds: boolean | undefined
  modImmunity: boolean | undefined
  allowVoteChange: boolean | undefined
  theme: Theme | undefined
}

export class Settings {
  constructor (
    public responseTime: number,
    public shameTime: number,
    public highScoreRound: number | null,
    public highScoreAt: string | null,
    public shameRounds: boolean,
    public modImmunity: boolean,
    public allowVoteChange: boolean,
    public theme: Theme
  ) {}

  public setHighScore (round: number | null, at: string | null) {
    this.highScoreRound = round
    this.highScoreAt = at
  }

  setResponseTime (responseTime: number) {
    this.responseTime = Math.max(5, responseTime)
  }

  setShameTime (shameTime: number) {
    this.shameTime = Math.max(0, shameTime)
  }

  setShameRounds (shameRounds: boolean) {
    this.shameRounds = shameRounds
  }

  setModImmunity (modImmunity: boolean) {
    this.modImmunity = modImmunity
  }

  setAllowVoteChange (allowVoteChange: boolean) {
    this.allowVoteChange = allowVoteChange
  }

  setTheme (theme: Theme) {
    this.theme = theme
  }

  public toRaw (): RawSettings {
    return {
      responseTime: this.responseTime,
      shameTime: this.shameTime,
      highScoreRound: this.highScoreRound ?? undefined,
      highScoreAt: this.highScoreAt ?? undefined,
      shameRounds: this.shameRounds,
      modImmunity: this.modImmunity,
      allowVoteChange: this.allowVoteChange,
      theme: this.theme
    }
  }

  public static fromRaw (raw: RawSettings): Settings {
    return new Settings(
      raw.responseTime ?? 30,
      raw.shameTime ?? 5,
      raw.highScoreRound ?? null,
      raw.highScoreAt ?? null,
      raw.shameRounds ?? true,
      raw.modImmunity ?? false,
      raw.allowVoteChange ?? false,
      raw.theme ?? Theme.Light
    )
  }
}
