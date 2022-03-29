const GRID_SIZE = 4 // Number of columns and rows (square).
const CELL_SIZE = 14 // Size of each block in 'vmin' units.
const CELL_GAP = 2 // Size of the gap between each block in 'vmin' units.
var totalScore = 0 // Total score for the whole game.

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

  canAccept = (tile) => (this.tile == null || (this.mergeTile == null && this.tile.value === tile.value))

  mergeTiles() {
    if (this.tile == null || this.mergeTile == null) {
      return
    }

    this.tile.value = this.tile.value + this.mergeTile.value
    totalScore += this.#tile.value

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
