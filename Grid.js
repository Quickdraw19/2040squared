const GRID_SIZE_NUM = 4 // Number of columns and rows (square).
const CELL_SIZE_NUM = 10 // Size of each block in 'vmin' units.
const CELL_GAP_NUM = 1 // Size of the gap between each block in 'vmin' units.
const DEBUG_MODE = true // Displays a tile merge log.

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
    return this.#cells.filter(cell => cell.tile == null)
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
  #tile
  #mergeTile

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

  get tile() {
    return this.#tile
  }

  set tile(value) {
    this.#tile = value

    if (value == null) {
      return
    }

    this.#tile.x = this.#x
    this.#tile.y = this.#y
  }

  get mergeTile() {
    return this.#mergeTile
  }

  set mergeTile(value) {
    this.#mergeTile = value

    if (value == null) {
      return
    }

    this.#mergeTile.x = this.#x
    this.#mergeTile.y = this.#y
  }

  canAccept(tile) {
    if (this.tile == null) {
      return true
    }

    if (this.mergeTile == null && this.tile.value === tile.value) {
      return true
    }

    if ((this.tile.value == 0 || tile.value == 0) && (tile.value == '⍬' || this.tile.value == '⍬')) {
      return true
    }

    return false
  }

  mergeTiles() {
    if (this.tile == null || this.mergeTile == null) {
      if (DEBUG_MODE) {
        //$("#logging-div").append("<p>Nothing merged</p>")
      }

      return
    }

    /*
    When two Xs are merged:
      Increase bonus multiplier (X) by 1.
      All score are multiplied by this factor, including recovered locked points.
    */
    if (this.tile.value == 'X' && this.mergeTile.value == 'X') {
      this.mergeTile.remove()
      this.mergeTile = null
      this.tile.remove()
      this.tile = null
      bonusX = bonusX + 1
      document.getElementById('bonus-x').innerHTML = bonusX.toLocaleString()

      if (DEBUG_MODE) {
        $("#logging-div").append("<p>Xs merged</p>")
      }

      return
    }

    /* 
      When two 0s are merged:
        Zero out the total score and move it to "locked points".
        Points can be recovered from merging two ⍬s.
        If two 0s are merged again before locked points are collected, both scores are wiped.
    */
    if (this.tile.value == 0 && this.mergeTile.value == 0) {
      this.mergeTile.remove()
      this.mergeTile = null
      this.tile.remove()
      this.tile = null

      // If there are no locked points, then lock the current score.
      // If there are already locked points, then wipe out the points.
      if (lockedPointsNum == 0) {
        lockedPointsNum = lockedPointsNum + totalScoreNum
      } else {
        lockedPointsNum = 0
      }

      if (DEBUG_MODE) {
        $("#logging-div").append("<p>0s merged</p>")
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
    if (this.tile.value == '⍬' && this.mergeTile.value == '⍬') {
      this.mergeTile.remove()
      this.mergeTile = null
      this.tile.remove()
      this.tile = null

      totalScoreNum = totalScoreNum + (lockedPointsNum * bonusXNum)

      if (DEBUG_MODE) {
        $("#logging-div").append("<p>⍬s merged</p>")
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
    if ((this.tile.value == 0 && this.mergeTile.value == '⍬') || (this.tile.value == '⍬' && this.mergeTile.value == 0)) {
      this.mergeTile.remove()
      this.mergeTile = null
      this.tile.remove()
      this.tile = null

      if (DEBUG_MODE) {
        $("#logging-div").append("<p>⍬ and 0 cancelled</p>")
      }

      return
    }

    /*
      Everything else should be standard game tiles.
    */
    this.tile.value = this.tile.value + this.mergeTile.value
    totalScoreNum += this.#tile.value * bonusXNum

    document.getElementById('score-value').innerHTML = totalScoreNum.toLocaleString()

    this.mergeTile.remove()
    this.mergeTile = null

    if (DEBUG_MODE) {
      $("#logging-div").append("<p>Numbers merged</p>")
    }
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
