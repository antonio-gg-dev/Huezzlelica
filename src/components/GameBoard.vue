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
      name="game-board__up"
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
        v-for="(colorOption, index) in colorOptions"
        class="game-board__cell"
        :style="{
          '--color': colorOption.color,
        }"
        :key="colorOption.color"
      >
        <span
          class="game-board__cell-number"
          v-if="status === Status.waitingForResponse"
        >
          {{ colorOption.number }}
        </span>

        <span
          class="game-board__cell-votes"
          v-if="status === Status.waitingForResponse"
          :style="{
            '--votes': optionsResponsesPercent[index]
          }"
        >
          {{ optionsResponsesPercent[index] }}
        </span>
      </div>
    </TransitionGroup>

    <TransitionGroup
      tag="div"
      class="game-board__footer"
      name="game-board__up"
    >
      <span
        v-if="lastUserName"
        class="game-board__footer-text"
        :key="lastUserName"
      >
        <span
          class="game-board__footer-alt"
          :style="{ '--color': lastUserColor }"
        >
          {{ lastUserName }}
        </span>
        voted
      </span>
      <span
        v-else-if="shamedUserName"
        class="game-board__footer-text"
        :key="shamedUserName"
      >
        Shame on
        <span
          class="game-board__footer-alt"
          :style="{ '--color': shamedUserColor }"
        >
          {{ shamedUserName }}
        </span>!
    </span>
    </TransitionGroup>

    <TransitionGroup
      tag="div"
      class="game-board__result"
      name="game-board__fade"
    >
      <img
        v-if="status === Status.correctResponse"
        src="/img/correct.svg"
        class="game-board__result-image"
        :key="Status.correctResponse"
      >
      <img
        v-else-if="status === Status.wrongResponse"
        src="/img/wrong.svg"
        class="game-board__result-image"
        :key="Status.wrongResponse"
      >
    </TransitionGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'
import { Chat } from 'twitch-js'
import { Settings } from '@/entities/Settings'

type UserId = string

interface User {
  userColor: string,
  userName: string,
  userId: UserId,
  correctResponses: number,
  wrongResponses: number,
}

interface Option {
  color: string
  number: number
}

