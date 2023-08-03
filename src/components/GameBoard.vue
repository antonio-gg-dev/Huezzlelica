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
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'

export default defineComponent({
  props: {
    colorGenerator: {
      required: true,
      type: ColorGenerator as PropType<ColorGenerator>
    },
    random: {
      required: true,
      type: Random as PropType<Random>
    }
  },

  data () {
    const firstColor = this.colorGenerator.generateMain()
    const secondColor = this.colorGenerator.generateMain(firstColor)
    const correctColor = this.colorGenerator.responseMix(firstColor, secondColor)

    return {
      firstColor,
      secondColor,
      correctColor,
      colorOptions: [
        correctColor,
        this.colorGenerator.responseVariation(correctColor),
        this.colorGenerator.responseVariation(correctColor),
        this.colorGenerator.responseVariation(correctColor)
      ].sort(() => this.random.from([-1, 1]))
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
