/**
 * Cozy Hearth - Crafting System
 *
 * This system manages crafting of items, recipes, and resource conversion.
 */

export class CraftingSystem {
    constructor(resourceSystem, player) {
        this.resourceSystem = resourceSystem;
        this.player = player;

        // Active crafting processes
        this.activeCraftingProcesses = [];

        // Event listeners for crafting events
        this.eventListeners = {
            onCraftingStarted: [],
            onCraftingCompleted: [],
            onCraftingFailed: []
        };
    }

    /**
     * Initialize the crafting system
     * @returns {Promise} A promise that resolves when initialization is complete
     */
    async init() {
        console.log('Initializing crafting system...');
        return Promise.resolve();
    }

    /**
     * Update ongoing crafting processes
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Update progress on each active crafting process
        for (let i = this.activeCraftingProcesses.length - 1; i >= 0; i--) {
            const process = this.activeCraftingProcesses[i];
            process.timeRemaining -= deltaTime;

            // Check if the process is complete
            if (process.timeRemaining <= 0) {
                // Process is complete, add the outputs
                for (const category in process.recipe.outputs) {
                    for (const type in process.recipe.outputs[category]) {
                        const amount = process.recipe.outputs[category][type] * process.quantity;
                        this.resourceSystem.addResource(category, type, amount);
                    }
                }

                // Remove this process from active processes
                this.activeCraftingProcesses.splice(i, 1);

                // Trigger crafting completed event
                this.triggerEvent('onCraftingCompleted', {
                    recipe: process.recipe,
                    quantity: process.quantity
                });
            }
        }
    }

    /**
     * Start a crafting process
     * @param {string} recipeId - The ID of the crafting recipe
     * @param {number} quantity - The quantity to craft
     * @returns {boolean} True if the crafting process was started successfully
     */
    startCrafting(recipeId, quantity = 1) {
        // Get the recipe from the resource system
        const recipe = this.resourceSystem.craftingRecipes[recipeId];
        if (!recipe) {
            console.error(`Recipe ${recipeId} does not exist`);
            this.triggerEvent('onCraftingFailed', {
                recipeId,
                reason: 'Recipe does not exist'
            });
            return false;
        }

        // Check if the player has the required skill level
        if (recipe.requiredSkill && recipe.skillLevel) {
            const playerSkillLevel = this.player?.skills[recipe.requiredSkill] || 0;
            if (playerSkillLevel < recipe.skillLevel) {
                console.error(`Player doesn't have the required ${recipe.requiredSkill} skill level (have ${playerSkillLevel}, need ${recipe.skillLevel})`);
                this.triggerEvent('onCraftingFailed', {
                    recipe,
                    reason: 'Insufficient skill level'
                });
                return false;
            }
        }

        // Scale the inputs based on quantity
        const scaledInputs = {};
        for (const category in recipe.inputs) {
            scaledInputs[category] = {};
            for (const type in recipe.inputs[category]) {
                scaledInputs[category][type] = recipe.inputs[category][type] * quantity;
            }
        }

        // Check if the player has enough resources
        if (!this.resourceSystem.hasEnoughResources(scaledInputs)) {
            console.error('Not enough resources for crafting');
            this.triggerEvent('onCraftingFailed', {
                recipe,
                reason: 'Insufficient resources'
            });
            return false;
        }

        // Consume the resources
        if (!this.resourceSystem.consumeResources(scaledInputs)) {
            console.error('Failed to consume resources for crafting');
            this.triggerEvent('onCraftingFailed', {
                recipe,
                reason: 'Resource consumption failed'
            });
            return false;
        }

        // Calculate crafting time in seconds
        const craftingTimeSeconds = recipe.craftingTime * 60 * quantity;

        // Add the crafting process to active processes
        this.activeCraftingProcesses.push({
            recipe,
            quantity,
            timeRemaining: craftingTimeSeconds
        });

        // Trigger crafting started event
        this.triggerEvent('onCraftingStarted', {
            recipe,
            quantity,
            timeRemaining: craftingTimeSeconds
        });

        console.log(`Started crafting ${quantity} ${recipe.name}, will complete in ${recipe.craftingTime * quantity} minutes`);
        return true;
    }

