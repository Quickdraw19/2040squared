export default class Tile {
  #tileElement
  #x
  #y
  #value

  constructor(tileContainer) {
    this.#tileElement = document.createElement("div")
    this.#tileElement.classList.add("tile")
    tileContainer.append(this.#tileElement)
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
    } else {
      const power = Math.log2(v)
      const backgroundLightness = 100 - power * 9
      this.#tileElement.style.setProperty(
        "--background-lightness",
        `${backgroundLightness}%`
      )
      this.#tileElement.style.setProperty(
        "--text-lightness",
        `${backgroundLightness <= 50 ? 90 : 10}%`
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
