<template>
  <GameBoard
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

export default defineComponent({
  components: {
    GameBoard
  },

  data () {
    return {
      ...bindings,
      acceptingResponses: false,
      chat: null as Chat | null
    }
  },

  props: {
    channel: {
      required: true,
      type: String as PropType<string>
    }
  },

  methods: {
    async connectToChat () {
      const chat = new Chat({})

      await chat.connect()
      await chat.join(this.channel)

      this.chat = chat
    }
  },

  mounted () {
    this.connectToChat()
  }
})
</script>
