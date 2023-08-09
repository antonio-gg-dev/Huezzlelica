<template>
  <div class="log-in__container">
    <h1 class="log-in__title">
      Huezzlelica
    </h1>

    <template v-if="!token">
      <div class="log-in__danger">
        <strong class="log-in__danger-title">
          Before logging in!
        </strong>
        Make sure you don't cast this window to prevent your token from being leaked.
      </div>

      <a
        class="log-in__button"
        :href="logInUrl"
      >
        Log In!
      </a>
    </template>

    <div v-else>
      <div class="log-in__row">
        <input
          class="log-in__input"
          type="text"
          readonly
          :value="url"
        >

        <button
          class="log-in__button log-in__button--clipboard"
          @click="clipboard"
          title="Copy to clipboard"
        >
          <img
            src="/img/clipboard.svg"
            alt=""
          >
        </button>
      </div>

      <div class="log-in__info">
        Copy this link into OBS Browser Source to start playing.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    token: {
      required: false,
      default: null,
      type: String as PropType<null | string>
    }
  },

  computed: {
    logInUrl () {
      const params = new URLSearchParams({
        client_id: 'cfwuumfbowfdcz3qv6qh1v03dy4s0u',
        redirect_uri: 'https://huezzlelica.antonio.gg/',
        response_type: 'token id_token',
        scope: 'openid moderator:manage:banned_users'
      })

      return new URL(`https://id.twitch.tv/oauth2/authorize?${params}`)
    },

    url (): string {
      return `https://huezzlelica.antonio.gg/#/play/${this.token}`
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
.log-in {
  &__container {
    background-color: #fff;
    border-radius: 2rem;
    padding: 2rem;
  }

  &__title {
    font-size: 3rem;
    font-weight: 300;
    margin: 0 0 2rem;
    text-align: center;
  }

  &__danger {
    background-color: #fde8ec;
    border-left: #dc143c solid 0.5rem;
    padding: 1rem 2rem;
    margin-bottom: 2rem;
    border-radius: 0.1rem;
  }

  &__danger-title {
    display: block;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  &__button {
    all: unset;
    display: block;
    color: #000;
    box-shadow: 0 0 0.1rem 0 #0004,
      0 0.1rem 0.3rem 0 #0004;
    background-color: #2ecc71;
    padding: 1rem 2rem;
    border-radius: 99rem;
    transition: background-color calc(0.2s * var(--speed, 1)) linear;
    cursor: pointer;
    margin: 0 auto;
    width: fit-content;

    &:hover, &focus {
      background-color: #44db86;
    }

    &--clipboard {
      display: inline-flex;
      justify-content: center;
      align-content: center;
      height: 3rem;
      width: 3rem;
      padding: 1rem;
      margin: 0 0 0 2rem;
      flex-shrink: 0;
    }
  }

  &__input {
    all: unset;
    display: inline-block;
    color: #000;
    box-shadow: inset 0 0 0.1rem 0 #0004,
      inset 0 0.1rem 0.3rem 0 #0004;
    background-color: #eee;
    padding: 1rem 2rem;
    border-radius: 99rem;
    transition: background-color calc(0.2s * var(--speed, 1)) linear;
    cursor: text;
    height: 3rem;
    margin: 0;
    flex-grow: 1;

    &:hover, &focus {
      background-color: #fff;
    }
  }

  &__row {
    display: flex;
    margin-bottom: 2rem;
  }

  &__info {
    background-color: #eafaf1;
    border-left: #2ecc71 solid 0.5rem;
    padding: 1rem 2rem;
    border-radius: 0.1rem;
  }
}
</style>
