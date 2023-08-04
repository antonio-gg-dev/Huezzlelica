<template>
  <div>
    <div
      :style="{
        color: '#fff',
        backgroundColor: firstColor
      }"
    >
      {{ firstColor }}
    </div>

    <div
      :style="{
        color: '#fff',
        backgroundColor: secondColor
      }"
    >
      {{ secondColor }}
    </div>

    <hr>

    <div
      v-for="colorOption in colorOptions"
      :style="{
        color: '#fff',
        backgroundColor: colorOption
      }"
      :key="colorOption"
    >
      {{ colorOption }}{{ colorOption === correctColor ? '&nbsp;' : '' }}
    </div>

    <button @click="startRound">New Round ({{ round }}) [{{ optionsCount }}]</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'
import { Chat, PrivateMessages } from 'twitch-js'

export default defineComponent({
  props: {
    colorGenerator: {
      required: true,
      type: ColorGenerator as PropType<ColorGenerator>
    },
    random: {
      required: true,
      type: Random as PropType<Random>
    },
    chat: {
      default: null,
      type: Chat as PropType<Chat | null>
    }
  },

  data () {
    return {
      firstColor: this.colorGenerator.generateMain(),
      secondColor: null as string | null,
      correctColor: null as string | null,
      colorOptions: [] as string[],
      round: 0
    }
  },

  computed: {
    optionsCount (): number {
      return 2
    }
  },

  methods: {
    handleChat (event: PrivateMessages): void {
      const { message, tags: { displayName: user } } = event
      console.log({ user, message, event })
    },

    async sleep (milliseconds: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, milliseconds))
    },

    async startRound (): Promise<void> {
      if (this.secondColor) {
        this.firstColor = this.secondColor
      }
      this.round++
      this.secondColor = null
      this.colorOptions = []

      await this.sleep(200)
      this.secondColor = this.colorGenerator.generateMain(this.firstColor)
      await this.sleep(200)

      const correctColor = this.colorGenerator.responseMix(this.firstColor, this.secondColor)
      this.correctColor = correctColor
      const colorOptions = Array.from(
        { length: this.optionsCount - 1 },
        () => this.colorGenerator.responseVariation(correctColor)
      )
      colorOptions.push(correctColor)
      colorOptions.sort(() => this.random.from([-1, 1]))

      await colorOptions.reduce(async (promise, colorOption) => {
        await promise

        this.colorOptions.push(colorOption)

        await this.sleep(200)
      }, Promise.resolve())
    }
  },

  watch: {
    chat () {
      if (!this.chat) {
        return
      }

      this.chat.on(Chat.Events.PRIVATE_MESSAGE, this.handleChat)
    }
  },

  mounted () {
    this.startRound()
  }
})
</script>

<style lang="scss" scoped>
</style>
