/**
 * Cozy Hearth - Resource System
 *
 * This system manages the game's resources, including currency, ingredients, and crafting materials.
 */

export class ResourceSystem {
    constructor() {
        // Resource categories
        this.resources = {
            // Currency
            currency: {
                gold: 0
            },

            // Cooking ingredients
            ingredients: {
                // Basic ingredients
                flour: 0,
                sugar: 0,
                salt: 0,
                eggs: 0,
                milk: 0,
                butter: 0,

                // Fruits
                apples: 0,
                berries: 0,

                // Vegetables
                potatoes: 0,
                carrots: 0,

                // Meats
                chicken: 0,
                beef: 0,
                fish: 0,

                // Magical ingredients
                glowberries: 0,
                dreamleaf: 0,
                moonwater: 0
            },

            // Crafting materials
            materials: {
                wood: 0,
                stone: 0,
                cloth: 0,
                metal: 0,
                glass: 0,

                // Magical materials
                stardust: 0,
                enchantedwood: 0,
                crystals: 0
            },

            // Garden resources
            garden: {
                seeds: {
                    vegetable: 0,
                    fruit: 0,
                    herb: 0,
                    flower: 0,
                    magical: 0
                },
                water: 0,
                fertilizer: 0
            }
        };

        // Resource limits (maximum amount that can be stored)
        this.resourceLimits = {
            currency: {
                gold: Infinity
            },
            ingredients: {
                // Default limit for basic ingredients
                default: 50
            },
            materials: {
                // Default limit for basic materials
                default: 30
            },
            garden: {
                seeds: {
                    default: 20
                },
                water: 100,
                fertilizer: 50
            }
        };

        // Resource generation rates (per game day)
        this.generationRates = {
            // Natural resource generation rates
            garden: {
                water: 10, // Rain provides some water each day
            },
            // Generated based on buildings, staff, and upgrades
            generated: {}
        };

        // Resource consumption rates (per game day)
        this.consumptionRates = {
            // Natural decay
            ingredients: {
                // Food items naturally decay over time
                default: 0.1 // 10% decay per day for ingredients
            },
            // Consumption by guests and operations
            consumed: {}
        };

        // Market prices for buying resources
        this.marketPrices = {
            ingredients: {
                flour: 2,
                sugar: 1,
                salt: 1,
                eggs: 3,
                milk: 2,
                butter: 2,
                apples: 1,
                berries: 2,
                potatoes: 1,
                carrots: 1,
                chicken: 5,
                beef: 8,
                fish: 4,
                glowberries: 15,
                dreamleaf: 20,
                moonwater: 25
            },
            materials: {
                wood: 3,
                stone: 4,
                cloth: 5,
                metal: 8,
                glass: 10,
                stardust: 30,
                enchantedwood: 25,
                crystals: 20
            },
            garden: {
                seeds: {
                    vegetable: 2,
                    fruit: 3,
                    herb: 4,
                    flower: 2,
                    magical: 15
                },
                fertilizer: 5
            }
        };

        // Selling price multiplier (selling price = buying price * multiplier)
        this.sellPriceMultiplier = 0.5;

        // Crafting recipes for resource conversion
        this.craftingRecipes = {
            bread: {
                name: "Bread",
                inputs: {
                    ingredients: {
                        flour: 2,
                        water: 1
                    }
                },
                outputs: {
                    ingredients: {
                        bread: 1
                    }
                },
                craftingTime: 30, // minutes
                requiredSkill: "cooking",
                skillLevel: 1
            },
            basicFurniture: {
                name: "Basic Furniture",
                inputs: {
                    materials: {
                        wood: 5
                    }
                },
                outputs: {
                    materials: {
                        furniture: 1
                    }
                },
                craftingTime: 60, // minutes
                requiredSkill: "crafting",
                skillLevel: 1
            }
        };

        // Active crafting processes
        this.activeCraftingProcesses = [];

        // Event listeners for resource changes
        this.eventListeners = {
            onResourceChanged: [],
            onResourceLimitReached: [],
            onCraftingCompleted: []
        };
    }

    /**
     * Initialize the resource system
     * @returns {Promise} A promise that resolves when initialization is complete
     */
    async init() {
        console.log('Initializing resource system...');
        return Promise.resolve();
    }

