<template>
  <div class="game-board__container">
    <div
      v-if="highScoreRound && highScoreUserName"
      class="game-board__high-score"
    >
      HIGH SCORE:
      <span class="game-board__high-score-alt">
        {{ highScoreRound }}
      </span><br>
      by
      <span
        class="game-board__high-score-alt"
        :style="{
          '--color': highScoreUserColor
        }"
      >
        {{ highScoreUserName }}
      </span>
    </div>

    <div class="game-board__round">
      Round {{ round }}
    </div>

    <TransitionGroup
      tag="div"
      class="game-board__question"
      name="game-board__fade"
    >
      <div
        class="game-board__cell"
        :style="{
          '--color': firstColor
        }"
        :key="firstColor"
      >
      </div>

      <div
        v-if="secondColor"
        class="game-board__cell"
        :style="{
          '--color': secondColor
        }"
        :key="secondColor"
      >
      </div>
    </TransitionGroup>

    <TransitionGroup
      tag="div"
      class="game-board__answers"
      name="game-board__fade"
    >
      <div
        v-for="colorOption in colorOptions"
        class="game-board__cell"
        :style="{
          '--color': colorOption.color
        }"
        :key="colorOption.color"
      >
        <span
          class="game-board__cell-number"
          v-if="status === Status.waitingForResponse"
        >
          {{ colorOption.number }}
        </span>
      </div>
    </TransitionGroup>

    <div
      v-if="lastUserName"
      class="game-board__footer"
      :style="{
        '--color': lastUserColor
      }"
    >
      {{ lastUserName }}
    </div>
    <div
      v-else-if="shamedUserName"
      class="game-board__footer game-board__footer--shame"
    >
      Shame on
      <span
        class="game-board__footer-alt"
        :style="{
          '--color': shamedUserColor
        }"
      >
        {{ shamedUserName }}
      </span>!
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'
import { Chat } from 'twitch-js'

interface Option {
  color: string
  number: number
}

enum Status {
  startingGame = 'startingGame',
  generatingRound = 'generatingRound',
  waitingForResponse = 'waitingForResponse',
}

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
      firstColor: this.colorGenerator.generateMain() as string | null,
      secondColor: null as string | null,
      correctOption: null as Option | null,
      colorOptions: [] as Option[],
      round: 0 as number,
      lastUserName: null as string | null,
      lastUserColor: null as string | null,
      status: Status.startingGame as Status,
      shamedUserName: null as string | null,
      shamedUserColor: null as string | null,
      highScoreUserName: null as string | null,
      highScoreUserColor: null as string | null,
      highScoreRound: null as number | null
    }
  },

  computed: {
    Status () {
      return Status
    },

    optionsCount (): number {
      let round = this.round

      if ((round -= 10) <= 0) return 2
      if ((round -= 9) <= 0) return 3
      if ((round -= 8) <= 0) return 4
      if ((round -= 7) <= 0) return 5
      if ((round -= 6) <= 0) return 6
      if ((round -= 5) <= 0) return 7
      if ((round -= 4) <= 0) return 8

      return 9
    }
  },

  methods: {
    // eslint-disable-next-line
    handleChat (event: any): void {
      const {
        message,
        tags: {
          color: userColor,
          displayName: userName
        }
      } = event

      if (
        this.status !== Status.waitingForResponse
        // this.lastUserName === userName
      ) {
        return
      }

      const response = parseInt(message)

      if (`${response}` !== message) {
        return
      }

      if (response !== this.correctOption?.number) {
        this.finishGame(userName, userColor)
        return
      }

      this.lastUserName = userName
      this.lastUserColor = userColor
      this.startRound()
    },

    async finishGame (userName: string, userColor: string): Promise<void> {
      this.status = Status.startingGame

      this.shamedUserName = userName
      this.shamedUserColor = userColor

      if (
        !this.highScoreRound ||
        this.highScoreRound < this.round - 1
      ) {
        this.highScoreUserName = this.lastUserName
        this.highScoreUserColor = this.lastUserColor
        this.highScoreRound = this.round - 1
      }

      this.round = 0
      this.lastUserName = null

      this.secondColor = null
      this.firstColor = null

      await this.sleep(250)

      this.firstColor = this.colorGenerator.generateMain()
      await this.startRound()
    },

    async sleep (milliseconds: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, milliseconds))
    },

    async startRound (): Promise<void> {
      if (
        !this.firstColor ||
        this.status === Status.generatingRound
      ) {
        return
      }

      this.status = Status.generatingRound

      if (this.secondColor) {
        this.firstColor = this.secondColor
      }

      this.round++
      this.secondColor = null
      this.colorOptions = []

      await this.sleep(250)
      this.secondColor = this.colorGenerator.generatePair(this.firstColor)
      await this.sleep(250)

      const correctOption = {
        color: this.colorGenerator.responseMix(this.firstColor, this.secondColor),
        number: this.random.intMinMax(1, this.optionsCount)
      }

      this.correctOption = correctOption

      const colorOptions: Option[] = Array.from(
        { length: this.optionsCount - 1 },
        (_, index) => ({
          color: this.colorGenerator.responseVariation(correctOption.color),
          number: index + (index < correctOption.number - 1 ? 1 : 2)
        })
      )
      colorOptions.push(correctOption)
      colorOptions.sort(() => this.random.from([-1, 1]))

      await colorOptions.reduce(async (promise, colorOption) => {
        await promise

        this.colorOptions.push(colorOption)

        await this.sleep(250)
      }, Promise.resolve())

      this.status = Status.waitingForResponse
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
.game-board {
  &__container {
    display: grid;
    gap: 1rem;
    background-color: #fff;
    height: 36rem;
    width: 24rem;
    aspect-ratio: 1 / 1;
    border-radius: 2rem;
    padding: 2rem;
    grid-template-areas:
      "high-score"
      "round"
      "question"
      "answers"
      "footer";
    grid-template-rows: 4rem auto auto 1fr 1.2rem;
  }

  &__high-score {
    line-height: 1;
    text-align: center;
    font-weight: 300;
    font-size: 2rem;
    grid-area: high-score;
  }

  &__high-score-alt {
    font-weight: 700;
    color: var(--color, #444);
    text-shadow: 0 0 0.2rem #0008;
  }

  &__round {
    line-height: 1;
    text-align: center;
    font-size: 1.2rem;
    grid-area: round;
  }

  &__question {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    grid-area: question;
  }

  &__fade-enter-from,
  &__fade-leave-to {
    opacity: 0;
    transform: scale(0.5);
  }

  &__cell {
    height: 5rem;
    width: 6rem;
    transition: all 0.2s linear;
    display: grid;
    place-content: center;
    font-size: 3rem;
    padding-top: 0.5rem;
    background-color: var(--color);
  }

  &__cell-number {
    color: #fff;
    text-shadow: 0 0 0.2rem #000;
    animation: fade 0.2s;

    @keyframes fade {
      from {
        color: transparent;
        text-shadow: 0 0 0.2rem transparent;
      }
      to {
        color: #fff;
        text-shadow: 0 0 0.2rem #000;
      }
    }
  }

  &__answers {
    display: flex;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    grid-area: answers;
  }

  &__footer {
    line-height: 1;
    text-align: center;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color, #444);
    text-shadow: 0 0 0.2rem #0008;
    grid-area: footer;

    &--shame {
      font-weight: 300;
      color: #000;
    }
  }

  &__footer-alt {
    font-weight: 700;
    color: var(--color, #444);
    text-shadow: 0 0 0.2rem #0008;
  }
}
</style>
