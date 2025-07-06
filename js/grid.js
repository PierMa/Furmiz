class Grid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.floor(width / cellSize);
        this.rows = Math.floor(height / cellSize);
        this.cells = [];
        this.path = [];
        this.selectedCell = null;
        
        this.initializeGrid();
        this.generatePath();
    }

    initializeGrid() {
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = {
                    type: 'grass',
                    hasTower: false,
                    tower: null
                };
            }
        }
    }

    generatePath() {
        const startRow = Math.floor(this.rows / 2);
        const endRow = startRow;
        
        for (let col = 0; col < this.cols; col++) {
            this.cells[startRow][col].type = 'path';
            this.path.push({
                x: col * this.cellSize + this.cellSize / 2,
                y: startRow * this.cellSize + this.cellSize / 2
            });
        }
    }

    getCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.cells[row][col];
    }

    getCellFromPixel(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        return { row, col, cell: this.getCell(row, col) };
    }

    canPlaceTower(row, col) {
        const cell = this.getCell(row, col);
        return cell && cell.type === 'grass' && !cell.hasTower;
    }

    placeTower(row, col, tower) {
        const cell = this.getCell(row, col);
        if (cell && this.canPlaceTower(row, col)) {
            cell.hasTower = true;
            cell.tower = tower;
            tower.position = new Vector2(
                col * this.cellSize + this.cellSize / 2,
                row * this.cellSize + this.cellSize / 2
            );
            return true;
        }
        return false;
    }

    setSelectedCell(row, col) {
        this.selectedCell = { row, col };
    }

    clearSelectedCell() {
        this.selectedCell = null;
    }

    draw(ctx) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                let color = cell.type === 'path' ? COLORS.PATH : COLORS.GRASS;
                
                if (this.selectedCell && 
                    this.selectedCell.row === row && 
                    this.selectedCell.col === col) {
                    color = COLORS.SELECTED_CELL;
                }
                
                drawRect(ctx, x, y, this.cellSize, this.cellSize, color);
                
                ctx.strokeStyle = COLORS.GRID_LINE;
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }
}