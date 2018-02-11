const rowCount = 20;
const columnCount = 20;
const tileSize = 20;
const tileSpacing = 2;
const mineCount = 40;

var tiles = [];
for (var i = 0; i < columnCount; i++) {
    tiles.push([]);
}

var markerCount = 0;

class Tile {
    constructor(x, y, hasMine) {
        this.hasMine = hasMine;
        this.x = x;
        this.y = y;
        this.exposed = false;
        this.marked = false;
        this.text = hasMine ? 'X' : ' ';

        tiles[x][y] = this;
        
        this.tileDiv = document.createElement("div");
        document.querySelector("#board").appendChild(this.tileDiv);

        this.tileDiv.setAttribute("class", "tile hidden-tile");
        this.tileDiv.setAttribute("data-x", this.x);
        this.tileDiv.setAttribute("data-y", this.y);

        this.tileDiv.style.lineHeight = tileSize+"px";
        this.tileDiv.style.width = tileSize+"px";
        this.tileDiv.style.height = tileSize+"px";
        this.tileDiv.style.left = ((tileSize + tileSpacing) * x)+"px";
        this.tileDiv.style.top = ((tileSize + tileSpacing) * y)+"px";
        this.tileDiv.style.border = tileSpacing+"px solid #fff";
        
        this.tileDiv.addEventListener("mousedown", tileClicked);
        this.tileDiv.oncontextmenu = () => { return false; }; // Prevent context menu from making an appearance
    }

    expose() {
        this.exposed = true;
        this.tileDiv.setAttribute("class", "tile exposed-tile");

        if (this.marked) {
            this.tileDiv.innerHTML = this.hasMine ? '@' : this.adjacentCount;
        }

        switch (this.tileDiv.innerHTML) {
            case '0': this.tileDiv.style.color = "transparent"; break;
            case '1': this.tileDiv.style.color = "blue"; break;
            case '2': this.tileDiv.style.color = "green"; break;
            case '3': this.tileDiv.style.color = "red"; break;
            case '4': this.tileDiv.style.color = "purple"; break;
            case '5': this.tileDiv.style.color = "firebrick"; break;
            case '6': this.tileDiv.style.color = "cyan"; break;
            case '7': this.tileDiv.style.color = "black"; break;
            case '8': this.tileDiv.style.color = "grey"; break;
            default: break;
        }
    }

    mark() {
        if (this.exposed) return;

        if (!this.marked) {
            this.marked = true;
            this.tileDiv.style.color = "red";
            this.tileDiv.innerHTML = '#';
            markerCount++;
        }
        else {
            this.marked = false;
            this.tileDiv.style.color = "transparent";
            this.tileDiv.innerHTML = this.hasMine ? '@' : this.adjacentCount;
            markerCount--;
        }
    }

    set divText(text) {
        this.tileDiv.innerHTML = text;
    }

    get adjacentCount() {
        let adjacentCount = 0;

        for (var i = -1; i <= 1; i++) {
            if ((this.y + i) < 0 || (this.y + i) >= rowCount) continue;

            for (var j = -1; j <= 1; j++) {
                if ((this.x + j) < 0 || (this.x + j) >= columnCount) continue;
                if (i == 0 && j == 0) continue;
                
                if (tiles[this.x + j][this.y + i].hasMine) adjacentCount++;
            }
        }

        return adjacentCount;
    }
}

function populateBoard() {
    for (var y = 0; y < rowCount; y++) {
        for (var x = 0; x < columnCount; x++) {
            new Tile(x, y, false);
        }
    }

    // Place random mines
    var minesPlaced = 0;
    
    while (minesPlaced < mineCount) {
        let tileX = Math.floor(Math.random() * columnCount);
        let tileY = Math.floor(Math.random() * rowCount);

        if (!tiles[tileX][tileY].hasMine) {
            tiles[tileX][tileY].hasMine = true;
            minesPlaced++;
        }
    }
    
    // Count mines
    for (var y = 0; y < rowCount; y++) {
        for (var x = 0; x < columnCount; x++) {
            let currentTile = tiles[x][y];

            if (!currentTile.hasMine) {
                currentTile.divText = currentTile.adjacentCount;
            }
            else {
                currentTile.divText = '@';
            }
        }
    }
    
}

function showGameOver() {
    disableBoard();

    for (var y = 0; y < rowCount; y++) {
        for (var x = 0; x < columnCount; x++) {
            let tile = tiles[x][y];

            if (tile.hasMine) {
                if (tile.marked) tile.divText = '@'; // Reset mark to mine

                tile.tileDiv.style.color = "black";
            }
        }
    }
}

function checkForWin() {
    let win = true;

    for (var y = 0; y < rowCount; y++) {
        for (var x = 0; x < columnCount; x++) {
            let tile = tiles[x][y];

            if (!tile.hasMine && tile.marked) win = false;
        }
    }

    if (win) {
        disableBoard();
        alert ("You Win!");
    }
}

function disableBoard() {
    for (var y = 0; y < rowCount; y++) {
        for (var x = 0; x < columnCount; x++) {
            let tile = tiles[x][y];
            tile.tileDiv.removeEventListener("mousedown", tileClicked);
        }
    }
}

function tileClicked(e) {
    e.preventDefault();
    
    let tile = tiles[e.target.getAttribute("data-x")][e.target.getAttribute("data-y")];

    if (e.button == 0) {
        exposeTile(tile);
    }
    else if (e.button == 2) {
        tile.mark();

        if (markerCount == mineCount) checkForWin();
    }
}

function exposeTile(tile) {
    tile.expose();

    if (tile.hasMine) showGameOver();
    
    if (tile.adjacentCount == 0) {
        for (var i = -1; i <= 1; i++) {
            if ((tile.y + i) < 0 || (tile.y + i) >= rowCount) continue;
    
            for (var j = -1; j <= 1; j++) {
                if ((tile.x + j) < 0 || (tile.x + j) >= columnCount) continue;
                if (i == 0 && j == 0) continue;
                
                checkTile = tiles[tile.x + j][tile.y + i];

                if (!checkTile.exposed) exposeTile(checkTile);
            }
        }
    }
}

populateBoard();