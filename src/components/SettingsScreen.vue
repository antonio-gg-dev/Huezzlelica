<template>
  <div class="settings-screen__container">
    <div class="settings-screen__credits">
      <strong>Huezzlelica</strong>
      a game developed by
      <strong>Antonio González Gea</strong>
      as entry in the
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
    <!--
    <label class="settings-screen__label">
      Mod timeout immunity
      <input
        class="settings-screen__checkbox"
        type="checkbox"
        :checked="settings.modImmunity"
        @change="updateModImmunity"
      >
    </label>
    -->
    <label class="settings-screen__label">
      Allow change vote
      <input
        class="settings-screen__checkbox"
        type="checkbox"
        :checked="settings.allowVoteChange"
        @change="updateAllowVoteChange"
      >
    </label>
    <label class="settings-screen__label">
      Reset high score
      <button
        class="settings-screen__button"
        @click="resetHighScore"
        :disabled="!settings.highScoreAt || !settings.highScoreRound"
      >
        Reset
      </button>
    </label>
    <!--
    <label class="settings-screen__label">
      Theme
      <button
        class="settings-screen__button"
        @click="updateTheme"
      >
        {{ settings.theme }}
      </button>
    </label>
    -->

    <div class="settings-screen__inspiration">
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
      the inspiration of this game.
    </div>

    <button
      title="Close"
      class="settings-screen__close-button"
      @click="$emit('close')"
    >
      <img
        class="settings-screen__close-image"
        src="/img/close.svg"
        alt=""
      >
    </button>
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
    'saveSettings',
    'close'
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

    updateAllowVoteChange (event: Event) {
      const target = event.target as HTMLInputElement
      this.settings.setAllowVoteChange(target.checked)
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
    z-index: 50;
  }

  &__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__input {
    all: unset;
    padding: 0.5rem 1rem 0.4rem;
    border: solid 1px #0004;
    border-radius: 99rem;
    width: 4rem;
    text-align: right;
    transition: border-color 0.2s linear;

    &:hover, &:focus {
      border-color: #0008;
    }
  }

  &__checkbox {
    all: unset;
    width: 2rem;
    height: 2rem;
    background: url("~/public/img/checkbox-unchecked.svg") no-repeat center;
    background-size: contain;
    cursor: pointer;
    transition: opacity 0.2s linear;

    &:checked {
      background: url("~/public/img/checkbox-checked.svg") no-repeat center;
    }

    &:hover, &:focus {
      opacity: 0.6;
    }
  }

  &__button {
    all: unset;
    cursor: pointer;
    padding: 0.5rem 1rem 0.4rem;
    border: solid 1px #0004;
    border-radius: 99rem;
    width: 4rem;
    text-align: center;
    transition: all 0.2s linear;

    &:hover, &:focus {
      border-color: #0008;
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
    }
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

  &__inspiration {
    margin-top: 3rem;
    text-align: center;

    a {
      color: #2ecc71;
    }
  }

  &__close-button {
    all: unset;
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 2rem;
    height: 2rem;
    opacity: 0.2;
    transition: opacity 0.2s linear;
    cursor: pointer;
    text-align: center;

    &:hover, &:focus {
      opacity: 0.5;
    }
  }

  &__close-image {
    display: inline-block;
    height: 100%;
  }
}
</style>
