/**
 * Cozy Hearth - Main Entry Point
 *
 * This file serves as the entry point for the Cozy Hearth game.
 * It initializes the game and sets up the necessary event listeners.
 */

import { Game } from './game.js';

// Wait for the DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', () => {
    console.log('Cozy Hearth - Initializing game...');

    // Create and initialize the game instance
    const game = new Game();

    // Initialize the game
    game.init()
        .then(() => {
            console.log('Game initialized successfully!');

            // Start the game loop
            game.start();
        })
        .catch(error => {
            console.error('Failed to initialize game:', error);
        });

    // Handle window resize events
    window.addEventListener('resize', () => {
        game.handleResize();
    });

    // Handle visibility change (tab switching, etc.)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            game.pause();
        } else {
            game.resume();
        }
    });
});
