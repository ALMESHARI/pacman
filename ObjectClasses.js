import {showMessage} from './runner.js';
export class Ghost {
    constructor(color,currentLocation = [15, 12], rotation = "0deg", fear = false) {
      this.currentLocation = currentLocation;
      this.rotation = rotation;
      this.mode = 'normal';
      this.color = color
      this.initialLocation = currentLocation
      this.ghostElement = this.createGhostElement(color);
      this.updateGhost();
    }
  
    updateGhost(){
      this.ghostElement.children[0].style.transform=`rotate(${this.rotation})`;
      this.ghostElement.children[1].style.transform=`rotate(${this.rotation})`;
      var rect = document.getElementsByClassName("grid")[0].getBoundingClientRect();
      this.ghostElement.parentElement.style.transform = `translate(${(this.currentLocation[1]) * (rect.width / 28)}px,${(this.currentLocation[0]) * (rect.height / 31)}px)`
      setTimeout(() => { this.ghostElement.parentElement.classList.remove('notransition') },200);
    }
  
    // this method does not check if the new location is legal(not a wall). user should check this before call
    rotateElement(location) {

          if (location[0] == this.currentLocation[0] - 1 && location[1] ==this.currentLocation[1])this.rotation = "-90deg";
          if (location[0] == this.currentLocation[0] + 1 && location[1] ==this.currentLocation[1])this.rotation = "90deg";
          if (location[0] == this.currentLocation[0] && location[1] ==this.currentLocation[1]+1)this.rotation = "0deg";
          if (location[0] == this.currentLocation[0] && location[1] ==this.currentLocation[1]-1)this.rotation = "180deg";

      //edit the GUI element
      this.updateGhost();
    }
    changeLocation(row,col){
      this.rotateElement([row, col])
      
      if (this.currentLocation[0] == 14 && this.currentLocation[1] == 0 && row == 14 && col == 27) {
        this.ghostElement.parentElement.classList.add('notransition');
        this.currentLocation = [row, col];
        this.updateGhost();
      } else {
        if (this.currentLocation[0] == 14 && this.currentLocation[1] == 27 && row == 14 && col == 0) {
          console.log('its work', this.currentLocation, row, col)
          this.ghostElement.parentElement.classList.add('notransition');
          this.currentLocation = [row, col];
          this.updateGhost();
        } else {
          this.currentLocation = [row, col];
          this.updateGhost()
        }
      }
    }
    createGhostElement(color){
        let parent = document.createElement("div");
        let ghost = document.createElement("div");
        parent.classList.add("ghost-parent");
        ghost.classList.add("ghost");

        let ghostEyeCircleLeft = document.createElement("div")
        let ghostEyeLeft = document.createElement("div");
        ghostEyeCircleLeft.classList.add("ghost-eyes-circle")
        ghostEyeLeft.classList.add("ghost-eyes")
        ghostEyeCircleLeft.appendChild(ghostEyeLeft)

        let ghostEyeCircleRight = document.createElement("div")
        let ghostEyeRight = document.createElement("div");
        ghostEyeCircleRight.classList.add("ghost-eyes-circle")
        ghostEyeRight.classList.add("ghost-eyes")
        ghostEyeCircleRight.appendChild(ghostEyeRight)

        ghost.append(ghostEyeCircleLeft,ghostEyeCircleRight)
        ghost.style.backgroundColor=color;
        parent.appendChild(ghost);
        document.getElementsByClassName("grid")[0].appendChild(parent);
  
        return ghost;
  }
    changeMode(mode) {
      this.mode = mode
      this.ghostElement.classList = mode;
      this.ghostElement.classList.add('ghost');
      this.updateGhost();
  }
  }

export class Pacman {
    constructor(currentLocation = [17, 14], rotation = "0deg", angry = false,direction = "right") {
      this.currentLocation = currentLocation;
      this.rotation = rotation;
      this.angry = angry;
      this.pacmanElement = this.createPacmanElement();
      this.updatePacman();
    }
  
  updatePacman() {
      console.log("yes uts ")
      this.pacmanElement.style.transform=`rotate(${this.rotation})`;
      let rect = document.getElementsByClassName("grid")[0].getBoundingClientRect();
      this.pacmanElement.parentElement.style.transform=`translate(${(this.currentLocation[1]) * (rect.width/28)}px,${(this.currentLocation[0]) * (rect.height/31)}px)`
    }
  
