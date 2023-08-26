<template>
  <div class="settings-screen__container">
    <div class="settings-screen__credits">
      <strong>Huezzlelica</strong>
      a game developed by
      <strong>Antonio González Gea</strong>
      to participate in the
      <a
        target="_blank"
        href="https://itch.io/jam/numerica-twitch-jam"
      >
        Numerica Twitch Jam<!--
      --></a>
    </div>

    <label class="settings-screen__label">
      <span>
        Round duration<br>
        <small>(in seconds)</small>
      </span>
      <input
        class="settings-screen__input"
        type="number"
        step="1"
        min="5"
        :value="settings.responseTime"
        @change="updateResponseTime"
      >
    </label>
    <label class="settings-screen__label">
      Timeout between rounds
      <input
        class="settings-screen__checkbox"
        type="checkbox"
        :checked="settings.shameRounds"
        @change="updateShameRounds"
      >
    </label>
    <label class="settings-screen__label">
      <span>
        End timeout multiplier<br>
        <small>(0 to disable)</small>
      </span>
      <input
        class="settings-screen__input"
        type="number"
        step="1"
        min="0"
        :value="settings.shameTime"
        @change="updateShameTime"
      >
    </label>
    <label class="settings-screen__label">
      Mod timeout immunity
      <input
        class="settings-screen__checkbox"
        type="checkbox"
        :checked="settings.modImmunity"
        @change="updateModImmunity"
      >
    </label>
    <label class="settings-screen__label">
      Reset high score
      <button
        class="settings-screen__button"
        @click="resetHighScore"
      >
        Reset
      </button>
    </label>
    <label class="settings-screen__label">
      Theme
      <button
        class="settings-screen__button"
        @click="updateTheme"
      >
        {{ settings.theme }}
      </button>
    </label>

    <div class="settings-screen__predecesors">
      Don't forget to play
      <a
        target="_blank"
        href="https://katarn.itch.io/huezzle"
      >
        Huezzle<!--
      --></a>
      and
      <a
        target="_blank"
        href="https://rothiotome.itch.io/numerica"
      >
        Numerica<!--
      --></a>,
      the predecessors of this game.
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Settings, Theme } from '@/entities/Settings'

export default defineComponent({
  props: {
    settings: {
      required: true,
      type: Settings as PropType<Settings>
    }
  },

  emits: [
    'saveSettings'
  ],

  methods: {
    updateResponseTime (event: Event) {
      const target = event.target as HTMLInputElement
      this.settings.setResponseTime(Number(target.value))
      this.$emit('saveSettings')
    },

    updateShameTime (event: Event) {
      const target = event.target as HTMLInputElement
      this.settings.setShameTime(Number(target.value))
      this.$emit('saveSettings')
    },

    updateShameRounds (event: Event) {
      const target = event.target as HTMLInputElement
      this.settings.setShameRounds(target.checked)
      this.$emit('saveSettings')
    },

    updateModImmunity (event: Event) {
      const target = event.target as HTMLInputElement
      this.settings.setModImmunity(target.checked)
      this.$emit('saveSettings')
    },

    resetHighScore () {
      this.settings.setHighScore(null, null)
      this.$emit('saveSettings')
    },

    updateTheme () {
      const themes = Object.values(Theme)
      const theme = themes[themes.findIndex(theme => theme === this.settings.theme) + 1] ?? themes[0]
      this.settings.setTheme(theme)
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/text-stroke';

.settings-screen {
  &__container {
    background: #fff;
    position: absolute;
    inset: 0;
    padding: 2rem;
    transition: all 0.2s linear;
  }

  &__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__input {
    all: unset;
    padding: 0.4rem 1rem;
    border: solid 1px #000;
    border-radius: 99rem;
    width: 4rem;
    text-align: right;
  }

  &__checkbox {

  }

  &__button {

  }

  &__credits {
    text-align: center;
    margin-bottom: 3rem;

    strong {
      display: block;
      font-size: 1.4rem;
      font-weight: 700;
    }

    a {
      display: block;
      font-size: 1.4rem;
      color: #2ecc71;
    }
  }

  &__predecesors {
    margin-top: 3rem;
    text-align: center;

    a {
      color: #2ecc71;
    }
  }
}
</style>