    /**
     * Get all active crafting processes
     * @returns {Array} Array of active crafting processes
     */
    getActiveCraftingProcesses() {
        return [...this.activeCraftingProcesses];
    }

    /**
     * Get all craftable recipes based on available resources and player skills
     * @returns {Array} Array of craftable recipes
     */
    getCraftableRecipes() {
        const craftableRecipes = [];

        for (const [recipeId, recipe] of Object.entries(this.resourceSystem.craftingRecipes)) {
            // Check skill requirements if player is provided
            if (recipe.requiredSkill && recipe.skillLevel) {
                const playerSkillLevel = this.player?.skills[recipe.requiredSkill] || 0;
                if (playerSkillLevel < recipe.skillLevel) {
                    continue;
                }
            }

            // Check if we have enough resources
            if (this.resourceSystem.hasEnoughResources(recipe.inputs)) {
                craftableRecipes.push({
                    id: recipeId,
                    ...recipe
                });
            }
        }

        return craftableRecipes;
    }

    /**
     * Add a new crafting recipe
     * @param {string} recipeId - The recipe ID
     * @param {Object} recipe - The recipe definition
     */
    addCraftingRecipe(recipeId, recipe) {
        this.resourceSystem.craftingRecipes[recipeId] = recipe;
        console.log(`Added new crafting recipe: ${recipe.name}`);
    }

