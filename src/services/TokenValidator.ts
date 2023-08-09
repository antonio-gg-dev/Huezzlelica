type ValidationResponse = {
  isValid: true,
  userName: string,
  userId: string,
} | {
  isValid: false
}

interface Response {
  'client_id': string,
  login: string,
  scopes: string[],
  'user_id': string,
  'expires_in': number
}

export class TokenValidator {
  public async validate (token: string): Promise<ValidationResponse> {
    const response = await fetch('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (response.status !== 200) {
      return {
        isValid: false
      }
    }

    const {
      login: userName,
      user_id: userId
    } = await response.json() as Response

    return {
      isValid: true,
      userName,
      userId
    }
  }
}