    // this method does not check if the new location is legal(not a wall). user should check this before call
    changeLocation(direction) {
      switch (direction) {
        case "up":
          this.currentLocation = [this.currentLocation[0] - 1, this.currentLocation[1]];//rows start from top in grid 
          this.rotation = "-90deg";
          break
        case "down":
          this.currentLocation = [this.currentLocation[0] + 1, this.currentLocation[1]];
          this.rotation = "90deg";
          break
  
        case 'right':
          if (this.currentLocation[0] == 14 && this.currentLocation[1] == 27) {
            this.pacmanElement.parentElement.classList.add('notransition');
            this.currentLocation = [14, 0];
            this.updatePacman();
            } else {
            this.currentLocation = [this.currentLocation[0], this.currentLocation[1] + 1];
          }
          this.rotation = "0deg";
          break;
  
        case "left":
          if (this.currentLocation[0] == 14 && this.currentLocation[1] == 0) {
            this.pacmanElement.parentElement.classList.add('notransition');
            this.currentLocation = [14, 27];
            this.updatePacman();
          } else {
            this.currentLocation = [this.currentLocation[0], this.currentLocation[1] - 1];
          }
          this.rotation = "180deg";
          break
      }
      //edit the GUI element
      this.updatePacman();
      this.pacmanElement.parentElement.classList.remove('notransition');
      return this.currentLocation;
    }

    createPacmanElement(){
        let parent = document.createElement("div");
        let pacman = document.createElement("div");
        parent.classList.add("pacman-parent");
        pacman.classList.add("pacman");
        parent.appendChild(pacman);
        document.getElementsByClassName("grid")[0].appendChild(parent);
        return pacman;
    }
  }
  
  // _________________________________________________________________________________________________________________________
export class GridBoard {
    static cellsKey = {
      0: "empty",
      1: "points",
      2: "wall",
      // 3:"pacman",
      // 4:"ghost",
      5: "angryPoint"
    }
  
    constructor(boardArray) {
      this.boardArray = boardArray;
    }
    // this method recieve location (array of two integers) and return what is in this location (String)
    getCellType(cellCoordinate) {
      return GridBoard.cellsKey[this.boardArray[cellCoordinate[0]][cellCoordinate[1]]];
    }
    // chnage given cell from point (key = 1) to empty (key = 0). caller should check before if the cell is point or angrypoint or empty
    removePoint(cellCoordinate) {
      this.boardArray[cellCoordinate[0]][cellCoordinate[1]] = 0;
    }
    // method return the possible directions (array of string) to take(no wall conflict) from current location (array of two integers)  
    checkForPath(currentLocation) {
      let actions = [];
      if (this.boardArray[currentLocation[0] - 1][currentLocation[1]] != 2) {
        actions.push("up");
      }
  
      if (this.boardArray[currentLocation[0] + 1][currentLocation[1]] != 2) {
        actions.push("down");
      }
  
      if (this.boardArray[currentLocation[0]][currentLocation[1] + 1] != 2) {
        actions.push("right");
      }
  
      if (this.boardArray[currentLocation[0]][currentLocation[1] - 1] != 2) {
        actions.push("left");
      }
  
      return actions;
    }

    getPossibleCells(currentLocation){
        let cells = [];

        let up = [currentLocation[0] - 1,currentLocation[1]]
        if (this.boardArray[currentLocation[0] - 1][currentLocation[1]] != 2) {
          cells.push(up);
        }
    
        let down = [currentLocation[0] - 1,currentLocation[1]]
        if (this.boardArray[currentLocation[0] + 1][currentLocation[1]] != 2) {
          cells.push(down);
        }

        let right = [currentLocation[0] - 1,currentLocation[1]]
        if (this.boardArray[currentLocation[0]][currentLocation[1] + 1] != 2) {
          cells.push(right);
        }

        let left = [currentLocation[0] - 1,currentLocation[1]]
        if (this.boardArray[currentLocation[0]][currentLocation[1] - 1] != 2) {
          cells.push(left);
        }
    
        return cells; 
    }
  }
  
  //___________________________________________________________________________________________________________________________________
