class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static subtract(a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    }

    static normalize(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (length === 0) return new Vector2(0, 0);
        return new Vector2(vector.x / length, vector.y / length);
    }

    static multiply(vector, scalar) {
        return new Vector2(vector.x * scalar, vector.y * scalar);
    }

    static add(a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }
}

const COLORS = {
    GRASS: '#2d5a2d',
    PATH: '#8b7355',
    GRID_LINE: '#1a4a1a',
    TOWER_ARCHER: '#8b4513',
    TOWER_MAGIC: '#4169e1',
    ENEMY_BASIC: '#dc143c',
    ENEMY_FAST: '#ff69b4',
    ENEMY_HEAVY: '#696969',
    PROJECTILE_ARROW: '#daa520',
    PROJECTILE_MAGIC: '#9370db',
    UI_TEXT: '#ffffff',
    SELECTED_CELL: '#ffd700'
};

function drawCircle(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawRect(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawText(ctx, text, x, y, color = COLORS.UI_TEXT, fontSize = 12) {
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(text, x, y);
}