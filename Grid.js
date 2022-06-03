const GRID_SIZE = 4 // Number of columns and rows (square).
const CELL_SIZE = 10 // Size of each block in 'vmin' units.
const CELL_PADDING = 1 // Size of the gap between each block in 'vmin' units.
const DEBUG_MODE = true // Displays a block merge log.

var totalScoreNum = 0 // Total score for the whole game.
var bonusXNum = 1
var lockedPointsNum = 0

export default class Grid {
   #cells // ? Array storing the cell info for the whole grid.

   // @gridElement: HTML element (ie. <div>) where the grid will be placed.
   constructor(gridElement) {
      // Set up the grid area.
      gridElement.style.setProperty("--grid-size", GRID_SIZE)
      gridElement.style.setProperty("--cell-size", `${CELL_SIZE}vmin`)
      gridElement.style.setProperty("--cell-padding", `${CELL_PADDING}vmin`)

      // Set up the block within the grid.
      // map() runs a given function for each element of an array.
      this.#cells = createCellElements(gridElement).map(
         function (cellElement, index) { // Current element in the array, array index of the element.
            let block = new Cell(
               cellElement,
               index % GRID_SIZE,
               Math.floor(index / GRID_SIZE)
               )

            return block
      })
   }

   get cells() {
      return this.#cells
   }

   get cellRows() {
      return this.#cells.reduce((cellGrid, cell) => {
         cellGrid[cell.y] = cellGrid[cell.y] || []
         cellGrid[cell.y][cell.x] = cell
         return cellGrid
      }, [])

   }

   get cellsColumns() {
      return this.#cells.reduce((cellGrid, cell) => {
         cellGrid[cell.x] = cellGrid[cell.x] || []
         cellGrid[cell.x][cell.y] = cell
         return cellGrid
      }, [])
   }

   get #emptyCells() {
      return this.#cells.filter(cell => cell.block == null)
   }

   getRandomEmptyCell() {
      const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)
      return this.#emptyCells[randomIndex]
   }
}

class Cell {
   #cellElement
   #x
   #y
   #block
   #mergeBlock

   constructor(cellElement, x, y) {
      this.#cellElement = cellElement
      this.#x = x
      this.#y = y
   }

   get x() {
      return this.#x
   }

   get y() {
      return this.#y
   }

   get block() {
      return this.#block
   }

   set block(value) {
      this.#block = value

      if (value == null) {
         return
      }

      this.#block.x = this.#x
      this.#block.y = this.#y
   }

   get mergeBlock() {
      return this.#mergeBlock
   }

   set mergeBlock(value) {
      this.#mergeBlock = value

      if (value == null) {
         return
      }

      this.#mergeBlock.x = this.#x
      this.#mergeBlock.y = this.#y
   }

   canAccept = (block) => (this.block == null || (this.mergeBlock == null && this.block.blockValue === block.blockValue))

   mergeBlocks() {
      if (this.block == null || this.mergeBlock == null) {
         return
      }

      /*
      When two Xs are merged:
      Increase bonus multiplier (X) by 1.
      All score are multiplied by this factor, including recovered locked points.
      */
      if (this.block.blockValue == 'X' && this.mergeBlock.blockValue == 'X') {
         this.mergeBlock.remove()
         this.mergeBlock = null
         this.block.remove()
         this.block = null
         bonusX = bonusX + 1
         document.getElementById('bonus-x').innerHTML = bonusX.toLocaleString()

         if (DEBUG_MODE) {
            $("#logging-div").prepend("Xs merged<br>")
         }

         return
      }

      /* 
      When two 0s are merged:
      Zero out the total score and move it to "locked points".
      Points can be recovered from merging two ⍬s.
      If two 0s are merged again before locked points are collected, both scores are wiped.
      */
      if (this.block.blockValue == 0 && this.mergeBlock.blockValue == 0) {
         this.mergeBlock.remove()
         this.mergeBlock = null
         this.block.remove()
         this.block = null

         // If there are no locked points, then lock the current score.
         // If there are already locked points, then wipe out the points.
         if (lockedPointsNum == 0) {
            lockedPointsNum = lockedPointsNum + totalScoreNum
         } else {
            lockedPointsNum = 0
         }

         if (DEBUG_MODE) {
            $("#logging-div").prepend("0s merged<br>")
         }

         totalScoreNum = 0
         document.getElementById('score-value').innerHTML = "0"
         document.getElementById('locked-points').innerHTML = lockedPointsNum.toLocaleString()
         return
      }

      /*
      When two ⍬s are merged:
      Recovers locked points and is added back to total score times the X factor.
      */
      if (this.block.blockValue == '⍬' && this.mergeBlock.blockValue == '⍬') {
         this.mergeBlock.remove()
         this.mergeBlock = null
         this.block.remove()
         this.block = null

         totalScoreNum = totalScoreNum + (lockedPointsNum * bonusXNum)

         if (DEBUG_MODE) {
            $("#logging-div").prepend("⍬s merged<br>")
         }

         lockedPointsNum = 0

         document.getElementById('score-value').innerHTML = totalScoreNum.toLocaleString()
         document.getElementById('locked-points').innerHTML = "0"
         document.getElementById('bonus-x').innerHTML = "1"
         return
      }

      /*
      When ⍬ and 0 are merged:
      Cancels each other out.
      */
      if ((this.block.blockValue == 0 && this.mergeBlock.blockValue == '⍬') || (this.block.blockValue == '⍬' && this.mergeBlock.blockValue == 0)) {
         this.mergeBlock.remove()
         this.mergeBlock = null
         this.block.remove()
         this.block = null

         if (DEBUG_MODE) {
            $("#logging-div").prepend("⍬ and 0 cancelled<br>")
         }

         return
      }

      /*
      Everything else should be standard game blocks.
      */
      this.block.blockValue = this.block.blockValue + this.mergeBlock.blockValue
      totalScoreNum += this.#block.blockValue * bonusXNum

      if (DEBUG_MODE) {
         $("#logging-div").prepend(`Numbers merged: ${this.block.blockValue}<br>`)
      }

      document.getElementById('score-value').innerHTML = totalScoreNum.toLocaleString()

      this.mergeBlock.remove()
      this.mergeBlock = null
   }
}

function createCellElements(gridElement) {
   const newCells = []

   for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const cellDiv = document.createElement("div")
      cellDiv.classList.add("cell")
      newCells.push(cellDiv)
      gridElement.append(cellDiv)
   }

   return newCells
}
