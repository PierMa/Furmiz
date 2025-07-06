class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.grid = new Grid(this.width, this.height, 40);
        this.waveManager = new WaveManager();
        this.projectileManager = new ProjectileManager();
        this.towers = [];
        
        this.score = 0;
        this.lives = 20;
        this.gold = 100;
        this.gameOver = false;
        this.gameWon = false;
        
        this.selectedTowerType = null;
        this.placingTower = false;
        
        this.lastUpdateTime = 0;
        this.gameRunning = false;
        
        this.initializeEventListeners();
        this.updateUI();
    }

    initializeEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        
        document.getElementById('archer-tower-btn').addEventListener('click', () => {
            this.selectTowerType('archer');
        });
        
        document.getElementById('magic-tower-btn').addEventListener('click', () => {
            this.selectTowerType('magic');
        });
        
        document.getElementById('start-wave-btn').addEventListener('click', () => {
            this.startWave();
        });
    }

    selectTowerType(type) {
        const cost = TowerFactory.getTowerCost(type);
        
        if (this.gold < cost) {
            alert(`Pas assez d'or ! Coût: ${cost}, Or disponible: ${this.gold}`);
            return;
        }
        
        this.selectedTowerType = type;
        this.placingTower = true;
        this.canvas.classList.add('placing-tower');
        
        document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById(`${type}-tower-btn`).classList.add('selected');
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.placingTower && this.selectedTowerType) {
            this.placeTower(x, y);
        }
    }

    handleCanvasMouseMove(e) {
        if (!this.placingTower) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const cellInfo = this.grid.getCellFromPixel(x, y);
        
        if (cellInfo.cell && this.grid.canPlaceTower(cellInfo.row, cellInfo.col)) {
            this.grid.setSelectedCell(cellInfo.row, cellInfo.col);
        } else {
            this.grid.clearSelectedCell();
        }
    }

    placeTower(x, y) {
        const cellInfo = this.grid.getCellFromPixel(x, y);
        
        if (!cellInfo.cell || !this.grid.canPlaceTower(cellInfo.row, cellInfo.col)) {
            alert('Impossible de placer une tour ici !');
            return;
        }
        
        const tower = TowerFactory.createTower(this.selectedTowerType);
        
        if (this.gold < tower.cost) {
            alert(`Pas assez d'or ! Coût: ${tower.cost}`);
            return;
        }
        
        if (this.grid.placeTower(cellInfo.row, cellInfo.col, tower)) {
            this.towers.push(tower);
            this.gold -= tower.cost;
            this.updateUI();
            this.cancelTowerPlacement();
        }
    }

    cancelTowerPlacement() {
        this.selectedTowerType = null;
        this.placingTower = false;
        this.canvas.classList.remove('placing-tower');
        this.grid.clearSelectedCell();
        
        document.querySelectorAll('.tower-btn').forEach(btn => btn.classList.remove('selected'));
    }

    startWave() {
        if (this.waveManager.startWave()) {
            this.gameRunning = true;
            document.getElementById('start-wave-btn').disabled = true;
            this.updateUI();
        }
    }

    update() {
        if (!this.gameRunning || this.gameOver) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;
        
        this.waveManager.update(this.grid.path);
        
        this.towers.forEach(tower => {
            tower.findTarget(this.waveManager.enemies);
            if (tower.fire(this.projectileManager.projectiles)) {
                this.projectileManager.addProjectile(this.projectileManager.projectiles.pop());
            }
        });
        
        this.projectileManager.update();
        
        const enemiesReachedEnd = this.waveManager.getEnemiesReachedEnd();
        this.lives -= enemiesReachedEnd.length;
        
        const deadEnemies = this.waveManager.removeDeadEnemies();
        deadEnemies.forEach(enemy => {
            this.score += enemy.reward;
            this.gold += enemy.reward;
        });
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameRunning = false;
            alert('Game Over ! Vous avez perdu toutes vos vies.');
        }
        
        if (this.waveManager.isWaveComplete()) {
            this.gameRunning = false;
            document.getElementById('start-wave-btn').disabled = false;
            
            if (this.waveManager.currentWave >= 10) {
                this.gameWon = true;
                alert('Félicitations ! Vous avez survécu à 10 vagues !');
            }
        }
        
        this.updateUI();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.grid.draw(this.ctx);
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.waveManager.draw(this.ctx);
        this.projectileManager.draw(this.ctx);
        
        if (this.gameOver) {
            this.drawGameOver();
        } else if (this.gameWon) {
            this.drawGameWon();
        }
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score Final: ${this.score}`, this.width / 2, this.height / 2 + 50);
    }

    drawGameWon() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTOIRE !', this.width / 2, this.height / 2);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Score Final: ${this.score}`, this.width / 2, this.height / 2 + 50);
    }

    updateUI() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('lives-value').textContent = this.lives;
        document.getElementById('gold-value').textContent = this.gold;
        document.getElementById('wave-value').textContent = this.waveManager.currentWave;
        
        const startWaveBtn = document.getElementById('start-wave-btn');
        if (this.waveManager.waveInProgress) {
            startWaveBtn.textContent = 'Vague en cours...';
            startWaveBtn.disabled = true;
        } else if (this.waveManager.canStartNextWave() || this.waveManager.currentWave === 0) {
            startWaveBtn.textContent = 'Commencer la vague';
            startWaveBtn.disabled = false;
        }
        
        document.querySelectorAll('.tower-btn').forEach(btn => {
            const towerType = btn.dataset.tower;
            const cost = TowerFactory.getTowerCost(towerType);
            btn.disabled = this.gold < cost;
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.lastUpdateTime = Date.now();
        this.gameLoop();
    }
}