    /**
     * Initialize resources for a new game
     */
    initializeResources() {
        // Set starting currency
        this.resources.currency.gold = 100;

        // Set starting ingredients
        this.resources.ingredients.flour = 10;
        this.resources.ingredients.sugar = 5;
        this.resources.ingredients.salt = 5;
        this.resources.ingredients.eggs = 6;
        this.resources.ingredients.milk = 2;
        this.resources.ingredients.butter = 3;

        // Set starting materials
        this.resources.materials.wood = 15;
        this.resources.materials.stone = 10;
        this.resources.materials.cloth = 5;

        // Set starting garden resources
        this.resources.garden.seeds.vegetable = 5;
        this.resources.garden.seeds.fruit = 3;
        this.resources.garden.seeds.herb = 2;
        this.resources.garden.water = 50;
        this.resources.garden.fertilizer = 10;

        console.log('Resources initialized for new game');
    }

    /**
     * Update the resource system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Convert deltaTime to game days (based on time scale)
        const gameDaysElapsed = deltaTime / (24 * 60 * 60); // Assuming 24 game hours in a day

        // Process resource generation
        this.processResourceGeneration(gameDaysElapsed);

        // Process resource consumption/decay
        this.processResourceConsumption(gameDaysElapsed);

        // Update active crafting processes
        this.updateCraftingProcesses(deltaTime);
    }

    /**
     * Process resource generation based on rates
     * @param {number} gameDaysElapsed - Game days elapsed since last update
     */
    processResourceGeneration(gameDaysElapsed) {
        // Process natural generation
        for (const category in this.generationRates) {
            if (category === 'generated') continue; // Skip the generated category as it's handled separately

            for (const type in this.generationRates[category]) {
                const rate = this.generationRates[category][type];
                const amountToGenerate = rate * gameDaysElapsed;

                if (amountToGenerate > 0) {
                    this.addResource(category, type, amountToGenerate);
                }
            }
        }

        // Process generated resources (from buildings, staff, etc.)
        for (const entry of Object.entries(this.generationRates.generated)) {
            const [resourcePath, rate] = entry;
            const [category, type] = resourcePath.split('.');
            const amountToGenerate = rate * gameDaysElapsed;

            if (amountToGenerate > 0) {
                this.addResource(category, type, amountToGenerate);
            }
        }
    }

    /**
     * Process resource consumption/decay based on rates
     * @param {number} gameDaysElapsed - Game days elapsed since last update
     */
    processResourceConsumption(gameDaysElapsed) {
        // Process natural decay
        for (const category in this.consumptionRates) {
            if (category === 'consumed') continue; // Skip the consumed category as it's handled separately

            if (this.consumptionRates[category].default) {
                // Apply default decay rate to all resources in this category
                const decayRate = this.consumptionRates[category].default;

                for (const type in this.resources[category]) {
                    // Skip subcategories (objects)
                    if (typeof this.resources[category][type] !== 'number') continue;

                    const currentAmount = this.resources[category][type];
                    const decayAmount = currentAmount * decayRate * gameDaysElapsed;

                    if (decayAmount > 0 && currentAmount > 0) {
                        this.removeResource(category, type, Math.min(decayAmount, currentAmount));
                    }
                }
            }

            // Apply specific decay rates
            for (const type in this.consumptionRates[category]) {
                if (type === 'default') continue; // Skip the default rate

                const rate = this.consumptionRates[category][type];
                const currentAmount = this.getResourceAmount(category, type);
                const consumptionAmount = currentAmount * rate * gameDaysElapsed;

                if (consumptionAmount > 0 && currentAmount > 0) {
                    this.removeResource(category, type, Math.min(consumptionAmount, currentAmount));
                }
            }
        }

        // Process consumed resources (by guests, operations, etc.)
        for (const entry of Object.entries(this.consumptionRates.consumed)) {
            const [resourcePath, rate] = entry;
            const [category, type] = resourcePath.split('.');
            const currentAmount = this.getResourceAmount(category, type);
            const consumptionAmount = rate * gameDaysElapsed;

            if (consumptionAmount > 0 && currentAmount > 0) {
                this.removeResource(category, type, Math.min(consumptionAmount, currentAmount));
            }
        }
    }

