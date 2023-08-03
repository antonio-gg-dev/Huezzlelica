<template>
  <GameBoard
    :color-generator="colorGenerator"
    :random="random"
  />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Client } from 'tmi.js'
import GameBoard from '@/components/GameBoard.vue'
import { bindings } from '@/bindings'

export default defineComponent({
  components: {
    GameBoard
  },

  data () {
    return {
      ...bindings
    }
  },

  props: {
    channel: {
      required: true,
      type: String as PropType<string>
    }
  },

  mounted () {
    const client = new Client({
      channels: [this.channel]
    })
    client.connect().catch(console.error)
    client.on('message', (channel, tags, message, self) => {
      console.log({ channel, tags, message, self })
    })
  }
})
</script>
