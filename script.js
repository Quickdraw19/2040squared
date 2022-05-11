import Grid from "./Grid.js"
import Block from "./Block.js"

// Gameboard setup...
const GAME_BOARD_DOM_DIV = document.getElementById("game-board")
const GRID_OBJ_GRID      = new Grid(GAME_BOARD_DOM_DIV)

// Game options...
const OPTIONS_OBJ = {
   'specialBlockPercentage': 0.5, // Probability that a special block ("0", "⍬", "X") will appear; eg, 0.1 = 10%.
   'multiplierBlockPercentage': 0, // Probability that an "X" will appear as a special block; eg, 0.2 = 20% of the special blocks, or 2% of all blocks.
   'useblocks': 7 // block options: 1 = number, 2 = "0" , 4 = "⍬", 8 = "X", 16 = , 32 = , and so on...
}

// Intialize the game board with 2 numberic blocks....
GRID_OBJ_GRID.randomEmptyCell().block = new Block(GAME_BOARD_DOM_DIV, OPTIONS_OBJ, true)
GRID_OBJ_GRID.randomEmptyCell().block = new Block(GAME_BOARD_DOM_DIV, OPTIONS_OBJ, true)

// To track how many moves the players have made...
var MoveCount = 0

//
function inputHandler() {
   window.addEventListener(
      "keydown", 
      handleKeydown, 
      {once: true}
   )
}

inputHandler()

//@QUES - Why does inputHandler need to keep being call again?
async function handleKeydown(e) {
   switch (e.key) {
      case "ArrowUp":
         if (!canMoveUp()) {
            inputHandler()
            return
         }
         //await 
         moveUpFunc()
         break

      case "ArrowDown":
         if (!canMoveDown()) {
            inputHandler()
            return
         }
         //await 
         moveDownFunc()
         break

      case "ArrowLeft":
         if (!canMoveLeft()) {
            inputHandler()
            return
         }
         //await 
         moveLeftFunc()
         break

      case "ArrowRight":
         if (!canMoveRight()) {
            inputHandler()
            return
         }
         //await 
         moveRightFunc()
         break

      case "i":
         printGrid()
         inputHandler()
         return

         default:
            inputHandler()
            return
   }

   MoveCount += 1
   $("#logging-div").prepend(`Move #${MoveCount}<br>`)

   // Execute the block moves...
   GRID_OBJ_GRID.cells.forEach(cell => cell.mergeBlocks())

   // Create a new block to place on the game board after successful move and add it on a random grid location...
   const NEW_BLOCK_OBJ_BLOCK = new Block(GAME_BOARD_DOM_DIV, OPTIONS_OBJ, false)
   GRID_OBJ_GRID.randomEmptyCell().block = NEW_BLOCK_OBJ_BLOCK

   // After the new 
   if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
      NEW_BLOCK_OBJ_BLOCK.waitForTransition(true).then(() => {
         $('#game-over-div').html("No moves left...<br>Game over!").css("color", "red")
      })

      return
   }

   inputHandler()
}

function moveUpFunc() {
   slideBlocks(GRID_OBJ_GRID.cellsByColumn)
}

function moveDownFunc() {
   slideBlocks(GRID_OBJ_GRID.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeftFunc() {
   slideBlocks(GRID_OBJ_GRID.cellsByRow)
}

function moveRightFunc() {
   slideBlocks(GRID_OBJ_GRID.cellsByRow.map(row => [...row].reverse()))
}

function slideBlocks(cells) {
   return Promise.all(
      cells.flatMap(group => {
         const PROMISES_ARR = []

         for (let i = 1; i < group.length; i++) {
            const CELL_NUM = group[i]

            if (CELL_NUM.block == null) {
               continue
            }

            let lastValidCellObjBlock

            for (let j = i - 1; j >= 0; j--) {
               const MOVE_TO_CELL_NUM = group[j]

               if (!MOVE_TO_CELL_NUM.canAccept(CELL_NUM.block)) {
                  break
               }

               lastValidCellObjBlock = MOVE_TO_CELL_NUM
            }

            if (lastValidCellObjBlock != null) {
               PROMISES_ARR.push(CELL_NUM.block.waitForTransition())

               if (lastValidCellObjBlock.block != null) {
                  lastValidCellObjBlock.mergeBlock = CELL_NUM.block
               } else {
                  lastValidCellObjBlock.block = CELL_NUM.block
               }

               CELL_NUM.block = null
            }
         }

         return PROMISES_ARR
      })
   )
}

// let canMoveUpFunc = () => canMove(GRID_OBJ_GRID.cellsByColumn)
// let canMoveDownFunc = () => canMove(GRID_OBJ_GRID.cellsByColumn.map(column => [...column].reverse()))
// let canMoveLeftFunc = () => canMove(GRID_OBJ_GRID.cellsByRow)
// let canMoveRightFunc = () => canMove(GRID_OBJ_GRID.cellsByRow.map(row => [...row].reverse()))
function canMoveUp() {
   return canMove(GRID_OBJ_GRID.cellsByColumn)
}

function canMoveDown() {
   return canMove(GRID_OBJ_GRID.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
   return canMove(GRID_OBJ_GRID.cellsByRow)
}

function canMoveRight() {
   return canMove(GRID_OBJ_GRID.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
   return cells.some(group => {
      return group.some((cell, index) => {
         if (index === 0) {
            return false
         }

         if (cell.block == null) {
            return false
         }

         const MOVING_CELL_NUM = group[index - 1]

         let isMovableBool = MOVING_CELL_NUM.canAccept(cell.block)
         return isMovableBool
      })
   })
}

function printGrid() {
   //console.log(GRID_OBJ_GRID.cellsByRow)
   //GRID_OBJ_GRID.cells.forEach(cell => console.log(cell))
   GRID_OBJ_GRID.cellsByRow.forEach(cell => console.log(cell))

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