enum Status {
  startingGame = 'startingGame',
  generatingRound = 'generatingRound',
  waitingForResponse = 'waitingForResponse',
  wrongResponse = 'wrongResponse',
  correctResponse = 'correctResponse',
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
    },
    settings: {
      required: true,
      type: Settings as PropType<Settings>
    }
  },

  emits: [
    'shameUser',
    'shameUsers'
  ],

  data () {
    return {
      firstColor: this.colorGenerator.generateMain() as string | null,
      secondColor: null as string | null,
      correctOption: null as Option | null,
      colorOptions: [] as Array<Option>,
      round: 1 as number,
      lastUserName: null as string | null,
      lastUserColor: null as string | null,
      status: Status.startingGame as Status,
      shamedUserName: null as string | null,
      shamedUserColor: null as string | null,
      highScoreUserName: null as string | null,
      highScoreUserColor: null as string | null,
      highScoreRound: null as number | null,
      countdown: this.settings.responseTime as string | number,
      currentRoundResponses: {} as Record<UserId, number>,
      currentGameUsers: {} as Record<UserId, User>
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
    },

    optionsResponsesAmount (): Array<number> {
      return this.colorOptions
        .map(color => Object.values(this.currentRoundResponses)
          .filter(response => response === color.number).length)
    },

    optionsResponsesPercent (): Array<string> {
      const responses = this.currentRoundResponsesAmount

      return this.optionsResponsesAmount
        .map(amount => ((amount / responses || 0) * 100).toFixed(1) + '%')
    },

    currentRoundResponsesAmount (): number {
      return Object.keys(this.currentRoundResponses).length
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

      if (this.status !== Status.waitingForResponse) {
        return
      }

      const response = parseInt(message)

      if (
        `${response}` !== message ||
        response < 1 ||
        response > 9 ||
        this.colorOptions.findIndex(option => option.number === response) === -1
      ) {
        return
      }

      if (this.currentGameUsers[userId] === undefined) {
        this.currentGameUsers[userId] = {
          userColor,
          userName,
          userId,
          correctResponses: 0,
          wrongResponses: 0
        }
      }

      this.currentRoundResponses[userId] = response
      this.lastUserName = userName
      this.lastUserColor = userColor
    },

    async finishGame (): Promise<void> {
      this.status = Status.startingGame

      // this.shamedUserName = userName
      // this.shamedUserColor = userColor
      // this.$emit('shameUser', {
      //   userId,
      //   round: this.round
      // })

      if (
        !this.highScoreRound ||
        this.highScoreRound < this.round - 1
      ) {
        this.highScoreUserName = this.lastUserName
        this.highScoreUserColor = this.lastUserColor
        this.highScoreRound = this.round - 1
      }

      this.round = 1
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
      if (!this.firstColor) {
        return
      }

      this.status = Status.generatingRound
      this.countdown = this.settings.responseTime
      setTimeout(() => { this.countdown = '?' }, this.settings.responseTime * 1_000)

      for (let countdown = 1; countdown < this.settings.responseTime; countdown++) {
        setTimeout(() => { this.countdown = countdown }, (this.settings.responseTime - countdown) * 1_000)
      }

      const finishRoundTimer = this.sleep(this.settings.responseTime * 1_000)

      if (this.secondColor) {
        this.firstColor = this.secondColor
        this.secondColor = null
        await this.sleep(250)
      }

      this.colorOptions = []

      this.secondColor = this.colorGenerator.generatePair(this.firstColor)
      await this.sleep(250)

      const optionNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
        .sort(() => this.random.from([-1, 1]))

      const correctOption = {
        color: this.colorGenerator.responseMix(this.firstColor, this.secondColor),
        number: optionNumbers[0]
      }

      this.correctOption = correctOption

      const colorOptions: Array<Option> = Array.from(
        { length: this.optionsCount - 1 },
        (_, index) => ({
          color: this.colorGenerator.responseVariation(correctOption.color),
          number: optionNumbers[index + 1]
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

      await finishRoundTimer
      this.finishRound()
    },

    async finishRound () {
      const showingResults = this.sleep(1_000)

      if (this.currentRoundResponsesAmount === 0) {
        this.status = Status.wrongResponse

        await showingResults
        this.finishGame()
        return
      }

      const shamedUserIds: Array<UserId> = []
      let correctResponses = 0

      for (const userId in this.currentRoundResponses) {
        if (!this.currentGameUsers[userId]) {
          continue
        }

        if (this.currentRoundResponses[userId] !== this.correctOption?.number) {
          this.currentGameUsers[userId].wrongResponses++
          shamedUserIds.push(userId)
          continue
        }

        this.currentGameUsers[userId].correctResponses++
        correctResponses++
      }

      this.$emit('shameUsers', {
        userIds: shamedUserIds,
        amount: this.settings.responseTime + 5
      })

      if (
        correctResponses < Math.max(...this.optionsResponsesAmount) ||
        this.optionsResponsesAmount.filter(responses => responses === correctResponses).length > 1
      ) {
        this.status = Status.wrongResponse

        await showingResults
        this.finishGame()
        return
      }

      this.status = Status.correctResponse
      this.round++
      this.currentRoundResponses = {}

      await showingResults
      this.startRound()
    }
  },

  mounted () {
    this.chat.on(Chat.Events.PRIVATE_MESSAGE, this.handleChat)

    this.startRound()
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/text-stroke';

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
    paint-order: stroke fill;
    @include text-stroke(0.1rem, #000);
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
    grid-template-rows: 1fr auto;
    align-items: center;
    text-align: center;
    font-size: 3rem;
    padding-top: 0.5rem;
    background-color: var(--color);

    &--countdown-container {
      position: absolute;
      top: 9.2rem;
      right: 50%;
      transform: translateX(50%);
      z-index: 10;
      grid-template-rows: 1fr;
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
    @include text-stroke(0.1rem, #000);
    animation: fade 0.2s;
    opacity: 1;

    @keyframes fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }

  &__cell-votes {
    display: flex;
    justify-content: center;
    padding-top: 0.2rem;
    font-size: 1rem;
    line-height: 1;
    height: 1.2rem;
    opacity: 1;
    width: 100%;
    white-space: nowrap;
    color: #000;
    paint-order: stroke fill;
    @include text-stroke(0.1rem, #fff6);
    animation: fade 0.2s;
    background: linear-gradient(
      90deg,
      #fffa var(--votes, 0%),
      transparent var(--votes, 0%),
      transparent
    );

    @keyframes fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
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
    grid-area: footer;
    position: relative;

  }

  &__footer-text {
    transition: all 0.2s linear;
    position: absolute;
    inset: 0;
    font-weight: 300;
    color: #000;
  }

  &__footer-alt {
    font-weight: 700;
    color: var(--color, #444);
    paint-order: stroke fill;
    @include text-stroke(0.1rem, #000);
  }

  &__result {
    position: absolute;
    inset: 0;
    display: grid;
    justify-content: center;
    align-items: center;
    z-index: 20;
  }

  &__result-image {
    height: 20rem;
    transition: all 0.2s linear;
  }

  &__fade-enter-from,
  &__fade-leave-to {
    opacity: 0;
    transform: scale(0.5);
  }

  &__up {
    &-enter-from {
      opacity: 0;
      transform: scale(0.5) translateY(2rem);
    }
    &-leave-to {
      opacity: 0;
      transform: scale(0.5) translateY(-2rem);
    }
  }

  &__rotate-enter-from,
  &__rotate-leave-to {
    transform: rotateY(180deg);
  }
}
</style>