    /**
     * Create a dialog for crafting
     * @returns {HTMLElement} The crafting dialog content
     */
    createCraftingDialog() {
        const container = document.createElement('div');
        container.className = 'crafting-container';

        // Get available recipes
        const craftableRecipes = this.getCraftableRecipes();

        if (craftableRecipes.length === 0) {
            const noRecipesMsg = document.createElement('p');
            noRecipesMsg.textContent = 'You don\'t have the materials to craft anything right now.';
            container.appendChild(noRecipesMsg);
            return container;
        }

        // Group recipes by type
        const recipeTypes = {
            cooking: { name: 'Cooking', recipes: [] },
            crafting: { name: 'Crafting', recipes: [] }
        };

        for (const recipe of craftableRecipes) {
            const type = recipe.requiredSkill || 'crafting';
            if (recipeTypes[type]) {
                recipeTypes[type].recipes.push(recipe);
            } else {
                recipeTypes.crafting.recipes.push(recipe);
            }
        }

        // Create tabs for recipe types
        const typesTabs = document.createElement('div');
        typesTabs.className = 'recipe-type-tabs';

        const typesContent = document.createElement('div');
        typesContent.className = 'recipe-type-content';

        // Add tabs for each non-empty recipe type
        let firstTab = null;
        for (const [typeId, typeInfo] of Object.entries(recipeTypes)) {
            if (typeInfo.recipes.length === 0) continue;

            const tab = document.createElement('button');
            tab.className = 'recipe-type-tab';
            tab.textContent = typeInfo.name;

            if (!firstTab) {
                firstTab = tab;
                tab.classList.add('active');
            }

            tab.addEventListener('click', () => {
                // Update active tab
                document.querySelectorAll('.recipe-type-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content
                typesContent.innerHTML = '';
                typesContent.appendChild(this.createRecipeList(typeInfo.recipes));
            });

            typesTabs.appendChild(tab);
        }

        container.appendChild(typesTabs);
        container.appendChild(typesContent);

        // Initialize with first tab's content if there are any tabs
        if (firstTab) {
            typesContent.appendChild(this.createRecipeList(recipeTypes[Object.keys(recipeTypes).find(
                key => recipeTypes[key].recipes.length > 0
            )].recipes));
        }

        return container;
    }

    /**
     * Create a list of recipes for the crafting dialog
     * @param {Array} recipes - Array of recipe objects
     * @returns {HTMLElement} The recipe list element
     */
    createRecipeList(recipes) {
        const container = document.createElement('div');
        container.className = 'recipe-list';

        for (const recipe of recipes) {
            const recipeElement = document.createElement('div');
            recipeElement.className = 'recipe-item';

            // Recipe header
            const recipeHeader = document.createElement('div');
            recipeHeader.className = 'recipe-header';

            const recipeName = document.createElement('h4');
            recipeName.className = 'recipe-name';
            recipeName.textContent = recipe.name;
            recipeHeader.appendChild(recipeName);

            // Skill requirement
            if (recipe.requiredSkill && recipe.skillLevel) {
                const skillReq = document.createElement('span');
                skillReq.className = 'recipe-skill';
                skillReq.textContent = `${recipe.requiredSkill.charAt(0).toUpperCase() + recipe.requiredSkill.slice(1)} Lvl ${recipe.skillLevel}`;
                recipeHeader.appendChild(skillReq);
            }

            recipeElement.appendChild(recipeHeader);

            // Recipe inputs
            const inputsContainer = document.createElement('div');
            inputsContainer.className = 'recipe-inputs';
            inputsContainer.innerHTML = '<h5>Requires:</h5>';

            const inputsList = document.createElement('ul');
            for (const category in recipe.inputs) {
                for (const type in recipe.inputs[category]) {
                    const amount = recipe.inputs[category][type];
                    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');

                    const inputItem = document.createElement('li');
                    inputItem.textContent = `${amount} ${formattedType}`;
                    inputsList.appendChild(inputItem);
                }
            }

            inputsContainer.appendChild(inputsList);
            recipeElement.appendChild(inputsContainer);

            // Recipe outputs
            const outputsContainer = document.createElement('div');
            outputsContainer.className = 'recipe-outputs';
            outputsContainer.innerHTML = '<h5>Creates:</h5>';

            const outputsList = document.createElement('ul');
            for (const category in recipe.outputs) {
                for (const type in recipe.outputs[category]) {
                    const amount = recipe.outputs[category][type];
                    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');

                    const outputItem = document.createElement('li');
                    outputItem.textContent = `${amount} ${formattedType}`;
                    outputsList.appendChild(outputItem);
                }
            }

            outputsContainer.appendChild(outputsList);
            recipeElement.appendChild(outputsContainer);

            // Crafting time
            const timeInfo = document.createElement('div');
            timeInfo.className = 'recipe-time';
            timeInfo.textContent = `Time: ${recipe.craftingTime} minutes`;
            recipeElement.appendChild(timeInfo);

            // Craft button
            const craftControls = document.createElement('div');
            craftControls.className = 'recipe-controls';

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = '1';
            quantityInput.max = '99';
            quantityInput.value = '1';
            quantityInput.className = 'recipe-quantity';
            craftControls.appendChild(quantityInput);

            const craftButton = document.createElement('button');
            craftButton.className = 'btn btn-craft';
            craftButton.textContent = 'Craft';
            craftButton.addEventListener('click', () => {
                const quantity = parseInt(quantityInput.value);
                if (isNaN(quantity) || quantity <= 0) return;

                const success = this.startCrafting(recipe.id, quantity);

                if (success) {
                    // Add visual feedback
                    const craftingStarted = document.createElement('div');
                    craftingStarted.className = 'crafting-started';
                    craftingStarted.textContent = `Crafting ${quantity} ${recipe.name}...`;
                    recipeElement.appendChild(craftingStarted);

                    // Disable the craft button temporarily
                    craftButton.disabled = true;

                    // Re-enable after a short delay
                    setTimeout(() => {
                        recipeElement.removeChild(craftingStarted);
                        craftButton.disabled = false;
                    }, 2000);
                }
            });

            craftControls.appendChild(craftButton);
            recipeElement.appendChild(craftControls);

            container.appendChild(recipeElement);
        }

        return container;
    }

    /**
     * Add an event listener
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function
     */
    addEventListener(eventType, callback) {
        if (this.eventListeners[eventType]) {
            this.eventListeners[eventType].push(callback);
        }
    }

    /**
     * Remove an event listener
     * @param {string} eventType - The event type
     * @param {Function} callback - The callback function
     */
    removeEventListener(eventType, callback) {
        if (this.eventListeners[eventType]) {
            const index = this.eventListeners[eventType].indexOf(callback);
            if (index !== -1) {
                this.eventListeners[eventType].splice(index, 1);
            }
        }
    }

    /**
     * Trigger an event
     * @param {string} eventType - The event type
     * @param {Object} data - The event data
     */
    triggerEvent(eventType, data) {
        if (this.eventListeners[eventType]) {
            for (const callback of this.eventListeners[eventType]) {
                callback(data);
            }
        }
    }
}