    /**
     * Update ongoing crafting processes
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    updateCraftingProcesses(deltaTime) {
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
                        this.addResource(category, type, amount);
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
     * Add a resource
     * @param {string} category - The resource category (e.g., 'currency', 'ingredients')
     * @param {string} type - The resource type (e.g., 'gold', 'flour')
     * @param {number} amount - The amount to add
     * @returns {boolean} True if the resource was added successfully
     */
    addResource(category, type, amount) {
        // Check if the category and type exist
        if (!this.resources[category] || !this.resources[category][type]) {
            console.error(`Resource ${category}.${type} does not exist`);
            return false;
        }

        // Check if the amount is valid
        if (amount <= 0) {
            console.error('Amount must be positive');
            return false;
        }

        // Get the current amount
        const currentAmount = this.getResourceAmount(category, type);

        // Get the resource limit
        const limit = this.getResourceLimit(category, type);

        // Calculate the new amount, respecting the limit
        const newAmount = Math.min(currentAmount + amount, limit);

        // Update the resource
        this.resources[category][type] = newAmount;

        // Trigger resource changed event
        this.triggerEvent('onResourceChanged', {
            category,
            type,
            oldAmount: currentAmount,
            newAmount,
            change: newAmount - currentAmount
        });

        // Check if we hit the limit
        if (newAmount === limit) {
            console.log(`${category}.${type} is at maximum capacity (${limit})`);

            // Trigger resource limit reached event
            this.triggerEvent('onResourceLimitReached', {
                category,
                type,
                limit
            });

            return true;
        }

        console.log(`Added ${amount} ${category}.${type}, now have ${newAmount}`);
        return true;
    }

    /**
     * Remove a resource
     * @param {string} category - The resource category (e.g., 'currency', 'ingredients')
     * @param {string} type - The resource type (e.g., 'gold', 'flour')
     * @param {number} amount - The amount to remove
     * @returns {boolean} True if the resource was removed successfully
     */
    removeResource(category, type, amount) {
        // Check if the category and type exist
        if (!this.resources[category] || !this.resources[category][type]) {
            console.error(`Resource ${category}.${type} does not exist`);
            return false;
        }

        // Check if the amount is valid
        if (amount <= 0) {
            console.error('Amount must be positive');
            return false;
        }

        // Get the current amount
        const currentAmount = this.getResourceAmount(category, type);

        // Check if we have enough
        if (currentAmount < amount) {
            console.error(`Not enough ${category}.${type} (have ${currentAmount}, need ${amount})`);
            return false;
        }

        // Update the resource
        const newAmount = currentAmount - amount;
        this.resources[category][type] = newAmount;

        // Trigger resource changed event
        this.triggerEvent('onResourceChanged', {
            category,
            type,
            oldAmount: currentAmount,
            newAmount,
            change: newAmount - currentAmount
        });

        console.log(`Removed ${amount} ${category}.${type}, now have ${this.resources[category][type]}`);
        return true;
    }

    /**
     * Get the amount of a resource
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @returns {number} The amount of the resource
     */
    getResourceAmount(category, type) {
        // Check if the category exists
        if (!this.resources[category]) {
            console.error(`Resource category ${category} does not exist`);
            return 0;
        }

        // Handle nested resources (e.g., garden.seeds.vegetable)
        if (type.includes('.')) {
            const parts = type.split('.');
            let resource = this.resources[category];

            for (const part of parts) {
                if (!resource[part]) {
                    console.error(`Resource ${category}.${type} does not exist`);
                    return 0;
                }
                resource = resource[part];
            }

            return resource;
        }

        // Check if the type exists
        if (!this.resources[category][type]) {
            console.error(`Resource ${category}.${type} does not exist`);
            return 0;
        }

        return this.resources[category][type];
    }

    /**
     * Get the limit of a resource
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @returns {number} The resource limit
     */
    getResourceLimit(category, type) {
        // Check if there's a specific limit for this resource
        if (this.resourceLimits[category] && this.resourceLimits[category][type]) {
            return this.resourceLimits[category][type];
        }

        // Check if there's a default limit for this category
        if (this.resourceLimits[category] && this.resourceLimits[category].default) {
            return this.resourceLimits[category].default;
        }

        // Default to infinity if no limit is specified
        return Infinity;
    }

    /**
     * Set the limit of a resource
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @param {number} limit - The new limit
     */
    setResourceLimit(category, type, limit) {
        // Ensure the category exists in limits
        if (!this.resourceLimits[category]) {
            this.resourceLimits[category] = {};
        }

        // Set the limit
        this.resourceLimits[category][type] = limit;
        console.log(`Set ${category}.${type} limit to ${limit}`);

        // If current amount exceeds the new limit, cap it
        if (this.resources[category] && this.resources[category][type] > limit) {
            this.resources[category][type] = limit;
            console.log(`Capped ${category}.${type} to new limit of ${limit}`);
        }
    }

