class Projectile {
    constructor(position, target, damage, speed, color) {
        this.position = new Vector2(position.x, position.y);
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.hasHit = false;
        this.size = 3;
    }

    update() {
        if (this.hasHit || !this.target || this.target.isDead) {
            this.hasHit = true;
            return;
        }

        const direction = Vector2.normalize(Vector2.subtract(this.target.position, this.position));
        const movement = Vector2.multiply(direction, this.speed);
        this.position = Vector2.add(this.position, movement);

        const distanceToTarget = Vector2.distance(this.position, this.target.position);
        if (distanceToTarget < this.target.size + this.size) {
            this.hit();
        }
    }

    hit() {
        if (this.hasHit || !this.target || this.target.isDead) return false;

        this.hasHit = true;
        return this.target.takeDamage(this.damage);
    }

    draw(ctx) {
        if (this.hasHit) return;

        drawCircle(ctx, this.position.x, this.position.y, this.size, this.color);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
    }

    shouldRemove() {
        return this.hasHit || !this.target || this.target.isDead;
    }
}

class ArrowProjectile extends Projectile {
    constructor(position, target, damage) {
        super(position, target, damage, 5, COLORS.PROJECTILE_ARROW);
    }

    draw(ctx) {
        if (this.hasHit) return;

        const direction = Vector2.normalize(Vector2.subtract(this.target.position, this.position));
        const angle = Math.atan2(direction.y, direction.x);
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        
        ctx.fillStyle = this.color;
        ctx.fillRect(-8, -1, 16, 2);
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-10, -2, 4, 4);
        
        ctx.restore();
    }
}

class MagicProjectile extends Projectile {
    constructor(position, target, damage) {
        super(position, target, damage, 4, COLORS.PROJECTILE_MAGIC);
        this.size = 4;
        this.particles = [];
        this.createParticles();
    }

    createParticles() {
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                offset: new Vector2(
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8
                ),
                opacity: Math.random() * 0.5 + 0.5
            });
        }
    }

    draw(ctx) {
        if (this.hasHit) return;

        this.particles.forEach(particle => {
            const particlePos = Vector2.add(this.position, particle.offset);
            
            ctx.save();
            ctx.globalAlpha = particle.opacity;
            drawCircle(ctx, particlePos.x, particlePos.y, 2, this.color);
            ctx.restore();
        });

        drawCircle(ctx, this.position.x, this.position.y, this.size, this.color);
        
        ctx.save();
        ctx.globalAlpha = 0.3;
        drawCircle(ctx, this.position.x, this.position.y, this.size * 2, this.color);
        ctx.restore();
    }

    update() {
        super.update();
        
        this.particles.forEach(particle => {
            particle.offset.x += (Math.random() - 0.5) * 2;
            particle.offset.y += (Math.random() - 0.5) * 2;
            particle.opacity = Math.max(0, particle.opacity - 0.02);
        });
    }
}

class ProjectileManager {
    constructor() {
        this.projectiles = [];
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    update() {
        this.projectiles.forEach(projectile => projectile.update());
        this.projectiles = this.projectiles.filter(projectile => !projectile.shouldRemove());
    }

    draw(ctx) {
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    }

    clear() {
        this.projectiles = [];
    }
}