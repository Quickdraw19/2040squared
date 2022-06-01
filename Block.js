export default class Block {
   blockElement
   #x
   #y
   #blockValue
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

      this.blockValue = this.getBlockValue(onlyNumbers)
   }

   get blockValue() {
      return this.#blockValue
   }

   set blockValue(v) {
      this.#blockValue = v
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

   set x(blockValue) {
      this.#x = blockValue
      this.blockElement.style.setProperty("--x", blockValue)
   }

   set y(blockValue) {
      this.#y = blockValue
      this.blockElement.style.setProperty("--y", blockValue)
   }

   // Decided to always start with numbers.
   getBlockValue(onlyNumber) {
      if (!onlyNumber) {
         let dealSpecialBlock = Math.random() <= this.specialProb

         if (dealSpecialBlock) {
            let useZero = this.blockTypes & 2
            let useNeg  = this.blockTypes & 4
            let useMult = this.blockTypes & 8

            // Order of precedence I decided upon for now...
            if (useMult) {
               let dealMultiplier =  Math.random() <= this.multiplyProb
               if (dealMultiplier) {
                  return "X"
               }
            }

            if (useZero) {
               let dealZero = Math.random() <= 0.5
               if (dealZero) {
                  return '0'
               }
            }

            if (useNeg) {
               return '⍬'
            }

            // If a special block is called for and none are picked, there isn't an 
            // uncomplicated way to return a default. I had the default of Neg, but 
            // if neg isn't allowed in the options, then it was returning it anyway.
            // I figured it's better to return a regular number.
         }
      }

      return Math.random() > 0.5 ? 2 : 4
   }

   remove = () => this.blockElement.remove()

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
