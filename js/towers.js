class Tower {
    constructor(type, cost, damage, range, fireRate) {
        this.type = type;
        this.cost = cost;
        this.damage = damage;
        this.range = range;
        this.fireRate = fireRate;
        this.position = new Vector2(0, 0);
        this.target = null;
        this.lastFireTime = 0;
        this.level = 1;
    }

    canFire() {
        const currentTime = Date.now();
        return currentTime - this.lastFireTime >= this.fireRate;
    }

    findTarget(enemies) {
        let closestEnemy = null;
        let closestDistance = Infinity;

        for (const enemy of enemies) {
            const distance = Vector2.distance(this.position, enemy.position);
            if (distance <= this.range && distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }

        this.target = closestEnemy;
        return closestEnemy;
    }

    fire(projectiles) {
        if (!this.target || !this.canFire()) return false;

        const distance = Vector2.distance(this.position, this.target.position);
        if (distance > this.range) {
            this.target = null;
            return false;
        }

        const projectile = this.createProjectile();
        projectiles.push(projectile);
        this.lastFireTime = Date.now();
        return true;
    }

    createProjectile() {
        throw new Error('createProjectile must be implemented by subclass');
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = 15;

        drawRect(ctx, x - size/2, y - size/2, size, size, this.getColor());
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size/2, y - size/2, size, size);

        if (this.target) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(this.target.position.x, this.target.position.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        this.drawRange(ctx);
    }

    drawRange(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.range, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    getColor() {
        throw new Error('getColor must be implemented by subclass');
    }

    getInfo() {
        return {
            type: this.type,
            level: this.level,
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate
        };
    }
}

class ArcherTower extends Tower {
    constructor() {
        super('archer', 50, 15, 80, 800);
    }

    createProjectile() {
        return new ArrowProjectile(
            new Vector2(this.position.x, this.position.y),
            this.target,
            this.damage
        );
    }

    getColor() {
        return COLORS.TOWER_ARCHER;
    }
}

class MagicTower extends Tower {
    constructor() {
        super('magic', 80, 25, 100, 1200);
    }

    createProjectile() {
        return new MagicProjectile(
            new Vector2(this.position.x, this.position.y),
            this.target,
            this.damage
        );
    }

    getColor() {
        return COLORS.TOWER_MAGIC;
    }
}

class TowerFactory {
    static createTower(type) {
        switch (type) {
            case 'archer':
                return new ArcherTower();
            case 'magic':
                return new MagicTower();
            default:
                throw new Error(`Unknown tower type: ${type}`);
        }
    }

    static getTowerCost(type) {
        const tower = TowerFactory.createTower(type);
        return tower.cost;
    }
}