<template>
  <h1>Channel {{ channel }} Page</h1>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Client } from 'tmi.js'

export default defineComponent({
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
