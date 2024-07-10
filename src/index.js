const NO_SHIP_NO_SHOT = 0;
const SHIP_NO_SHOT = 1;
const NO_SHIP_SHOT = 2;
const SHIP_SHOT = 3;

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;
class Board {
    constructor(isPlayer) {
        this.name = isPlayer ? "player" : "oponent";
        this.grid = Array(BOARD_HEIGHT);
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            this.grid[i] = Array(BOARD_WIDTH).fill(NO_SHIP_NO_SHOT);
        }
        // console.log(this.grid)
        this.ships = [];
        this.requiredShipLengths = [2, 3, 3, 4, 5];
        this.initialise()
        this.ships.forEach((element) => console.log(element));
    }

    addShip(ship) {
        this.ships.push(ship);
        for (let [row, col] of ship.locations) {
            this.grid[row][col] = SHIP_NO_SHOT;
        }
    }
    
    canShoot(row, col) {
        return (
            row >= 0 &&
            row < BOARD_HEIGHT &&
            col >= 0 &&
            col < BOARD_WIDTH &&
            (this.grid[row][col] == SHIP_NO_SHOT ||
                this.grid[row][col] == NO_SHIP_NO_SHOT)
            );
        }
        
    shoot(row, col) {
        console.assert(this.canShoot(row, col));
        if (this.grid[row][col] == SHIP_NO_SHOT) {
            this.grid[row][col] = SHIP_SHOT;
        } else {
            this.grid[row][col] = NO_SHIP_SHOT;
        }
        if (this.allShipsSunk()) {
            let title = document.createElement('h1');
            title.textContent = '' + this.name + ' loses!'
            console.log(this.name + ' loses!');
            console.log(title);
            document.querySelector("body").appendChild(title);
        }
    }
    
    allShipsSunk() {
        for (let currentShip of this.ships) {
            for (let [row, col] of currentShip.locations) {
                if (this.grid[row][col] == SHIP_NO_SHOT) return false;
            }
        }
        return true;
    }
    
    isValidShipPosition(ship) {
        for (let [row, col] of ship.locations) {
            if (
                row < 0 ||
                row >= BOARD_HEIGHT ||
                col < 0 ||
                col >= BOARD_WIDTH ||
                this.grid[row][col] != NO_SHIP_NO_SHOT
            ) {
                return false;
            }
        }
        return true;
    }
    
    getRandomShipLocations() {
        for (let shipLength of this.requiredShipLengths) {
            let shipLocationFound = false;
            let attempts = 0;
            while (!shipLocationFound && attempts < 100) {
                let horisontal = Math.random() > 0.5;
                let row = 0;
                let col = 0;
                if (horisontal) {
                    row = Math.floor(
                        Math.random() * (BOARD_WIDTH - shipLength)
                    );
                    col = Math.floor(Math.random() * BOARD_WIDTH);
                } else {
                    row = Math.floor(Math.random() * BOARD_HEIGHT);
                    col = Math.floor(
                        Math.random() * (BOARD_WIDTH - shipLength)
                    );
                }
                let newShip = new Ship(row, col, shipLength, horisontal);
                if (this.isValidShipPosition(newShip)) {
                    this.addShip(newShip);
                    shipLocationFound = true;
                }
                attempts++;
            }
            if (attempts == 100) {
                console.error("unable to find possible board layout")
            }
        }
    }
    
    getShipLocations() {
        this.getRandomShipLocations();
    }
    
    displayBoard() {
        let boardDiv = document.createElement('div');
        console.log(boardDiv)
        boardDiv.class = 'board';
        boardDiv.id = this.name;
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            let row = document.createElement('div');
            row.classList.add('board-row');
            row.id = this.name + '-row-' + i;
            for (let j = 0; j < BOARD_WIDTH; j++) {
                let cell = document.createElement('div');
                cell.classList.add('board-cell');
                cell.id = this.name + '-cell-' + i + '-' + j;
                row.appendChild(cell);
            }
            boardDiv.appendChild(row);
        }
        console.log(boardDiv);
        let boardsDiv = document.querySelector('.boards')
        console.log(boardsDiv)
        boardsDiv.appendChild(boardDiv);
    }
    
    initialise() {
        this.displayBoard();
        this.getRandomShipLocations();
    }

    update(row, col) {
        let cell = document.querySelector('#' + this.name + '-cell-' + row + '-' + col)
        if (this.grid[row][col] == NO_SHIP_NO_SHOT) {
            cell.className = 'board-cell can-shoot';
        } else if (this.grid[row][col] == SHIP_NO_SHOT) {
            cell.className = 'board-cell';
        } else if (this.grid[row][col] == SHIP_SHOT) {
            cell.className = 'board-cell';
            cell.style.backgroundColor = 'rgb(197, 255, 214)'
        } else if (this.grid[row][col] == NO_SHIP_SHOT) {
            cell.className = 'board-cell';
            cell.style.backgroundColor = 'rgb(255, 193, 193)'
        }
        cell.removeEventListener('click', clickShootableCell);
    }
}
    
class Ship {
    constructor(row, col, length, horisontal) {
        this.locations = [[row, col]];
        if (horisontal) {
            for (let i = 1; i < length; i++) {
                this.locations.push([row, col + i]);
            }
        } else {
            for (let i = 1; i < length; i++) {
                this.locations.push([row + i, col]);
            }
        }
    }
}

class Oponent {
    constructor(board) {
        this.board = board
    }

    makeShot() {
        let row = Math.floor(Math.random() * BOARD_HEIGHT);
        let col = Math.floor(Math.random() * BOARD_WIDTH);
        while (!this.board.canShoot(row, col)) {
            row = Math.floor(Math.random() * BOARD_HEIGHT);
            col = Math.floor(Math.random() * BOARD_WIDTH);
        }
        this.board.shoot(row, col);
        this.board.update(row, col);
    }
}


let playersBoard = new Board(true);
let oponentsBoard = new Board(false);

let oponent = new Oponent(playersBoard);
function clickShootableCell() {
    let [, , row,col] = this.id.split('-').map((x) => Number(x));
    console.log('shooting:' + row + ', ' + col)
    oponentsBoard.shoot(row, col);
    oponentsBoard.update(row, col);
    oponent.makeShot();
}
document.querySelectorAll("#oponent .board-cell").forEach((element) => element.addEventListener('click', clickShootableCell));