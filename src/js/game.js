/**
 * Cozy Hearth - Game Class
 *
 * This class represents the main game instance and manages all game systems.
 */

import { SaveSystem } from './systems/saveSystem.js';
import { TimeSystem } from './systems/timeSystem.js';
import { ResourceSystem } from './systems/resourceSystem.js';
import { InteractionSystem } from './systems/interactionSystem.js';
import {
    initialPlayerData,
    initialInnData,
    gameConfig
} from './data/gameData.js';

export class Game {
    constructor() {
        // Game state
        this.isRunning = false;
        this.lastTimestamp = 0;

        // Game systems
        this.saveSystem = null;
        this.timeSystem = null;
        this.resourceSystem = null;
        this.interactionSystem = null;

        // Game data
        this.player = null;
        this.inn = null;
        this.guests = [];

        // UI elements
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Initialize the game and all its systems
     * @returns {Promise} A promise that resolves when initialization is complete
     */
    async init() {
        console.log('Initializing game systems...');

        // Set up canvas
        this.canvas = document.getElementById('game-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
        } else {
            console.warn('Canvas element not found, rendering disabled');
        }

        // Initialize game systems
        this.saveSystem = new SaveSystem();
        this.timeSystem = new TimeSystem();
        this.resourceSystem = new ResourceSystem();
        this.interactionSystem = new InteractionSystem();

        // Initialize each system
        await this.saveSystem.init();
        await this.timeSystem.init();
        await this.resourceSystem.init();
        await this.interactionSystem.init();

        // Try to load saved game data
        const savedData = this.saveSystem.loadGame();
        if (savedData) {
            this.loadGameState(savedData);
            console.log('Loaded saved game data');
        } else {
            this.createNewGame();
            console.log('Created new game');
        }

        // Set up UI event listeners
        this.setupEventListeners();

        return Promise.resolve();
    }

    /**
     * Create a new game with default values
     */
    createNewGame() {
        // Set up player data from initial data
        this.player = JSON.parse(JSON.stringify(initialPlayerData));

        // Set up inn data from initial data
        this.inn = JSON.parse(JSON.stringify(initialInnData));

        // Initialize time to game start based on config
        this.timeSystem.setInitialTime(
            gameConfig.startingTime,
            gameConfig.startingDay,
            gameConfig.startingSeason === 'spring' ? 0 :
            gameConfig.startingSeason === 'summer' ? 1 :
            gameConfig.startingSeason === 'autumn' ? 2 : 3,
            gameConfig.startingYear
        );

        // Set time scale from config
        this.timeSystem.setTimeScale(gameConfig.timeScale);

        // Set up initial resources
        this.resourceSystem.initializeResources();

        // Update UI with initial values
        this.updateUI();

        console.log('New game created with initial data');
    }

    /**
     * Load a saved game state
     * @param {Object} savedData - The saved game data to load
     */
    loadGameState(savedData) {
        this.player = savedData.player;
        this.inn = savedData.inn;
        this.guests = savedData.guests || [];

        // Restore system states
        this.timeSystem.loadState(savedData.time);
        this.resourceSystem.loadState(savedData.resources);
    }

    /**
     * Set up event listeners for UI elements
     */
    setupEventListeners() {
        // Save button
        const saveButton = document.getElementById('save-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveGame();
                this.showNotification('Game saved successfully!');
            });
        }

