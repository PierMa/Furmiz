document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const game = new Game(canvas);
    
    game.start();
    
    console.log('Tower Defense Game initialisé !');
    console.log('Contrôles:');
    console.log('- Cliquez sur une tour dans le panneau de droite');
    console.log('- Cliquez sur une case verte pour placer la tour');
    console.log('- Cliquez sur "Commencer la vague" pour lancer les ennemis');
    console.log('- Défendez votre base et survivez à 10 vagues !');
});