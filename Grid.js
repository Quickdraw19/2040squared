const GRID_SIZE = 4 // Number of columns and rows (square).
const CELL_SIZE = 10 // Size of each block in 'vmin' units.
const CELL_GAP = 1 // Size of the gap between each block in 'vmin' units.

var totalScore = 0 // Total score for the whole game.
var bonusX = 1
var lockedPoints = 0

export default class Grid {
  #cells // ? Array storing the cell info for the whole grid.

  // @gridElement: HTML element (ie. <div>) where the grid will be placed.
  constructor(gridElement) {
    // Set up the grid area.
    gridElement.style.setProperty("--grid-size", GRID_SIZE)
    gridElement.style.setProperty("--cell-size", `${CELL_SIZE}vmin`)
    gridElement.style.setProperty("--cell-gap", `${CELL_GAP}vmin`)

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
    const randomIndex = Math.floor(Math.random() * this.#emptyCells.length)
    return this.#emptyCells[randomIndex]
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
    // TODO: Apply bonus X to main score. Locked Points get wiped out if another pair of 0s merge.
    if (this.tile == null || this.mergeTile == null) {
      return
    }

    /*
    When two Xs are merged:
      Increase bonus multiplier (X) by 1.
      All score are multiplied by this factor, including recovered locked points.
        TODO: Perhaps double the X considering the theme of the game?
    */
    if (this.tile.value == 'X' && this.mergeTile.value == 'X') {
      this.mergeTile.remove()
      this.mergeTile = null
      this.tile.remove()
      this.tile = null
      bonusX = bonusX + 1
      document.getElementById('bonus-x').innerHTML = bonusX.toLocaleString()
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
      // TODO: This way, if you lock points and don't collect them before merging 0s again, then you lose all points. If that's too severe then I'll just have it replace the points.
      if (lockedPoints == 0) {
        lockedPoints = lockedPoints + totalScore
      } else {
        lockedPoints = 0
      }

      totalScore = 0
      document.getElementById('score-value').innerHTML = "0"
      document.getElementById('locked-points').innerHTML = lockedPoints.toLocaleString()
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

      totalScore = totalScore + (lockedPoints * bonusX)
      lockedPoints = 0

      document.getElementById('score-value').innerHTML = totalScore.toLocaleString()
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
      return
    }

    /*
      Everything else should be standard game tiles.
    */
    this.tile.value = this.tile.value + this.mergeTile.value
    totalScore += this.#tile.value * bonusX

    document.getElementById('score-value').innerHTML = totalScore.toLocaleString()

    this.mergeTile.remove()
    this.mergeTile = null
  }
}

function createCellElements(gridElement) {
  const cells = []

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement("div")
    cell.classList.add("cell")
    cells.push(cell)
    gridElement.append(cell)
  }

  return cells
}
