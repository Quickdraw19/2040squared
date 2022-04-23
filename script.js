import Grid from "./Grid.js"
import Tile from "./Tile.js"

const GAME_BOARD_DOM_DIV = document.getElementById("game-board")
const OPTIONS_OBJ = {
  'specialTilePercentage': 0.5, // Probability that a special tile ("0", "⍬", "X") will appear; eg, 0.1 = 10%.
  'multiplierTilePercentage': 0, // Probability that an "X" will appear as a special tile; eg, 0.2 = 20% of the special tiles, or 2% of all tiles.
  'useTiles': 7 // Tile options: 1 = number, 2 = "0" , 4 = "⍬", 8 = "X", 16 = , 32 = , and so on...
}

var MoveCount = 0

const GRID_OBJ_GRID = new Grid(GAME_BOARD_DOM_DIV)
GRID_OBJ_GRID.randomEmptyCell().tile = new Tile(GAME_BOARD_DOM_DIV, OPTIONS_OBJ, true)
GRID_OBJ_GRID.randomEmptyCell().tile = new Tile(GAME_BOARD_DOM_DIV, OPTIONS_OBJ, true)

let setupInputFunc = () => window.addEventListener("keydown", handleInput, { once: true })

setupInputFunc()

async function handleInput(e) {
  switch (e.key) {
    case "ArrowUp":
      if (!canMoveUpFunc()) {
        setupInputFunc()
        return
      }

      await moveUpFunc()
      break

    case "ArrowDown":
      if (!canMoveDownFunc()) {
        setupInputFunc()
        return
      }

      await moveDownFunc()
      break

    case "ArrowLeft":
      if (!canMoveLeftFunc()) {
        setupInputFunc()
        return
      }

      await moveLeftFunc()
      break

    case "ArrowRight":
      if (!canMoveRightFunc()) {
        setupInputFunc()
        return
      }

      await moveRightFunc()
      break

    default:
      setupInputFunc()
      return
  }
  
  MoveCount += 1
  $("#logging-div").prepend(`Move #${MoveCount}<br>`)

  GRID_OBJ_GRID.cells.forEach(cell => cell.mergeTiles())

  const NEW_TILE_OBJ_TILE = new Tile(GAME_BOARD_DOM_DIV, OPTIONS_OBJ, false)
  GRID_OBJ_GRID.randomEmptyCell().tile = NEW_TILE_OBJ_TILE

  if (!canMoveUpFunc() && !canMoveDownFunc() && !canMoveLeftFunc() && !canMoveRightFunc()) {
    NEW_TILE_OBJ_TILE.waitForTransition(true).then(() => {
      $('#game-over-div').html("No moves left...<br>Game over!").css("color", "red")
    })

    return
  }

  setupInputFunc()
}

let moveUpFunc = () => slideTiles(GRID_OBJ_GRID.cellsByColumn)

let moveDownFunc = () => slideTiles(GRID_OBJ_GRID.cellsByColumn.map(column => [...column].reverse()))

let moveLeftFunc = () => slideTiles(GRID_OBJ_GRID.cellsByRow)

let moveRightFunc = () => slideTiles(GRID_OBJ_GRID.cellsByRow.map(row => [...row].reverse()))

function slideTiles(cells) {
  return Promise.all(
    cells.flatMap(group => {
      const PROMISES_ARR = []

      for (let i = 1; i < group.length; i++) {
        const CELL_NUM = group[i]

        if (CELL_NUM.tile == null) {
          continue
        }

        let lastValidCellObjTile

        for (let j = i - 1; j >= 0; j--) {
          const MOVE_TO_CELL_NUM = group[j]

          if (!MOVE_TO_CELL_NUM.canAccept(CELL_NUM.tile)) {
            break
          }

          lastValidCellObjTile = MOVE_TO_CELL_NUM
        }

        if (lastValidCellObjTile != null) {
          PROMISES_ARR.push(CELL_NUM.tile.waitForTransition())

          if (lastValidCellObjTile.tile != null) {
            lastValidCellObjTile.mergeTile = CELL_NUM.tile
          } else {
            lastValidCellObjTile.tile = CELL_NUM.tile
          }

          CELL_NUM.tile = null
        }
      }

      return PROMISES_ARR
    })
  )
}

let canMoveUpFunc = () => canMove(GRID_OBJ_GRID.cellsByColumn)

let canMoveDownFunc = () => canMove(GRID_OBJ_GRID.cellsByColumn.map(column => [...column].reverse()))

let canMoveLeftFunc = () => canMove(GRID_OBJ_GRID.cellsByRow)

let canMoveRightFunc = () => canMove(GRID_OBJ_GRID.cellsByRow.map(row => [...row].reverse()))


function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) {
        return false
      }

      if (cell.tile == null) {
        return false
      }

      const MOVING_CELL_NUM = group[index - 1]

      let isMovableBool = MOVING_CELL_NUM.canAccept(cell.tile)
      return isMovableBool
    })
  })
}

// function download(filename, text) {
//   var elementDomA = document.createElement('a');
//   element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
//   element.setAttribute('download', filename);

//   element.style.display = 'none';
//   document.body.appendChild(element);

//   element.click();

//   document.body.removeChild(element);
// }