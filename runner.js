import {Ghost,Pacman,GridBoard,Game} from './ObjectClasses.js';
import { getPath , heuristic,heuristic2 ,randomChoose , far_heuristic, escape} from './searchAlgorithims.js';

//_____________________________________main menu____________________________________________________________________________  
let container = document.getElementsByClassName("container")[0]
let gridElement = document.getElementsByClassName("grid")[0];
let messagePanel = document.getElementsByClassName("message-panel")[0]
let informationEl = document.getElementsByClassName("information")[0]
let mainMenu = createMainMenu()
container.appendChild(mainMenu)

let game;





window.onresize = function(event) {
  if (game != undefined && game != null) {
    game.pacman.updatePacman();
    game.updateGhosts()
    game.pacman.updatePacman()
  }
};



//update
let moving = [], step = [],prev = [], heuristicFunctions = [heuristic,randomChoose,randomChoose,randomChoose];
let prePacmanLocation
let inputDirection = null, direction = null, activities = null 

let modeCounter = setInterval(function () {
  if (game != undefined) {
    game.escapeSeconds > 0 ? game.escapeSeconds -= 1 : false
    if (game.escapeSeconds == 0) {
      game.mode = 'normal'
      game.ghostsChangeMode();
    }
  }
  
}, 1000)


//manager of all activites of the game 
const activition = (act) => act = setInterval(function(){

  //check for lose(if ghost and pacman are in same cell)

  if (inputDirection!=null){
    //check if the input direction is legal for pacman
    if (game.gridBoard.checkForPath(game.pacman.currentLocation).includes(inputDirection)){
      direction = inputDirection//if legal
    }
  }



  //change pacman location
 
  //search for path for ghosts to pacman
    if (game.mode == 'normal') searchNormal();
  if (game.mode == 'escape') searchEscape();
    changeGhostsLocation()

  if (game.checkConflict()){
    if (game.health <= 0|| game.remainPoints == 0) endGame(game);//end game if the all pacman trials failed
    informationEl.childNodes[2].innerHTML=`${game.health}`
    clearInterval(activities)
  }
  //change ghost location 

  direction != null ? game.changePacmanLocation(direction) : false

 if (game.checkConflict()){
    if (game.health <= 0 || game.remainPoints == 0) endGame(game);//end game if the all pacman trials failed
    informationEl.childNodes[2].innerHTML=`${game.health}`
    clearInterval(activities)
  }

 

},200)

function searchNormal() {
  for (let g = 0; g < game.ghostlist.length; g++){
    if (game.ghostlist[g].mode != 'eaten') {
      moving[g] = getPath(game.ghostlist[g].currentLocation, game.pacman.currentLocation, game.gridBoard.boardArray, heuristicFunctions[g]);
      step[g] = 1;
      prePacmanLocation = game.pacman.currentLocation
    }
      }
}

function searchEscape() {
  for (let g = 0; g < game.ghostlist.length; g++) {
    if (game.ghostlist[g].mode == 'eaten') {
      moving[g] = getPath(game.ghostlist[g].currentLocation, game.ghostlist[g].initialLocation, game.gridBoard.boardArray, heuristic);
      step[g] = 1;
    } else {
      moving[g] = escape(game.ghostlist[g].currentLocation, game.pacman.currentLocation, game.gridBoard.boardArray, prev[g])
      step[g] = 1
    }
  }
}

function changeGhostsLocation() {
    for (let g = 0 ; g<game.ghostlist.length;g++){
      if (step[g] < moving[g].length) {
      prev[g] =  game.ghostlist[g].currentLocation
    game.ghostlist[g].changeLocation(moving[g][step[g]][0],moving[g][step[g]][1])
      step[g] += 1;
        if (game.ghostlist[g].currentLocation.toString() == game.pacman.currentLocation.toString()&&game.mode=='escape') {
          Game.eatGhostSound.play();
          game.ghostlist[g].changeMode('eaten')
          game.ghostlist[g].updateGhost()
          game.addScores(200)
        }
  }}
}
//listner for keyboard input (the four arrows)
document.addEventListener('keydown', (e) => {
  if (game != null) {
    if (game.status == "stop") {
      restartGame(game);
    }
  }
  e = e || window.event;
  if (e.keyCode === 38) {
    inputDirection = "up";
  } else if (e.keyCode === 40) {
    inputDirection= "down";
  } else if (e.keyCode === 37) {
    inputDirection="left";
  } else if (e.keyCode === 39) {
    inputDirection = "right";
  }
})
//touch swipe listener
//start touch listener
let touchstartX = 0 ,touchstartY = 0, touchendX = 0,touchendY = 0;
gridElement.addEventListener('touchstart', function (event) {
  touchstartX = event.changedTouches[0].screenX;
  touchstartY = event.changedTouches[0].screenY;
}, false);


