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
        this.generationRates = {};

        // Resource consumption rates (per game day)
        this.consumptionRates = {};
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
        // Resource generation and consumption will be handled by other systems
        // This method could be used for time-based resource changes
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

        // Check if we hit the limit
        if (newAmount === limit) {
            console.log(`${category}.${type} is at maximum capacity (${limit})`);
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
        this.resources[category][type] = currentAmount - amount;

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
}
