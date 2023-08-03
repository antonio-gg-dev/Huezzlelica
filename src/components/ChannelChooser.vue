<template>
  <div>
    <h1>Huezzlelica</h1>
    <input
      type="text"
      placeholder="Twitch channel name..."
      v-model="channel"
    >

    <template
      v-if="channel"
    >
      <button
        @click="clipboard"
        title="Copy to clipboard"
      >
        <img
          src="/img/clipboard.svg"
          alt=""
        >
      </button>

      <input
        type="text"
        readonly
        :value="url"
      >

      <p>
        Copy this link into OBS to start playing
      </p>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data () {
    return {
      channel: ''
    }
  },

  computed: {
    url (): string {
      return `https://huezzlelica.antonio.gg/#/${this.channel}`
    }
  },

  methods: {
    clipboard () {
      navigator.clipboard.writeText(this.url)
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
