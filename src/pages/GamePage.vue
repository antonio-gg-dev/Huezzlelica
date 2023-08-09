<template>
  <GameBoard
    v-if="status === Status.ready"
    :color-generator="colorGenerator"
    :random="random"
    :chat="chat"
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
      chat: null as Chat | null
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
    }
  },

  async mounted () {
    const validation = await this.tokenValidator.validate(this.token)

    if (!validation.isValid) {
      return
    }

    await this.connectToChat(validation.userName)

    this.status = Status.ready
  }
})
</script>
