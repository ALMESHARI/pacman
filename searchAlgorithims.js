
class Cell{
    constructor(location=[0,0],cell_type=0,shortest_parent=null,level=0){
        this.location = location 
        this.cell_type = cell_type
        this.shortest_parent = shortest_parent
        this.level = level
    }
}

function isGoal(cell,goal){
    return cell['location'][0] == goal['location'][0] && cell['location'][1] == goal['location'][1]
}

function actions(cell,board,visited,travel = true){
    let cells = []
    let [row,col] = [cell['location'][0],cell['location'][1]]
    const possible_actions = [[0,1],[1,0],[-1,0],[0,-1]]//four directions each direction [change in row, change in column]
    let newCell
    //special case 
    if (row == 14 && col == 0) {
        newCell = new Cell([14, 27], board[14, 27], cell, cell['level'] + 1)
        if (newCell["cell_type"] != 2 &&isExist(visited, newCell)[0] == false) {
        cells.push(newCell);
    }
    }
     if (row == 14 && col == 27) {
         newCell = new Cell([14, 0], board[14, 0], cell, cell['level'] + 1)
         if (newCell["cell_type"] != 2 &&isExist(visited, newCell)[0] == false) {
        cells.push(newCell);
    }
    }
    for (let i = 0; i < 4;i++){//four directions
        let [y,x] = possible_actions[i]
        if (row+y>=0 && row+y<board.length && col+x>=0 && col+x<board[0].length){
            newCell = new Cell([row+y,col+x],board[row+y][col+x],cell,cell['level']+1)
            
            if (((newCell["location"][0] == 14 && newCell["location"][1] == 5) || (newCell["location"][0] == 14 && newCell["location"][1] == 22)) && !travel) { }
            else {
                if (
                    newCell["cell_type"] != 2 &&
                    isExist(visited, newCell)[0] == false
                ) {
                    cells.push(newCell);
                }
            }
        }
    }
    return cells
}

function isExist(visited,target){
    for (let i =0 ; i < visited.length; i++){
        if (visited[i]['location'][0] == target['location'][0] && visited[i]['location'][1] == target['location'][1]){
            return [true,i]
        }
    }
    return [false,-1]
}

export function heuristic(frontier,goal){
    let best= [0,manhatten_distance(frontier[0],goal)]//first elemnt is index, second is value
    for (let i =0 ; i < frontier.length; i++){
        let dis= manhatten_distance(frontier[i],goal)
        if (dis < best[1])best = [i,dis];
    }
    return best[0]
}

export function far_heuristic(frontier,goal){
    let best= [0,manhatten_distance(frontier[0],goal)]//first elemnt is index, second is value
    for (let i =0 ; i < frontier.length; i++){
        let dis= manhatten_distance(frontier[i],goal)
        if (dis > best[1])best = [i,dis];
    }
    return frontier[best[0]]
}


export function heuristic2(frontier,goal){
    let best= [0,manhatten_distance(frontier[0],goal)]//first elemnt is index, second is value
    for (let i =frontier.length-1 ; i >= 0; i--){
        let dis= manhatten_distance(frontier[i],goal)
        if (dis < best[1])best = [i,dis];
    }
    return best[0]
}

export function randomChoose(frontier,goal){
    return Math.floor(Math.random() * frontier.length);
}

function manhatten_distance(intial,destination){
    let loc1 = intial['location']
    let loc2 = destination['location']
    return Math.abs(loc1[0]-loc2[0])+Math.abs(loc1[1]-loc2[1])
}

function randomDistance(){
    return Math.floor(Math.random() * 50);
}

let count = 0 
function search(start_cell, goal_cell,board,heuristic){
    let frontier = [start_cell,]
    let visited = []//will contains cell locations only
    let path = []
    while (frontier.length != 0){
    for (let i = 0 ; i<3 ; i++){ 
        count+=1
        let current = frontier.splice(heuristic(frontier,goal_cell),1)[0]
        path.push(current['location'])
        if (isGoal(current,goal_cell)==true)return [current,path];
        visited.push(current)
        frontier.push(...actions(current,board,visited))
    }
    }
}


export function getPath(current, goal, boardList,heuristic){
    let goalCell = new Cell(goal)
    let startCell = new Cell(current)
    let g = search(goalCell,startCell,boardList,heuristic)[0]
    let path=[]
    let lvl = g['level']+1
    for (let i = 0 ; i<lvl;i++){
        path.push(g['location'])
        g = g['shortest_parent']
    }
    return path;
}

export function escape(current, goal, boardList,prevLocation){
  let goalCell = new Cell(goal)
    let startCell = new Cell(current)
    let prevCell = new Cell(prevLocation);
    let possible_actions = actions(startCell, boardList, [prevCell], true)
    let next = far_heuristic(possible_actions, goalCell)
    return [,next['location']]
}