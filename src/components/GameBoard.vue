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
        v-if="highScoreRound && highScoreAt"
        class="game-board__high-score-text"
      >
        HIGH SCORE:
        <strong class="game-board__high-score-alt">
          {{ highScoreRound }}
        </strong><br>
        <small class="game-board__high-score-at">
          at
          <strong class="game-board__high-score-alt">
            {{ highScoreAt }}
          </strong>
        </small>
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
        alt="Success!"
      >
      <img
        v-else-if="status === Status.wrongResponse"
        src="/img/wrong.svg"
        class="game-board__result-image"
        :key="Status.wrongResponse"
        alt="Wops!"
      >
      <TransitionGroup
        tag="div"
        v-else-if="status === Status.shamingUser"
        class="game-board__shame"
        name="game-board__up"
      >
        <div
          class="game-board__shame-title"
          key="title"
        >
          Who is to blame for these {{ currentGameWrongResponses }} errors?
        </div>
        <div
          v-if="shamedUserName"
          :key="shamedUserName"
          class="game-board__shame-picker"
          :style="{ '--color': shamedUserColor }"
        >
          {{ shamedUserName }}

        </div>
        <div
          v-if="shameObituary"
          class="game-board__shame-obituary"
          key="obituary"
        >
          {{ shameObituary }}
        </div>
      </TransitionGroup>
    </TransitionGroup>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ColorGenerator } from '@/services/ColorGenerator'
