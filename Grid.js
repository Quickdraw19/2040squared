const GRID_SIZE_NUM = 4 // Number of columns and rows (square).
const CELL_SIZE_NUM = 10 // Size of each block in 'vmin' units.
const CELL_GAP_NUM = 1 // Size of the gap between each block in 'vmin' units.
const DEBUG_MODE = true // Displays a block merge log.

var totalScoreNum = 0 // Total score for the whole game.
var bonusXNum = 1
var lockedPointsNum = 0

export default class Grid {
   #cells // ? Array storing the cell info for the whole grid.

   // @gridElement: HTML element (ie. <div>) where the grid will be placed.
   constructor(gridElement) {
      // Set up the grid area.
      gridElement.style.setProperty("--grid-size", GRID_SIZE_NUM)
      gridElement.style.setProperty("--cell-size", `${CELL_SIZE_NUM}vmin`)
      gridElement.style.setProperty("--cell-gap", `${CELL_GAP_NUM}vmin`)

      // Set up the block within the grid.
      // map() runs a given function for each element of an array.
      this.#cells = createCellElements(gridElement).map(
         function (cellElement, index) { // Current element in the array, array index of the element.
            let blockObjCell = new Cell(
               cellElement,
               index % GRID_SIZE_NUM,
               Math.floor(index / GRID_SIZE_NUM)
               )

            return blockObjCell
      })
   }

   get cells() {
      return this.#cells
   }

   get cellsByRow() {
      return this.#cells.reduce((cellGrid, cell) => {
         cellGrid[cell.y] = cellGrid[cell.y] || []
         cellGrid[cell.y][cell.x] = cell
         return cellGrid
      }, [])
   }

   get cellsByColumn() {
      return this.#cells.reduce((cellGrid, cell) => {
         cellGrid[cell.x] = cellGrid[cell.x] || []
         cellGrid[cell.x][cell.y] = cell
         return cellGrid
      }, [])
   }

   get #emptyCells() {
      return this.#cells.filter(cell => cell.block == null)
   }

   randomEmptyCell() {
      const RANDOM_INDEX_NUM = Math.floor(Math.random() * this.#emptyCells.length)
      return this.#emptyCells[RANDOM_INDEX_NUM]
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

   canAccept(block) {
      if (this.block == null) {
         return true
      }

      if (this.mergeBlock == null && this.block.value === block.value) {
         return true
      }

      if ((this.block.value == 0 || block.value == 0) && (block.value == '⍬' || this.block.value == '⍬')) {
         return true
      }

      return false
   }

   mergeBlocks() {
      if (this.block == null || this.mergeBlock == null) {
         return
      }

      /*
      When two Xs are merged:
      Increase bonus multiplier (X) by 1.
      All score are multiplied by this factor, including recovered locked points.
      */
      if (this.block.value == 'X' && this.mergeBlock.value == 'X') {
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
      if (this.block.value == 0 && this.mergeBlock.value == 0) {
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
      if (this.block.value == '⍬' && this.mergeBlock.value == '⍬') {
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
      if ((this.block.value == 0 && this.mergeBlock.value == '⍬') || (this.block.value == '⍬' && this.mergeBlock.value == 0)) {
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
      this.block.value = this.block.value + this.mergeBlock.value
      totalScoreNum += this.block.value * bonusXNum

      if (DEBUG_MODE) {
         $("#logging-div").prepend(`Numbers merged: ${this.block.value}<br>`)
      }

      document.getElementById('score-value').innerHTML = totalScoreNum.toLocaleString()

      this.mergeBlock.remove()
      this.mergeBlock = null
   }
}

function createCellElements(gridElement) {
const CELLS_ARR = []

   for (let i = 0; i < GRID_SIZE_NUM * GRID_SIZE_NUM; i++) {
      const CELL_DOM_DIV = document.createElement("div")
      CELL_DOM_DIV.classList.add("cell")
      CELLS_ARR.push(CELL_DOM_DIV)
      gridElement.append(CELL_DOM_DIV)
   }

   return CELLS_ARR
}