//end touch listener
gridElement.addEventListener('touchend', function (event) {
  touchendX = event.changedTouches[0].screenX;
  touchendY = event.changedTouches[0].screenY;
  handleGesture();
}, false);

//play button
mainMenu.children[0].addEventListener('click',(e)=>{
  fromMenuToGrid()
  game = initializeGame()
},false)

//about button 
mainMenu.children[1].addEventListener('click',(e)=>{
  location.href ='https://github.com/ALMESHARI'
},false)


//https://github.com/ALMESHARI


//determine which action do from touch gesture 
function handleGesture() {
  if (game != null) {
    if (game.status == "stop") {
      restartGame(game);
    }
  }
  let vertical = (touchstartX > touchendX) ? ["left",touchstartX-touchendX] : ["right",touchendX - touchstartX];
  let horizontal = (touchstartY > touchendY) ? ["up",touchstartY-touchendY] : ["down",touchendY - touchstartY];
  let action = (vertical[1] > horizontal[1]) ? inputDirection = vertical[0] : inputDirection = horizontal[0];
}

function restartGame(game) {
      messagePanel.style.display = 'none'
  game.startGame()
  game.status = "live"
  activities = activition(activities);
}

function endGame(game) {
  game.status = "end"
  clearInterval(activities);
  activities = null
  showMessage('end')
        game = null;

  setTimeout(() => {
    fromGridToMenu()

  }, 3000);
   

}
export function showMessage(m=''){
  if (m == 'end') {
    if (game.remainPoints > 0) {
      messagePanel.innerHTML = 'GAME OVER'
      messagePanel.style.color = 'red'

    } else {
      messagePanel.innerHTML = 'YOU WIN'
      messagePanel.style.color = 'white'
      Game.gameWin.play();
    }
       messagePanel.style.display = 'flex'
    messagePanel.classList.add('opacity-reverse')
  setTimeout(() => {
    messagePanel.style.display = 'none'
  },3000);
  } else {
      messagePanel.innerHTML = 'Press arrows or swipe to start'
     if (m == 2) {
      messagePanel.innerHTML = 'Try Again'
    }
      if (m== 1) {
      messagePanel.innerHTML = 'Last Chance!'
    }
      messagePanel.style.color = 'white'
       messagePanel.style.display = 'flex'
    messagePanel.classList.add('opacity-reverse')
  }

   
}


function stopGame(game){
    clearInterval(activities)
    game.status = "stop"
}

function createMainMenu(){
  // gridElement.style.display="none";
 let mainmenu = document.createElement("div")
 mainmenu.classList.add("main-menu")
 
 let playBtn = document.createElement("button")
 playBtn.classList.add("button","play-button")
 playBtn.innerHTML= "PLAY"

 let aboutBtn = document.createElement("button")
 aboutBtn.classList.add("button","about-button")
 aboutBtn.innerHTML= "ABOUT DEVELOPER"

 mainmenu.append(playBtn,aboutBtn)
 return mainmenu 
}
function deletePrevDirection() { inputDirection = null; }


function initializeGame(){
  // initlize game:
  const pacman = new Pacman();
  const redGhost = new Ghost("red");
  const blueGhost = new Ghost("blue",[15,14]);
  const orangeGhost = new Ghost("orange",[15,15]);
  const pinkGhost = new Ghost("pink",[14,15]);
  resetInfoPanel() 
  //edit this array to customize the game map
  let BoardList =
    [[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2],
      [2, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5, 2],
      [2, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 1, 1, 1, 5, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2],
      [0, 0, 0, 0, 0, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 1, 2, 2, 1, 2, 2, 2, 0, 0, 2, 2, 2, 1, 2, 2, 1, 2, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2],
      [0, 0, 0, 0, 0, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 2],
      [2, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2],
      [2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 2],
      [2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 2],
      [2, 1, 1, 5, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 5, 1, 1, 2],
      [2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2],
      [2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2],
      [2, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]];
  const gridboard = new GridBoard(BoardList);
  return new Game(gridboard, [redGhost,blueGhost,orangeGhost,pinkGhost], pacman, 0);
}
function resetInfoPanel() {
  for (const panel of informationEl.children) {
    panel.innerHTML = null
  }
}

function fromMenuToGrid(){
  mainMenu.classList.toggle("opacity")
  setTimeout(() => {
    gridElement.classList.toggle("opacity")
    informationEl.classList.toggle("opacity")
  }, 500);
  mainMenu.style.display="none"
  gridElement.style.display="grid"
  informationEl.style.display="flex"

}

function fromGridToMenu(){
  gridElement.classList.toggle("opacity")
  informationEl.classList.toggle("opacity")
  setTimeout(() => {
    mainMenu.classList.toggle("opacity")
  }, 800);
  gridElement.style.display="none"
  informationEl.style.display="none"
  mainMenu.style.display = "flex"
  gridElement.innerHTML = ""
  gridElement.append(messagePanel)
}