        // Load button
        const loadButton = document.getElementById('load-button');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                if (this.saveSystem.hasSave()) {
                    const savedData = this.saveSystem.loadGame();
                    if (savedData) {
                        this.loadGameState(savedData);
                        this.updateUI();
                        this.showNotification('Game loaded successfully!');
                    }
                } else {
                    this.showNotification('No saved game found!', 'error');
                }
            });
        }

        // Settings button
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.showDialog('Settings', this.createSettingsContent());
            });
        }

        // Dialog close button
        const dialogCloseButton = document.getElementById('dialog-close');
        if (dialogCloseButton) {
            dialogCloseButton.addEventListener('click', () => {
                this.hideDialog();
            });
        }
    }

    /**
     * Start the game loop
     */
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTimestamp = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
            console.log('Game loop started');
        }
    }

    /**
     * Pause the game
     */
    pause() {
        this.isRunning = false;
        console.log('Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTimestamp = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
            console.log('Game resumed');
        }
    }

    /**
     * Save the current game state
     */
    saveGame() {
        const gameData = {
            player: this.player,
            inn: this.inn,
            guests: this.guests,
            time: this.timeSystem.getState(),
            resources: this.resourceSystem.getState()
        };

        this.saveSystem.saveGame(gameData);
        console.log('Game saved');
    }

    /**
     * Main game loop
     * @param {number} timestamp - The current timestamp from requestAnimationFrame
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;

        // Calculate delta time in seconds
        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Update game systems
        this.update(deltaTime);

        // Render the game
        this.render();

        // Continue the game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    /**
     * Update game state and systems
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update time system (day/night cycle, seasons)
        this.timeSystem.update(deltaTime);

        // Update resources
        this.resourceSystem.update(deltaTime);

        // Update interactions
        this.interactionSystem.update(deltaTime);

        // Update other game elements
        this.updateGuests(deltaTime);

        // Check for events or triggers based on time
        this.checkTimeEvents();

        // Update UI elements with current values
        this.updateTimeDisplay();
        this.updateResourceDisplay();
    }

    /**
     * Update guest behaviors and states
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    updateGuests(deltaTime) {
        // Update each guest
        for (const guest of this.guests) {
            // Guest behavior logic will go here
        }
    }

    /**
     * Check for time-based events (morning, evening, season changes, etc.)
     */
    checkTimeEvents() {
        const timeInfo = this.timeSystem.getCurrentTimeInfo();

        // Check for day change
        if (timeInfo.isDayStart) {
            this.onDayStart();
        }

        // Check for night
        if (timeInfo.isNightStart) {
            this.onNightStart();
        }

        // Check for season change
        if (timeInfo.isSeasonStart) {
            this.onSeasonChange(timeInfo.season);
        }

        // Check for hour change to update visual appearance
        if (this.timeSystem.hour !== this.timeSystem.lastHour) {
            this.updateVisualAppearance();
        }
    }

    /**
     * Handle start of day events
     */
    onDayStart() {
        console.log('Day started');
        // Morning routines, guest check-ins, etc.
    }

    /**
     * Handle start of night events
     */
    onNightStart() {
        console.log('Night started');
        // Evening routines, guest activities, etc.
    }

    /**
     * Handle season change events
     * @param {string} newSeason - The new season
     */
    onSeasonChange(newSeason) {
        console.log(`Season changed to ${newSeason}`);
        // Update available resources, guest types, events, etc.
    }

    /**
     * Render the game
     */
    render() {
        if (!this.ctx) return;

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render game elements
        this.renderInn();
        this.renderCharacters();
        this.renderUI();

        // Draw a simple placeholder if we're just starting out
        if (this.player && !this.player.customized) {
            this.drawPlaceholder();
        }
    }

    /**
     * Draw a placeholder on the canvas
     */
    drawPlaceholder() {
        if (!this.ctx) return;

        // Set up text style
        this.ctx.fillStyle = '#6b4226';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';

        // Draw text in the center of the canvas
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.ctx.fillText('Welcome to Cozy Hearth!', centerX, centerY - 50);
        this.ctx.fillText('Your magical inn awaits...', centerX, centerY);

        // Draw a simple inn outline
        this.ctx.strokeStyle = '#6b4226';
        this.ctx.lineWidth = 2;

        // Roof
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 100, centerY + 30);
        this.ctx.lineTo(centerX, centerY - 20);
        this.ctx.lineTo(centerX + 100, centerY + 30);
        this.ctx.stroke();

        // Walls
        this.ctx.beginPath();
        this.ctx.rect(centerX - 80, centerY + 30, 160, 80);
        this.ctx.stroke();

        // Door
        this.ctx.beginPath();
        this.ctx.rect(centerX - 20, centerY + 70, 40, 40);
        this.ctx.stroke();

        // Windows
        this.ctx.beginPath();
        this.ctx.rect(centerX - 60, centerY + 50, 30, 30);
        this.ctx.rect(centerX + 30, centerY + 50, 30, 30);
        this.ctx.stroke();
    }

    /**
     * Update UI elements with current game state
     */
    updateUI() {
        this.updateTimeDisplay();
        this.updateResourceDisplay();
        this.updateTaskList();
        this.updateVisualAppearance();
    }

    /**
     * Update the time display in the UI
     */
    updateTimeDisplay() {
        const timeInfo = this.timeSystem.getCurrentTimeInfo();

        const timeElement = document.getElementById('game-time');
        if (timeElement) {
            timeElement.textContent = timeInfo.timeString;
        }

        const dateElement = document.getElementById('game-date');
        if (dateElement) {
            dateElement.textContent = timeInfo.dateString;
        }
    }

    /**
     * Update the visual appearance based on time of day and season
     */
    updateVisualAppearance() {
        const timeInfo = this.timeSystem.getCurrentTimeInfo();
        const hour = timeInfo.hour;
        const season = timeInfo.season.toLowerCase();

        // Remove all time and season classes
        document.body.classList.remove(
            'time-morning', 'time-afternoon', 'time-evening', 'time-night',
            'season-spring', 'season-summer', 'season-autumn', 'season-winter'
        );

        // Add appropriate time of day class
        if (hour >= 6 && hour < 12) {
            document.body.classList.add('time-morning');
        } else if (hour >= 12 && hour < 18) {
            document.body.classList.add('time-afternoon');
        } else if (hour >= 18 && hour < 22) {
            document.body.classList.add('time-evening');
        } else {
            document.body.classList.add('time-night');
        }

        // Add appropriate season class
        document.body.classList.add(`season-${season}`);

        console.log(`Visual appearance updated for ${timeInfo.timeString} in ${season}`);
    }

    /**
     * Update the resource display in the UI
     */
    updateResourceDisplay() {
        // Update gold amount
        const goldElement = document.getElementById('gold-amount');
        if (goldElement) {
            const goldAmount = this.resourceSystem.getResourceAmount('currency', 'gold');
            goldElement.textContent = goldAmount;
        }

        // Update wood amount
        const woodElement = document.getElementById('wood-amount');
        if (woodElement) {
            const woodAmount = this.resourceSystem.getResourceAmount('materials', 'wood');
            woodElement.textContent = woodAmount;
        }

        // For food, we'll sum up some basic food ingredients
        const foodElement = document.getElementById('food-amount');
        if (foodElement) {
            const flour = this.resourceSystem.getResourceAmount('ingredients', 'flour');
            const eggs = this.resourceSystem.getResourceAmount('ingredients', 'eggs');
            const vegetables = this.resourceSystem.getResourceAmount('ingredients', 'potatoes') +
                              this.resourceSystem.getResourceAmount('ingredients', 'carrots');

            const totalFood = flour + eggs + vegetables;
            foodElement.textContent = totalFood;
        }
    }

    /**
     * Update the task list in the UI
     */
    updateTaskList() {
        // This would be more dynamic in a full implementation
        // For now, we'll just show some basic tasks based on the time of day
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        // Clear existing tasks
        taskList.innerHTML = '';

        const timeInfo = this.timeSystem.getCurrentTimeInfo();
        const hour = timeInfo.hour;

        // Morning tasks (6 AM - 12 PM)
        if (hour >= 6 && hour < 12) {
            this.addTask(taskList, 'Prepare breakfast');
            this.addTask(taskList, 'Clean rooms');
            this.addTask(taskList, 'Welcome new guests');
        }
        // Afternoon tasks (12 PM - 6 PM)
        else if (hour >= 12 && hour < 18) {
            this.addTask(taskList, 'Prepare lunch');
            this.addTask(taskList, 'Tend to the garden');
            this.addTask(taskList, 'Chat with guests');
        }
        // Evening tasks (6 PM - 10 PM)
        else if (hour >= 18 && hour < 22) {
            this.addTask(taskList, 'Prepare dinner');
            this.addTask(taskList, 'Organize evening entertainment');
            this.addTask(taskList, 'Check inventory');
        }
        // Night tasks (10 PM - 6 AM)
        else {
            this.addTask(taskList, 'Ensure guests are comfortable');
            this.addTask(taskList, 'Prepare for tomorrow');
            this.addTask(taskList, 'Get some rest');
        }
    }

    /**
     * Add a task to the task list
     * @param {HTMLElement} taskList - The task list element
     * @param {string} taskText - The task text
     */
    addTask(taskList, taskText) {
        const li = document.createElement('li');
        li.textContent = taskText;
        taskList.appendChild(li);
    }

    /**
     * Show a dialog with the given title and content
     * @param {string} title - The dialog title
     * @param {HTMLElement|string} content - The dialog content
     */
    showDialog(title, content) {
        const dialogContainer = document.getElementById('dialog-container');
        const dialogTitle = document.getElementById('dialog-title');
        const dialogContent = document.getElementById('dialog-content');

        if (dialogContainer && dialogTitle && dialogContent) {
            dialogTitle.textContent = title;

            // Clear existing content
            dialogContent.innerHTML = '';

            // Add new content
            if (typeof content === 'string') {
                dialogContent.textContent = content;
            } else {
                dialogContent.appendChild(content);
            }

            // Show the dialog
            dialogContainer.classList.remove('hidden');
        }
    }

    /**
     * Hide the dialog
     */
    hideDialog() {
        const dialogContainer = document.getElementById('dialog-container');
        if (dialogContainer) {
            dialogContainer.classList.add('hidden');
        }
    }

    /**
     * Create settings content for the settings dialog
     * @returns {HTMLElement} The settings content element
     */
    createSettingsContent() {
        const container = document.createElement('div');

        // Time scale setting
        const timeScaleDiv = document.createElement('div');
        timeScaleDiv.className = 'setting-item';

        const timeScaleLabel = document.createElement('label');
        timeScaleLabel.textContent = 'Game Speed: ';
        timeScaleLabel.htmlFor = 'time-scale';

        const timeScaleSelect = document.createElement('select');
        timeScaleSelect.id = 'time-scale';

        const options = [
            { value: 30, text: 'Slow' },
            { value: 60, text: 'Normal' },
            { value: 120, text: 'Fast' }
        ];

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            if (this.timeSystem.timeScale === option.value) {
                optionElement.selected = true;
            }
            timeScaleSelect.appendChild(optionElement);
        });

        timeScaleSelect.addEventListener('change', () => {
            const newScale = parseInt(timeScaleSelect.value);
            this.timeSystem.setTimeScale(newScale);
        });

        timeScaleDiv.appendChild(timeScaleLabel);
        timeScaleDiv.appendChild(timeScaleSelect);
        container.appendChild(timeScaleDiv);

        // Add a save button
        const saveSettingsButton = document.createElement('button');
        saveSettingsButton.className = 'btn btn-primary mt-3';
        saveSettingsButton.textContent = 'Save Settings';
        saveSettingsButton.addEventListener('click', () => {
            this.hideDialog();
            this.showNotification('Settings saved!');
        });

        container.appendChild(saveSettingsButton);

        return container;
    }

    /**
     * Show a notification message
     * @param {string} message - The notification message
     * @param {string} type - The notification type (info, success, error)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to the document
        document.body.appendChild(notification);

        // Fade in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove after a delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Render the inn and its rooms
     */
    renderInn() {
        // Inn rendering logic will go here
    }

    /**
     * Render characters (player, guests, staff)
     */
    renderCharacters() {
        // Character rendering logic will go here
    }

    /**
     * Render UI elements on the canvas
     */
    renderUI() {
        // UI rendering logic will go here
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        this.resizeCanvas();
        this.render();
    }

    /**
     * Resize the canvas to match its container
     */
    resizeCanvas() {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
    }
}
