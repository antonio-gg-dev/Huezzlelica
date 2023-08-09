<template>
  <div class="game-board__container">
    <TransitionGroup
      tag="div"
      class="game-board__cell game-board__cell--countdown-container"
      name="game-board__rotate"
    >
      <span
        class="game-board__cell game-board__cell--countdown-text"
        :key="countdown"
      >
        {{ countdown }}
      </span>
    </TransitionGroup>

    <TransitionGroup
      tag="div"
      class="game-board__high-score"
      name="game-board__fade"
    >
      <span
        v-if="highScoreRound && highScoreUserName"
        class="game-board__high-score-text"
      >
        HIGH SCORE:
        <span
          class="game-board__high-score-alt"
          :style="{ '--color': highScoreUserColor }"
        >
          {{ highScoreRound }}
        </span><br>
        by
        <span
          class="game-board__high-score-alt"
          :style="{ '--color': highScoreUserColor }"
        >
          {{ highScoreUserName }}
        </span>
      </span>
    </TransitionGroup>

    <TransitionGroup
      tag="div"
      class="game-board__round"
      name="game-board__fade"
    >
      <span
        class="game-board__round-text"
        :key="round"
      >
        Round {{ round }}
      </span>
    </TransitionGroup>

    <TransitionGroup
      tag="div"
      class="game-board__question"
      name="game-board__fade"
    >
      <div
        v-if="firstColor"
        class="game-board__cell"
        :style="{ '--color': firstColor }"
        :key="firstColor"
      >
      </div>

      <div
        class="game-board__cell"
        key="countdown"
      >
      </div>

      <div
        v-if="secondColor"
        class="game-board__cell"
        :style="{ '--color': secondColor }"
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
        :style="{ '--color': colorOption.color }"
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

    <TransitionGroup
      tag="div"
      class="game-board__footer"
      name="game-board__fade"
    >
      <span
        v-if="lastUserName"
        class="game-board__last-user"
        :style="{ '--color': lastUserColor }"
        :key="lastUserName"
      >
        {{ lastUserName }}
      </span>
      <span
        v-else-if="shamedUserName"
        class="game-board__shamed-user"
        :key="shamedUserName"
      >
      Shame on
      <span
        class="game-board__shamed-user-alt"
        :style="{ '--color': shamedUserColor }"
      >
        {{ shamedUserName }}
      </span>!
    </span>
    </TransitionGroup>
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
      required: true,
      type: Chat as PropType<Chat>
    }
  },

  emits: [
    'shameUser'
  ],

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
      highScoreRound: null as number | null,
      countdown: 3 as string | number
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
          displayName: userName,
          userId
        }
      } = event

      if (
        this.status !== Status.waitingForResponse ||
        this.lastUserName === userName
      ) {
        return
      }

      const response = parseInt(message)

      if (`${response}` !== message) {
        return
      }

      if (response !== this.correctOption?.number) {
        this.finishGame(userName, userColor, userId)
        return
      }

      this.lastUserName = userName
      this.lastUserColor = userColor
      this.startRound()
    },

    async finishGame (userName: string, userColor: string, userId: string): Promise<void> {
      this.status = Status.startingGame

      this.shamedUserName = userName
      this.shamedUserColor = userColor
      this.$emit('shameUser', {
        userId,
        round: this.round
      })

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
      this.countdown = 3
      setTimeout(() => { this.countdown = 2 }, 1_000)
      setTimeout(() => { this.countdown = 1 }, 2_000)
      setTimeout(() => { this.countdown = '?' }, 3_000)
      const generatingRoundTimer = this.sleep(3_200)

      if (this.secondColor) {
        this.firstColor = this.secondColor
        this.secondColor = null
        await this.sleep(250)
      }

      this.round++
      this.colorOptions = []

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

      await generatingRoundTimer
      this.status = Status.waitingForResponse
    }
  },

  mounted () {
    this.chat.on(Chat.Events.PRIVATE_MESSAGE, this.handleChat)

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
    grid-template-rows: 4rem 1.2rem 1fr 3fr 1.2rem;
    position: relative;
  }

  &__high-score {
    line-height: 1;
    text-align: center;
    font-weight: 300;
    font-size: 2rem;
    grid-area: high-score;
    position: relative;
  }

  &__high-score-text {
    transition: all 0.2s linear;
    position: absolute;
    inset: 0;
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
    position: relative;
  }

  &__round-text {
    transition: all 0.2s linear;
    position: absolute;
    inset: 0;
  }

  &__question {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    grid-area: question;
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

    &--countdown-container {
      position: absolute;
      top: 9.2rem;
      right: 50%;
      transform: translateX(50%);
      z-index: 10;
    }

    &--countdown-text {
      transition: all 0.4s linear;
      background: #fff8;
      position: absolute;
      border: solid 1px;
      inset: 0;
      backface-visibility: hidden;
    }
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
    text-shadow: 0 0 0.2rem #0008;
    grid-area: footer;
    position: relative;

  }

  &__last-user {
    transition: all 0.2s linear;
    position: absolute;
    color: var(--color, #444);
    inset: 0;
  }

  &__shamed-user {
    transition: all 0.2s linear;
    position: absolute;
    inset: 0;
    font-weight: 300;
    color: #000;
  }

  &__shamed-user-alt {
    font-weight: 700;
    color: var(--color, #444);
    text-shadow: 0 0 0.2rem #0008;
  }

  &__fade-enter-from,
  &__fade-leave-to {
    opacity: 0;
    transform: scale(0.5);
  }

  &__rotate-enter-from,
  &__rotate-leave-to {
    transform: rotateY(180deg);
  }
}
</style>