    /**
     * Check if there are enough resources for a recipe or crafting project
     * @param {Object} requirements - Object mapping resource categories and types to amounts
     * @returns {boolean} True if there are enough resources
     */
    hasEnoughResources(requirements) {
        for (const category in requirements) {
            for (const type in requirements[category]) {
                const required = requirements[category][type];
                const available = this.getResourceAmount(category, type);

                if (available < required) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Consume resources for a recipe or crafting project
     * @param {Object} requirements - Object mapping resource categories and types to amounts
     * @returns {boolean} True if the resources were consumed successfully
     */
    consumeResources(requirements) {
        // First check if we have enough resources
        if (!this.hasEnoughResources(requirements)) {
            console.error('Not enough resources');
            return false;
        }

        // Consume the resources
        for (const category in requirements) {
            for (const type in requirements[category]) {
                const amount = requirements[category][type];
                this.removeResource(category, type, amount);
            }
        }

        return true;
    }

    /**
     * Get all resources in a specific category
     * @param {string} category - The resource category
     * @returns {Object} Object containing all resources in the category
     */
    getCategoryResources(category) {
        if (!this.resources[category]) {
            console.error(`Resource category ${category} does not exist`);
            return {};
        }

        return { ...this.resources[category] };
    }

    /**
     * Get the current state of all resources
     * @returns {Object} The current resource state
     */
    getState() {
        return JSON.parse(JSON.stringify(this.resources));
    }

    /**
     * Load a saved resource state
     * @param {Object} state - The resource state to load
     */
    loadState(state) {
        if (state) {
            // Deep copy the state to avoid reference issues
            this.resources = JSON.parse(JSON.stringify(state));
            console.log('Resource state loaded');
        }
    }

    /**
     * Buy a resource from the market
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @param {number} amount - The amount to buy
     * @returns {boolean} True if the purchase was successful
     */
    buyResource(category, type, amount) {
        // Check if the market sells this resource
        if (!this.marketPrices[category] || !this.marketPrices[category][type]) {
            console.error(`Resource ${category}.${type} is not available in the market`);
            return false;
        }

        // Calculate the total cost
        const unitPrice = this.marketPrices[category][type];
        const totalCost = unitPrice * amount;

        // Check if the player has enough gold
        const currentGold = this.getResourceAmount('currency', 'gold');
        if (currentGold < totalCost) {
            console.error(`Not enough gold (have ${currentGold}, need ${totalCost})`);
            return false;
        }

        // Remove the gold
        if (!this.removeResource('currency', 'gold', totalCost)) {
            return false;
        }

        // Add the purchased resource
        if (!this.addResource(category, type, amount)) {
            // Refund the gold if the resource couldn't be added
            this.addResource('currency', 'gold', totalCost);
            return false;
        }

        console.log(`Bought ${amount} ${category}.${type} for ${totalCost} gold`);
        return true;
    }

    /**
     * Sell a resource to the market
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @param {number} amount - The amount to sell
     * @returns {boolean} True if the sale was successful
     */
    sellResource(category, type, amount) {
        // Check if the market buys this resource
        if (!this.marketPrices[category] || !this.marketPrices[category][type]) {
            console.error(`Resource ${category}.${type} cannot be sold to the market`);
            return false;
        }

        // Check if the player has enough of the resource
        if (!this.hasEnoughResources({ [category]: { [type]: amount } })) {
            return false;
        }

        // Calculate the sell price
        const unitPrice = this.marketPrices[category][type] * this.sellPriceMultiplier;
        const totalPrice = unitPrice * amount;

        // Remove the resource
        if (!this.removeResource(category, type, amount)) {
            return false;
        }

        // Add the gold
        this.addResource('currency', 'gold', totalPrice);

        console.log(`Sold ${amount} ${category}.${type} for ${totalPrice} gold`);
        return true;
    }

    /**
     * Start a crafting process
     * @param {string} recipeId - The ID of the crafting recipe
     * @param {number} quantity - The quantity to craft
     * @param {Object} player - The player object (for skill checks)
     * @returns {boolean} True if the crafting process was started successfully
     */
    startCrafting(recipeId, quantity = 1, player = null) {
        // Check if the recipe exists
        if (!this.craftingRecipes[recipeId]) {
            console.error(`Recipe ${recipeId} does not exist`);
            return false;
        }

        const recipe = this.craftingRecipes[recipeId];

        // Check if the player has the required skill level
        if (player && recipe.requiredSkill && recipe.skillLevel) {
            const playerSkillLevel = player.skills[recipe.requiredSkill] || 0;
            if (playerSkillLevel < recipe.skillLevel) {
                console.error(`Player doesn't have the required ${recipe.requiredSkill} skill level (have ${playerSkillLevel}, need ${recipe.skillLevel})`);
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
        if (!this.hasEnoughResources(scaledInputs)) {
            console.error('Not enough resources for crafting');
            return false;
        }

        // Consume the resources
        if (!this.consumeResources(scaledInputs)) {
            console.error('Failed to consume resources for crafting');
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
     * Set a resource generation rate
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @param {number} rate - The generation rate per game day
     */
    setGenerationRate(category, type, rate) {
        // If it's a special generated resource from a building/upgrade
        if (category === 'generated') {
            this.generationRates.generated[type] = rate;
        } else {
            // Ensure the category exists in generation rates
            if (!this.generationRates[category]) {
                this.generationRates[category] = {};
            }

            // Set the generation rate
            this.generationRates[category][type] = rate;
        }

        console.log(`Set ${category}.${type} generation rate to ${rate} per day`);
    }

    /**
     * Set a resource consumption rate
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @param {number} rate - The consumption rate per game day
     */
    setConsumptionRate(category, type, rate) {
        // If it's a special consumed resource by a building/guest
        if (category === 'consumed') {
            this.consumptionRates.consumed[type] = rate;
        } else {
            // Ensure the category exists in consumption rates
            if (!this.consumptionRates[category]) {
                this.consumptionRates[category] = {};
            }

            // Set the consumption rate
            this.consumptionRates[category][type] = rate;
        }

        console.log(`Set ${category}.${type} consumption rate to ${rate} per day`);
    }

    /**
     * Add a new resource type
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @param {number} initialAmount - The initial amount
     * @param {number} limit - The resource limit
     * @returns {boolean} True if the resource was added successfully
     */
    addResourceType(category, type, initialAmount = 0, limit = Infinity) {
        // Check if the category exists
        if (!this.resources[category]) {
            console.error(`Resource category ${category} does not exist`);
            return false;
        }

        // Check if the resource already exists
        if (this.resources[category][type] !== undefined) {
            console.error(`Resource ${category}.${type} already exists`);
            return false;
        }

        // Add the resource
        this.resources[category][type] = initialAmount;

        // Set the limit if provided
        if (limit !== Infinity) {
            this.setResourceLimit(category, type, limit);
        }

        console.log(`Added new resource type ${category}.${type} with initial amount ${initialAmount}`);
        return true;
    }

    /**
     * Add an event listener for resource events
     * @param {string} eventType - The event type ('onResourceChanged', 'onResourceLimitReached', 'onCraftingCompleted')
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
     * @param {Function} callback - The callback function to remove
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

    /**
     * Get the market price for a resource
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @returns {number} The market price, or -1 if not available
     */
    getMarketPrice(category, type) {
        if (this.marketPrices[category] && this.marketPrices[category][type] !== undefined) {
            return this.marketPrices[category][type];
        }
        return -1;
    }

    /**
     * Set the market price for a resource
     * @param {string} category - The resource category
     * @param {string} type - The resource type
     * @param {number} price - The new price
     */
    setMarketPrice(category, type, price) {
        // Ensure the category exists in market prices
        if (!this.marketPrices[category]) {
            this.marketPrices[category] = {};
        }

        // Set the price
        this.marketPrices[category][type] = price;
        console.log(`Set ${category}.${type} market price to ${price}`);
    }

    /**
     * Get all craftable recipes based on available resources
     * @param {Object} player - The player object (for skill checks)
     * @returns {Array} Array of craftable recipes
     */
    getCraftableRecipes(player = null) {
        const craftableRecipes = [];

        for (const [recipeId, recipe] of Object.entries(this.craftingRecipes)) {
            // Check skill requirements if player is provided
            if (player && recipe.requiredSkill && recipe.skillLevel) {
                const playerSkillLevel = player.skills[recipe.requiredSkill] || 0;
                if (playerSkillLevel < recipe.skillLevel) {
                    continue;
                }
            }

            // Check if we have enough resources
            if (this.hasEnoughResources(recipe.inputs)) {
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
        this.craftingRecipes[recipeId] = recipe;
        console.log(`Added new crafting recipe: ${recipe.name}`);
    }
}
