export default class Tile {
  // Do these need to be private?
  #tileElement
  #x
  #y
  #value
  #specialProb
  #multiplyProb
  #tileTypes

  constructor(tileContainer, options) {
    this.#tileElement = document.createElement("div")
    this.#tileElement.classList.add("tile")
    tileContainer.append(this.#tileElement)

    // Set options.
    this.#specialProb = options.specialTilePercentage
    this.#multiplyProb = options.multiplierTilePercentage
    this.#tileTypes = options.useTiles

    this.value = this.getInitialValue()
  }

  get value() {
    return this.#value
  }

  set value(v) {
    this.#value = v
    this.#tileElement.textContent = v

    if (v == 0) {
      this.#tileElement.style.setProperty("color", "white")
      this.#tileElement.style.setProperty("background-color", "red")
    } else if (v == '⍬') {
      this.#tileElement.style.setProperty("color", "yellow")
      this.#tileElement.style.setProperty("background-color", "blue")
    } else if (v == 'X') {
      this.#tileElement.style.setProperty("color", "white")
      this.#tileElement.style.setProperty("background-color", "green")
    } else {
      const POWER_NUM = Math.log2(v)
      const BACKGROUND_LIGHTNESS_NUM = 100 - POWER_NUM * 9
      this.#tileElement.style.setProperty(
        "--background-lightness",
        `${BACKGROUND_LIGHTNESS_NUM}%`
      )
      this.#tileElement.style.setProperty(
        "--text-lightness",
        `${BACKGROUND_LIGHTNESS_NUM <= 50 ? 90 : 10}%`
      )
    }
  }

  set x(value) {
    this.#x = value
    this.#tileElement.style.setProperty("--x", value)
  }

  set y(value) {
    this.#y = value
    this.#tileElement.style.setProperty("--y", value)
  }

  getInitialValue() {
    // Check what bits are set.
    if (this.#tileTypes & 1) { }

    if (Math.random() <= this.#specialProb) {
      return Math.random() <= this.#multiplyProb ? 'X' : Math.random() > 0.5 ? 0 : '⍬'
    }

    return Math.random() > 0.5 ? 2 : 4
  }

  remove = () => this.#tileElement.remove()

  waitForTransition(animation = false) {
    return new Promise(resolve => {
      this.#tileElement.addEventListener(
        animation ? "animationend" : "transitionend",
        resolve,
        {
          once: true,
        }
      )
    })
  }
}
