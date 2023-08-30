import { ClientId } from '@/constants'

export class TimeoutUser {
  public async timeout (token: string, userId: string, shamedUserId: string, amount: number, reason: string): Promise<void> {
    if (!amount) {
      return
    }

    const params = new URLSearchParams({
      broadcaster_id: userId,
      moderator_id: userId
    })
    await fetch(`https://api.twitch.tv/helix/moderation/bans?${params}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': ClientId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          user_id: shamedUserId,
          duration: amount,
          reason
        }
      })
    })
  }
}