import { Random } from '@/services/Random'
import { Chat } from 'twitch-js'
import { Settings } from '@/entities/Settings'
import { DateTime } from 'luxon'

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
  shamingUser = 'shamingUser',
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

  emits: ['shameUser'],

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
      highScoreRound: null as number | null,
      highScoreAt: null as string | null,
      countdown: this.settings.responseTime as string | number,
      currentRoundResponses: {} as Record<UserId, number>,
      currentGameUsers: {} as Record<UserId, User>,
      shameObituary: null as string | null
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
    },

    currentGameWrongResponses (): number {
      return Object.values(this.currentGameUsers)
        .reduce((wrongResponses, currentGameUser) => wrongResponses + currentGameUser.wrongResponses, 0)
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

    async bigShame (): Promise<void> {
      this.status = Status.shamingUser
      const shamingUser = this.sleep(15_000)

      let counter = 50
      let timeout = 50
      let previousShamedUser = null as string | null

      while (timeout < 7_000) {
        counter *= 1.05
        timeout += counter

        setTimeout(() => {
          const shamedUser = Object.values(this.currentGameUsers)
            .filter(gameUser => gameUser.wrongResponses && gameUser.userName !== previousShamedUser)
            .sort(() => this.random.from([1, -1]))[0]

          if (!shamedUser) {
            return
          }

          previousShamedUser = shamedUser.userName
          this.shamedUserName = shamedUser.userName
          this.shamedUserColor = shamedUser.userColor
        }, timeout)
      }

      await this.sleep(8_000)
      Object.values(this.currentGameUsers)
        .sort(() => this.random.from([1, -1]))
        .reduce((shamedTicket, gameUser) => {
          if (shamedTicket <= gameUser.wrongResponses) {
            this.shamedUserName = gameUser.userName
            this.shamedUserColor = gameUser.userColor
            this.shameObituary = this.random.from([
              `Looks like someone with ${gameUser.wrongResponses} mistakes is to blame!`,
              `It's the one with ${gameUser.wrongResponses} errors that brought us down!`,
              `Oh no! Our downfall was caused by the person with ${gameUser.wrongResponses} mistakes.`,
              `Regrettably, someone with ${gameUser.wrongResponses} slip-ups made us lose.`,
              `Busted! The one with ${gameUser.wrongResponses} errors is the culprit.`,
              `It seems like the individual with ${gameUser.wrongResponses} mistakes is the weak link.`,
              `Missteps counted: ${gameUser.wrongResponses}. You know who you are!`,
              `Justice has its eyes on the person with ${gameUser.wrongResponses} errors.`,
              `Our fall can be traced back to the one with ${gameUser.wrongResponses} mistakes.`,
              `Alarm bells ring for the one with ${gameUser.wrongResponses} blunders.`,
              `We could've made it, if not for the player with ${gameUser.wrongResponses} errors.`,
              `Mistakes were made, especially by the one with ${gameUser.wrongResponses} of them.`,
              `Somebody with ${gameUser.wrongResponses} errors just became our Achilles' heel.`,
              `Ouch! The player with ${gameUser.wrongResponses} mistakes just tripped us up.`,
              `The spotlight's on the one with ${gameUser.wrongResponses} slip-ups. It's you, isn't it?`,
              `We were so close! The one with ${gameUser.wrongResponses} errors, stand up!`,
              `It's always the silent errors. Especially the ${gameUser.wrongResponses} from that person.`,
              `We're only as strong as our weakest link, and this time it's the one with ${gameUser.wrongResponses} mistakes.`,
              `Eyes are on the player who made ${gameUser.wrongResponses} errors.`,
              `A chain of events led us here, starting with the ${gameUser.wrongResponses} mistakes from you-know-who.`,
              `Who has ${gameUser.wrongResponses} errors? Step forward, it's time to face the music.`,
              `Our journey halted because of the one with ${gameUser.wrongResponses} mistakes.`,
              `Wish we could've avoided this, especially the person with ${gameUser.wrongResponses} errors.`,
              `Did you hear about the player with ${gameUser.wrongResponses} mistakes? That's where things went sideways.`,
              `The domino effect started with the one who made ${gameUser.wrongResponses} blunders.`,
              `History will remember the one with ${gameUser.wrongResponses} mistakes today.`,
              `Tales will be told of the player who made ${gameUser.wrongResponses} errors. Not the good kind, though.`,
              `The path was clear, until the one with ${gameUser.wrongResponses} mistakes stepped in.`,
              `If only we could turn back time, especially for the person with ${gameUser.wrongResponses} slip-ups.`,
              `Whispers go around about the one with ${gameUser.wrongResponses} mistakes. Any guesses?`,
              `Rumor has it, the one with ${gameUser.wrongResponses} errors is hiding among us.`,
              `We had the momentum! Until it was broken by the one with ${gameUser.wrongResponses} blunders.`,
              `Legends speak of players making mistakes, but today it's about the one with ${gameUser.wrongResponses}.`,
              `A perfect storm was created by someone, especially the one with ${gameUser.wrongResponses} slip-ups.`,
              `Guess who has ${gameUser.wrongResponses} mistakes and halted our progress? The suspense!`,
              `Turns out, our Kryptonite was the player with ${gameUser.wrongResponses} errors.`,
              `Roll the dice and it often lands on the one with ${gameUser.wrongResponses} mistakes.`,
              `We drew the short straw today, thanks to the player with ${gameUser.wrongResponses} errors.`,
              `Behind every downfall is a mistake or ${gameUser.wrongResponses} of them, in this case.`,
              `It's a twist in the tale, starring the one with ${gameUser.wrongResponses} blunders.`,
              `Everything was going smoothly until the player with ${gameUser.wrongResponses} errors threw us off track!`,
              `Today's defeat? Courtesy of the one with ${gameUser.wrongResponses} mistakes.`,
              `We had it all! And then came along the player with ${gameUser.wrongResponses} blunders.`,
              `The one with ${gameUser.wrongResponses} errors? Yeah, they're the reason we're not celebrating a win right now.`,
              `Our hopes were dashed, thanks to those ${gameUser.wrongResponses} mistakes from that individual.`,
              `We were on the verge of glory, but the one with ${gameUser.wrongResponses} slip-ups changed the game.`,
              `The trophy was almost ours, if not for the ${gameUser.wrongResponses} mistakes from that player.`,
              `The victory song turned into a lament, all because of the one with ${gameUser.wrongResponses} blunders.`,
              `We were writing a success story until the player with ${gameUser.wrongResponses} errors rewrote the ending.`,
              `Blame the weather, blame the stars, but most of all, blame the one with ${gameUser.wrongResponses} mistakes.`,
              `The road to success was blocked by the one and only with ${gameUser.wrongResponses} slip-ups.`,
              `In the grand scheme of things, those ${gameUser.wrongResponses} errors were our downfall.`,
              `Victory was in the air, until the scent of ${gameUser.wrongResponses} mistakes overpowered it.`,
              `The dream was alive, but got crushed under the weight of ${gameUser.wrongResponses} errors.`,
              `We had a game plan, but the one with ${gameUser.wrongResponses} blunders had other plans.`,
              `A single player can change the game, especially when they come with ${gameUser.wrongResponses} mistakes.`,
              `We could see the finish line, but the one with ${gameUser.wrongResponses} errors clouded our vision.`,
              `It was within our grasp! But those ${gameUser.wrongResponses} slip-ups let it slip away.`,
              `The headlines would've been different, if not for the one with ${gameUser.wrongResponses} mistakes.`,
              `Though the one with ${gameUser.wrongResponses} mistakes may have stumbled, remember we're all in this together. Let's pick each other up and try again!`
            ])

            this.$emit('shameUser', {
              userId: gameUser.userId,
              amount: this.settings.shameTime * this.currentGameWrongResponses
            })
          }

          return shamedTicket - gameUser.wrongResponses
        }, this.random.intMinMax(1, this.currentGameWrongResponses))

      await shamingUser
    },

    async finishGame (): Promise<void> {
      if (Object.values(this.currentGameUsers).length) {
        await this.bigShame()
      }

      this.status = Status.startingGame

      if (
        !this.highScoreRound ||
        this.highScoreRound < this.round - 1
      ) {
        this.highScoreRound = this.round - 1
        this.highScoreAt = DateTime.now()
          .setLocale('en-US')
          .toLocaleString(DateTime.DATE_MED)
      }

      this.shameObituary = null
      this.currentGameUsers = {}
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

      let correctResponses = 0

      for (const userId in this.currentRoundResponses) {
        if (!this.currentGameUsers[userId]) {
          continue
        }

        if (this.currentRoundResponses[userId] !== this.correctOption?.number) {
          this.currentGameUsers[userId].wrongResponses++
          this.$emit('shameUser', {
            userId,
            amount: this.settings.responseTime
          })
          continue
        }

        this.currentGameUsers[userId].correctResponses++
        correctResponses++
      }

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
    overflow: hidden;
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
  }

  &__high-score-at {
    font-size: 1.5rem;
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

  &__shame {
    position: absolute;
    inset: 0;
    background: #fff;
    z-index: 30;
    transition: all 0.2s linear;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    text-align: center;
  }

  &__shame-title {
    font-size: 2rem;
    font-weight: 300;
    transition: all 0.2s linear;
    padding: 6rem 2rem;
  }

  &__shame-picker {
    position: absolute;
    top: calc(50% - 1.5rem);
    width: 100%;
    font-size: 3rem;
    font-weight: 700;
    color: var(--color, #444);
    @include text-stroke(0.1rem, #000);
    transition: all 0.2s linear;
  }

  &__shame-obituary {
    padding: 6rem 2rem;
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
