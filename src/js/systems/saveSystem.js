/**
 * Cozy Hearth - Save System
 *
 * This system handles saving and loading game data using localStorage.
 */

export class SaveSystem {
    constructor() {
        this.saveKey = 'cozy_hearth_save';
        this.autoSaveInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.autoSaveTimer = null;
    }

    /**
     * Initialize the save system
     * @returns {Promise} A promise that resolves when initialization is complete
     */
    async init() {
        console.log('Initializing save system...');

        // Set up auto-save
        this.startAutoSave();

        return Promise.resolve();
    }

    /**
     * Start the auto-save timer
     */
    startAutoSave() {
        // Clear any existing timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }

        // Set up a new timer
        this.autoSaveTimer = setInterval(() => {
            // This will be called by the game instance with current game data
            console.log('Auto-save triggered');
            // The actual save happens in the Game class, which calls saveGame()
        }, this.autoSaveInterval);

        console.log(`Auto-save set for every ${this.autoSaveInterval / 60000} minutes`);
    }

    /**
     * Stop the auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('Auto-save stopped');
        }
    }

    /**
     * Save game data to localStorage
     * @param {Object} gameData - The game data to save
     * @returns {boolean} True if save was successful, false otherwise
     */
    saveGame(gameData) {
        try {
            // Add timestamp to save data
            const saveData = {
                ...gameData,
                saveTimestamp: new Date().toISOString()
            };

            // Convert to JSON and save to localStorage
            const saveString = JSON.stringify(saveData);
            localStorage.setItem(this.saveKey, saveString);

            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load game data from localStorage
     * @returns {Object|null} The loaded game data, or null if no save exists
     */
    loadGame() {
        try {
            // Get save data from localStorage
            const saveString = localStorage.getItem(this.saveKey);

            // If no save exists, return null
            if (!saveString) {
                console.log('No saved game found');
                return null;
            }

            // Parse the save data
            const saveData = JSON.parse(saveString);
            console.log(`Loaded save from ${saveData.saveTimestamp}`);

            return saveData;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    }

    /**
     * Delete saved game data
     * @returns {boolean} True if deletion was successful, false otherwise
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            console.log('Save data deleted');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }

    /**
     * Check if a save file exists
     * @returns {boolean} True if a save exists, false otherwise
     */
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /**
     * Export save data as a JSON file for backup
     */
    exportSave() {
        try {
            const saveString = localStorage.getItem(this.saveKey);

            if (!saveString) {
                console.log('No save data to export');
                return;
            }

            // Create a blob with the save data
            const blob = new Blob([saveString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Create a link element to download the file
            const a = document.createElement('a');
            a.href = url;
            a.download = `cozy_hearth_save_${new Date().toISOString().replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Save data exported');
        } catch (error) {
            console.error('Failed to export save:', error);
        }
    }

    /**
     * Import save data from a JSON file
     * @param {File} file - The file to import
     * @returns {Promise<boolean>} A promise that resolves to true if import was successful
     */
    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const saveString = event.target.result;
                    const saveData = JSON.parse(saveString);

                    // Validate the save data (basic check)
                    if (!saveData || !saveData.saveTimestamp) {
                        console.error('Invalid save file');
                        resolve(false);
                        return;
                    }

                    // Save the imported data
                    localStorage.setItem(this.saveKey, saveString);
                    console.log(`Imported save from ${saveData.saveTimestamp}`);
                    resolve(true);
                } catch (error) {
                    console.error('Failed to import save:', error);
                    resolve(false);
                }
            };

            reader.onerror = () => {
                console.error('Failed to read save file');
                resolve(false);
            };

            reader.readAsText(file);
        });
    }
}
