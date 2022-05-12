import Grid from "./Grid.js"
import Block from "./Block.js"

// Gameboard setup...
const GAME_BOARD = document.getElementById("game-board")
const GRID = new Grid(GAME_BOARD)

// Game options...
const OPTIONS = {
   'specialBlockPercentage': 0.5, // Probability that a special block ("0", "⍬", "X") will appear; eg, 0.1 = 10%.
   'multiplierBlockPercentage': 0, // Probability that an "X" will appear as a special block; eg, 0.2 = 20% of the special blocks, or 2% of all blocks.
   'useblocks': 7 // block options: 1 = number, 2 = "0" , 4 = "⍬", 8 = "X", 16 = , 32 = , and so on...
}

// Intialize the game board with 2 numberic blocks....
GRID.getRandomEmptyCell().block = new Block(GAME_BOARD, OPTIONS, true)
GRID.getRandomEmptyCell().block = new Block(GAME_BOARD, OPTIONS, true)

// To track how many moves the players have made...
let MoveCount = 0

// Do this have to be called all the time after it's been used?
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
         if (!canSlideUp()) {
            inputHandler()
            return
         }
         
         SlideBlockUp()
         break

      case "ArrowDown":
         if (!canSlideDown()) {
            inputHandler()
            return
         }
         
         SlideBlockDown()
         break

      case "ArrowLeft":
         if (!canSlideLeft()) {
            inputHandler()
            return
         }
         
         SlideBlockLeft()
         break

      case "ArrowRight":
         if (!canSlideRight()) {
            inputHandler()
            return
         }
         
         SlideBlockRight()
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
   GRID.cells.forEach(cell => cell.mergeBlocks())

   // Create a new block to place on the game board after successful move and add it on a random grid location...
   let newBlock = new Block(GAME_BOARD, OPTIONS, false)
   GRID.getRandomEmptyCell().block = newBlock

   // After the new 
   if (!canSlideUp() && !canSlideDown() && !canSlideLeft() && !canSlideRight()) {
      newBlock.waitForTransition(true).then(() => {
         $('#game-over-div').html("No moves left...<br>Game over!").css("color", "red")
      })

      return
   }

   inputHandler()
}

let SlideBlockUp = () => slideBlocks(GRID.getCellsColumns)

let SlideBlockDown = () => slideBlocks(GRID.getCellsColumns.map(column => [...column].reverse()))

let SlideBlockLeft = () => slideBlocks(GRID.getCellRows)

let SlideBlockRight = () => slideBlocks(GRID.getCellRows.map(row => [...row].reverse()))

function slideBlocks(cells) {
   //@TODO - Make sure I understand what this promise is doing.
   return Promise.all(
      cells.flatMap(group => { //@TODO - what is flatMap() and what data is in `group`.
         let promises = [] //@TODO - make sure I understand what this is.

         for (let i = 1; i < group.length; i++) {
            let cellNumber = group[i]

            if (cellNumber.block == null) {
               continue //@TODO - make sure I understand what continue and break does in Javascript.
            }

            let lastValidCell //@TODO - what does a valid cell constitute and what is stored here?

            for (let j = i - 1; j >= 0; j--) {
               let moveToCell = group[j]

               if (!moveToCell.canAccept(cellNumber.block)) {
                  break
               }

               lastValidCell = moveToCell
            }

            if (lastValidCell != null) {
               promises.push(cellNumber.block.waitForTransition())

               if (lastValidCell.block != null) {
                  lastValidCell.mergeBlock = cellNumber.block
               } else {
                  lastValidCell.block = cellNumber.block
               }

               cellNumber.block = null
            }
         }

         return promises
      })
   )
}

function canSlideUp() {
   let canSlide = canSlide(GRID.getCellsColumns)
   return canSlide
}

function canSlideDown() {
   let canSlide =  canSlide(GRID.getCellsColumns.map(column => [...column].reverse()))
   return canSlide
}

function canSlideLeft() {
   let canSlide =  canSlide(GRID.getCellRows)
   return canSlide
}

function canSlideRight() {
   let canSlide =  canSlide(GRID.getCellRows.map(row => [...row].reverse()))
   return canSlide
}

function canSlide(cells) {
   return cells.some(group => {
      return group.some((cell, index) => {
         if (index === 0) {
            return false
         }

         if (cell.block == null) {
            return false
         }

         let movingCell = group[index - 1]

         let isMovableBool = movingCell.canAccept(cell.block)
         return isMovableBool
      })
   })
}

function printGrid() {
   //console.log(GRID.getCellRows)
   //GRID.cells.forEach(cell => console.log(cell))
   GRID.getCellRows.forEach(cell => console.log(cell))

}

// function download(filename, text) {
//   let elementDomA = document.createElement('a');
//   element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
//   element.setAttribute('download', filename);

//   element.style.display = 'none';
//   document.body.appendChild(element);

//   element.click();

//   document.body.removeChild(element);
// }