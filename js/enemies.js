class Enemy {
    constructor(type, health, speed, reward, color) {
        this.type = type;
        this.maxHealth = health;
        this.health = health;
        this.speed = speed;
        this.reward = reward;
        this.color = color;
        this.position = new Vector2(0, 0);
        this.pathIndex = 0;
        this.isDead = false;
        this.reachedEnd = false;
        this.size = 8;
    }

    update(path) {
        if (this.isDead || this.reachedEnd) return;

        if (this.pathIndex >= path.length - 1) {
            this.reachedEnd = true;
            return;
        }

        const target = path[this.pathIndex + 1];
        const direction = Vector2.normalize(Vector2.subtract(target, this.position));
        const movement = Vector2.multiply(direction, this.speed);
        
        this.position = Vector2.add(this.position, movement);

        const distanceToTarget = Vector2.distance(this.position, target);
        if (distanceToTarget < 5) {
            this.pathIndex++;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (this.isDead) return;

        drawCircle(ctx, this.position.x, this.position.y, this.size, this.color);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();

        this.drawHealthBar(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = 20;
        const barHeight = 4;
        const x = this.position.x - barWidth / 2;
        const y = this.position.y - this.size - 8;
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x, y, barWidth * healthPercentage, barHeight);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    getInfo() {
        return {
            type: this.type,
            health: this.health,
            maxHealth: this.maxHealth,
            speed: this.speed,
            reward: this.reward
        };
    }
}

class BasicEnemy extends Enemy {
    constructor() {
        super('basic', 50, 1, 10, COLORS.ENEMY_BASIC);
    }
}

class FastEnemy extends Enemy {
    constructor() {
        super('fast', 30, 2, 15, COLORS.ENEMY_FAST);
        this.size = 6;
    }
}

class HeavyEnemy extends Enemy {
    constructor() {
        super('heavy', 100, 0.5, 25, COLORS.ENEMY_HEAVY);
        this.size = 12;
    }
}

class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.enemies = [];
        this.enemiesSpawned = 0;
        this.enemiesInWave = 0;
        this.spawnInterval = 1000;
        this.lastSpawnTime = 0;
        this.waveInProgress = false;
        this.waveCompleted = false;
    }

    startWave() {
        if (this.waveInProgress) return false;

        this.currentWave++;
        this.enemiesSpawned = 0;
        this.enemiesInWave = this.calculateEnemiesInWave();
        this.waveInProgress = true;
        this.waveCompleted = false;
        this.lastSpawnTime = Date.now();
        
        return true;
    }

    calculateEnemiesInWave() {
        return Math.min(5 + this.currentWave * 2, 20);
    }

    update(path) {
        if (!this.waveInProgress) return;

        const currentTime = Date.now();
        
        if (this.enemiesSpawned < this.enemiesInWave && 
            currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnEnemy(path);
            this.lastSpawnTime = currentTime;
        }

        this.enemies.forEach(enemy => enemy.update(path));
        
        this.enemies = this.enemies.filter(enemy => !enemy.isDead && !enemy.reachedEnd);

        if (this.enemiesSpawned >= this.enemiesInWave && this.enemies.length === 0) {
            this.waveInProgress = false;
            this.waveCompleted = true;
        }
    }

    spawnEnemy(path) {
        let enemy;
        
        const rand = Math.random();
        if (this.currentWave >= 3 && rand < 0.3) {
            enemy = new HeavyEnemy();
        } else if (this.currentWave >= 2 && rand < 0.5) {
            enemy = new FastEnemy();
        } else {
            enemy = new BasicEnemy();
        }

        enemy.position = new Vector2(path[0].x, path[0].y);
        this.enemies.push(enemy);
        this.enemiesSpawned++;
    }

    getEnemiesReachedEnd() {
        return this.enemies.filter(enemy => enemy.reachedEnd);
    }

    removeDeadEnemies() {
        const deadEnemies = this.enemies.filter(enemy => enemy.isDead);
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
        return deadEnemies;
    }

    draw(ctx) {
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }

    isWaveComplete() {
        return this.waveCompleted;
    }

    canStartNextWave() {
        return !this.waveInProgress && this.waveCompleted;
    }
}