export class Game {
    constructor(gridBoard, ghostlist, pacman, score = 0,health=3,status= "stop") {
      this.gridBoard = gridBoard;
      this.ghostlist = ghostlist;
      this.pacman = pacman;
      this.score = score;
      this.remainPoints = 0
      this.squares = this.creatingBoardinHTML()
      this.health = health
      this.status = status
      this.mode = 'normal'
      this.escapeSeconds = 0
         showMessage()
this.updateTrials() 
    }

  
  checkConflict() {
    if (this.remainPoints == 0) {
      console.log('yoooooou win')
      // this.squares.classList.add('win-grid')
       for (const ghost of this.ghostlist) {
         ghost.ghostElement.style.display = 'none'
         this.pacman.pacmanElement.classList.add('dance')
       }
    }
    for (let index = 0; index < this.ghostlist.length; index++) {
      //check for catching pacman by ghosts
      if (this.pacman.currentLocation.toString() == this.ghostlist[index].currentLocation.toString() && this.mode == "normal") {
        this.health -= 1;
        this.updateTrials() 
        this.restartGame();
        return true;
      }
      //check for catching ghost by pacman in escape mode
      if (this.pacman.currentLocation.toString() == this.ghostlist[index].currentLocation.toString() && this.mode == "escape" && !(this.ghostlist[index].mode == 'eaten')) {
        this.ghostlist[index].changeMode("eaten");
        this.addScores(200);
      }
      //return the ghost to his state if it reach its initial location
      if (this.ghostlist[index].mode == "eaten" && this.ghostlist[index].currentLocation.toString() == this.ghostlist[index].initialLocation.toString()) {
        this.ghostlist[index].changeMode(this.mode);
      }
    }
    return false;
    }
    
  addScores(points) {
    this.score+=points;
    document.getElementsByClassName("score")[0].innerHTML = `SCORE: ${this.score}`;
  }
  updateTrials() {
        document.getElementsByClassName("health")[0].innerHTML = `TRIALS: ${this.health}`;

  }
  
  changePacmanLocation(direction) {
   
    if (this.gridBoard.checkForPath(this.pacman.currentLocation).indexOf(direction) != -1) {

       this.pacman.changeLocation(direction);
      let updatedCell = this.squares[this.pacman.currentLocation[0]][this.pacman.currentLocation[1]]
      //check for points
      if (updatedCell.classList.contains("point")) {
        this.addScores(1);
        this.remainPoints -=1

      }
      //check for the angry points 
      if (updatedCell.classList.contains("angry-point")) {
        this.mode = 'escape'
        this.escapeSeconds = 10;
        this.ghostsChangeMode();
        // setTimeout((_this) => { _this.mode = 'normal';_this.ghostsChangeMode();},10000,this)//this how much time will the escape mode be
      }
      updatedCell.classList = "empty";
      return true;
    }
    return false;
  }
  
  ghostsChangeMode() {
    for (const ghost of this.ghostlist) {
      if (ghost.mode != 'eaten')ghost.changeMode(this.mode);
    }
  }
  
  updateGhosts() {
    for (const ghost of this.ghostlist) {
      ghost.updateGhost;
    }
  }

    // caller have to check if the direction is legal
    changeGhostLocation(ghost, direction) {
       ghost.changeLocation(direction);
    }
    startGame() {
      this.startTime = new Date();
    }
    returnTime() {
      return new Date()- this.startTime;
    }

    restartGame(){
      this.status = "stop"
      this.pacman.currentLocation = [17,14]
      this.pacman.rotation= '0deg'
      this.pacman.updatePacman()
      this.ghostlist.forEach(element => {
        element.currentLocation = element.initialLocation;
        element.updateGhost()
      });
    showMessage()
    }
  
    creatingBoardinHTML() {
      let squares = [];
      let arrayList = this.gridBoard.boardArray;
      for (let i = 0; i < arrayList.length; i++) {
        let row = [];//this will conatain all elements in the row
        for (let j = 0; j < arrayList[1].length; j++) {
          if (arrayList[i][j]==1) this.remainPoints+=1
          let el = document.createElement("div")
          el.style.gridArea = `${i + 1}/${j + 1}`;
          el.classList.add(...this.findClassList(i,j));
          document.getElementsByClassName("grid")[0].appendChild(el);
          row.push(el);
        } squares.push(row);
      } return squares;
    }
    //this will return the fit class list for the cell
    findClassList(row,column){
      let arrayList = this.gridBoard.boardArray;
      let classList = [];
      let element = arrayList[row][column];
      if (element == 2)classList.push("wall");
      if (element == 5)classList.push("angry-point");
      if (element == 1)classList.push("point");
      
      if(row+1 < arrayList.length) if (arrayList[row+1][column] != 2) classList.push("bottom");
  
      if(row-1 >=0) if (arrayList[row-1][column] != 2) classList.push("top");
      
      if(column +1 < arrayList[0].length) if (arrayList[row][column+1]!= 2) classList.push("right");//there is no wall in right of this wall element
      
      if(column-1 >=0) if (arrayList[row][column-1]!= 2) classList.push("left");//there is no wall in left of this wall element
      return classList
    }
  }