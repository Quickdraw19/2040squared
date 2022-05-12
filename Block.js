export default class Block {
   // Do these need to be private?
   blockElement
   x
   y
   value
   specialProb
   multiplyProb
   blockTypes

   constructor(blockContainer, options, onlyNumbers) {
      this.blockElement = document.createElement("div")
      this.blockElement.classList.add("block")
      blockContainer.append(this.blockElement)

      // Set options.
      this.specialProb = options.specialBlockPercentage
      this.multiplyProb = options.multiplierBlockPercentage
      this.blockTypes = options.useBlocks

      this.value = this.getBlockValue(onlyNumbers)
   }

   get value() {
      return this.value
   }

   /**
    * @param {string | number} v
    */
   set value(v) {
      this.value = v
      this.blockElement.textContent = v

      if (v == 0) {
         this.blockElement.style.setProperty("color", "white")
         this.blockElement.style.setProperty("background-color", "red")
      } else if (v == '⍬') {
         this.blockElement.style.setProperty("color", "yellow")
         this.blockElement.style.setProperty("background-color", "blue")
      } else if (v == 'X') {
         this.blockElement.style.setProperty("color", "white")
         this.blockElement.style.setProperty("background-color", "green")
      } else {
         let power = Math.log2(v)
         let bgLightness = 100 - power * 9

         this.blockElement.style.setProperty(
         "--background-lightness",
         `${bgLightness}%`
         )

         this.blockElement.style.setProperty(
         "--text-lightness",
         `${bgLightness <= 50 ? 90 : 10}%`
         )
      }
   }

   set x(value) {
      this.x = value
      this.blockElement.style.setProperty("--x", value)
   }

   set y(value) {
      this.y = value
      this.blockElement.style.setProperty("--y", value)
   }

   // Decided to always start with numbers.
   getBlockValue(onlyNumber) {
      if (!onlyNumber) {
         let dealSpecialBlock = Math.random() <= this.specialProb

         if (dealSpecialBlock) {
            let dealMultiplier =  Math.random() <= this.multiplyProb

            if (dealMultiplier) {
               return "X"
            }

            let useZero = this.blockTypes & 2
            let useNeg = this.blockTypes & 4

            if (useZero && useNeg) return Math.random() > 0.5 ? 0 : '⍬'
            if (useZero && !useNeg) return "0"
            // The only thing left...
            return "⍬"
         }
      }

      let randomNum = Math.random() > 0.5 ? 2 : 4
      return randomNum
   }

   //remove = () => this.blockElement.remove()

   waitForTransition(animation = false) {
      return new Promise(resolve => {
         this.blockElement.addEventListener(
            animation ? "animationend" : "transitionend",
            resolve,
            {
               once: true,
            }
         )
      })
   }
}
