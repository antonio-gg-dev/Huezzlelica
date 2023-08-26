<template>
  <GameBoard
    v-if="status === Status.ready && chat"
    :color-generator="colorGenerator"
    :random="random"
    :chat="chat"
    :settings="settings"
    @shame-user="shameUser"
    @save-settings="saveSettings"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import GameBoard from '@/components/GameBoard.vue'
import { bindings } from '@/bindings'
import { Chat } from 'twitch-js'

enum Status {
  connecting = 'connecting',
  ready = 'ready'
}

export default defineComponent({
  components: {
    GameBoard
  },

  data () {
    return {
      ...bindings,
      status: Status.connecting as Status,
      chat: null as Chat | null,
      userId: null as string | null,
      settings: bindings.settingsRepository.get()
    }
  },

  props: {
    token: {
      required: true,
      type: String as PropType<string>
    }
  },

  computed: {
    Status () {
      return Status
    }
  },

  methods: {
    async connectToChat (channel: string) {
      const chat = new Chat({})

      await chat.connect()
      await chat.join(channel)

      this.chat = chat
    },

    shameUser ({ userId: shamedUserId, amount }: { userId: string, amount: number }) {
      if (!this.userId) {
        return
      }

      this.timeoutUser.timeout(this.token, this.userId, shamedUserId, amount)
    },

    saveSettings () {
      this.settingsRepository.store(this.settings)
    }
  },

  async mounted () {
    const validation = await this.tokenValidator.validate(this.token)

    if (!validation.isValid) {
      return
    }

    this.userId = validation.userId

    await this.connectToChat(validation.userName)

    this.status = Status.ready
  }
})
</script>
