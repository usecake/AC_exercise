//狀態機
const GAME_STATE = {
  firstCardAwaits: 'firstCardAwaits',
  secondCardAwaits: 'secondCardAwaits',
  cardsUnmatched: 'cardsUnmatched',
  cardsMatched: 'cardsMatched',
  gameFinished: 'GameFinished'
}
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0,

}
const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent(index) {
    const symbol = Symbols[Math.floor(index / 13)]
    const number = this.transformNumber((index % 13) + 1)
    return `
        <p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>
    `
  },
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
  flipCards(...cards) {
    cards.map(card => {
      // if 背面，回傳正面
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // if 正面，回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score:${score}`
  },
  renderTriedTimes(triedTimes) {
    document.querySelector('.triedtimes').textContent = `You've tried ${triedTimes} times`
  },
  appendUnmatchedAnimation(...cards) {
    cards.map(card => {
      card.classList.add('unmatched')
      card.addEventListener('animationend', event =>
        card.classList.remove('unmatched'), {once: true})
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Completed!</P>
    <p>You have tried ${model.triedTimes} times.</p>
    `
    const header = document.querySelector('#header');
    header.before(div)
  }
}
const controller = {
  currentState: GAME_STATE.firstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.firstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.secondCardAwaits
        break
      case GAME_STATE.secondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        if (model.isRevealedCardsMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.cardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.gameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.firstCardAwaits
        } else {
          this.currentState = GAME_STATE.cardsUnmatched
          view.appendUnmatchedAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1250)
        }
        break
    }
    console.log('current state:', this.currentState)
    console.log('revealed cards index:', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.firstCardAwaits
  },
}
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}
controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})