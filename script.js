import Grid from "./Grid.js"
import Block from "./Block.js"

// Gameboard setup...
const GAME_BOARD = document.getElementById("game-board")
const GRID = new Grid(GAME_BOARD)

// Game options...
const OPTIONS = {
   'specialBlockPercentage': 0.4, // Probability that a special block ("0", "⍬", "X") will appear; eg, 0.1 = 10%.
   'multiplierBlockPercentage': 0.2, // Probability that an "X" will appear as a special block; eg, 0.2 = 20% of the special blocks, or 2% of all blocks.
   'useblocks': 1 // block options: 1 = number, 2 = "0" , 4 = "⍬", 8 = "X", 16 = , 32 = , and so on...
}

// Intialize the game board with 2 numberic blocks....
GRID.getRandomEmptyCell().block = new Block(GAME_BOARD, OPTIONS, true)
GRID.getRandomEmptyCell().block = new Block(GAME_BOARD, OPTIONS, true)

// To track how many moves the players have made...
let MoveCount = 0

// Do this have to be called all the time after it's been used?
let inputHandler = () => window.addEventListener("keydown", handleKeydown, { once: true })

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

let SlideBlockUp = () => slideBlocks(GRID.cellsColumns)

let SlideBlockDown = () => slideBlocks(GRID.cellsColumns.map(column => [...column].reverse()))

let SlideBlockLeft = () => {
//console.log(GRID.cellRows)
   slideBlocks(GRID.cellRows)
}

let SlideBlockRight = () => {
//console.log(GRID.cellRows)
   slideBlocks(GRID.cellRows.map(row => [...row].reverse()))
}

function slideBlocks(cells) {
   return Promise.all( // Promise.all() waits for all async requests to be finished.
      cells.flatMap(group => { // flatMap() is a ES2019 function which combines the map() and flat() functions. map() applies a function to every non-empty element of an array. flat() flatten arrays. eg. [1, 2, 3, [4, 5]], gets turned into [1, 2, 3, 4, 5], [1, 2, [3, [4, 5]]] gets turned into [1, 2, 3, [4, 5]].
         let promises = [] // Array of individual promises.

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

function determineCanSlide(cells) {
   return cells.some(group => {
      return group.some((cell, index) => {
         if (index === 0) {
            return false
         }

         if (cell.block == null) {
            return false
         }

         let movingCell = group[index - 1]

         return movingCell.canAccept(cell.block)

      })
   })
}

function canSlideUp() {
   let canSlide = determineCanSlide(GRID.cellsColumns)
   return canSlide
}

function canSlideDown() {
   let canSlide =  determineCanSlide(GRID.cellsColumns.map(column => [...column].reverse()))
   return canSlide
}

function canSlideLeft() {
//   console.log(GRID.cellRows)
   let canSlide =  determineCanSlide(GRID.cellRows)
   return canSlide
}

function canSlideRight() {
//   console.log(GRID.cellRows)
   let canSlide =  determineCanSlide(GRID.cellRows.map(row => [...row].reverse()))
   return canSlide
}

function printGrid() {
   console.log(GRID.cellRows)
   GRID.cells.forEach(cell => console.log(cell))
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