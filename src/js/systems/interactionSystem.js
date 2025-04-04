/**
 * Cozy Hearth - Interaction System
 *
 * This system manages interactions between the player, NPCs, and objects in the game world.
 */

export class InteractionSystem {
    constructor() {
        // Interaction targets
        this.interactableObjects = {};
        this.interactableNPCs = {};

        // Current interaction state
        this.currentInteraction = null;
        this.interactionQueue = [];

        // Interaction history (for relationship tracking)
        this.interactionHistory = {};

        // Dialog options and responses
        this.dialogOptions = {};
    }

    /**
     * Initialize the interaction system
     * @returns {Promise} A promise that resolves when initialization is complete
     */
    async init() {
        console.log('Initializing interaction system...');

        // Load dialog data
        await this.loadDialogOptions();

        return Promise.resolve();
    }

    /**
     * Load dialog options from data files
     * @returns {Promise} A promise that resolves when dialog options are loaded
     */
    async loadDialogOptions() {
        // In a real implementation, this would load from JSON files or a database
        // For now, we'll just set up some basic dialog options

        this.dialogOptions = {
            greeting: {
                regular: [
                    "Welcome to the Crossroads Inn!",
                    "Hello there! How can I help you today?",
                    "Good day! What brings you to our inn?"
                ],
                returning: [
                    "Welcome back! It's good to see you again.",
                    "You've returned! How was your journey?",
                    "A familiar face! How have you been?"
                ]
            },
            farewell: {
                satisfied: [
                    "Thank you for your hospitality! I'll be sure to return.",
                    "What a lovely stay. Until next time!",
                    "I feel so refreshed. I'll recommend this place to others!"
                ],
                neutral: [
                    "Thank you. I should be on my way now.",
                    "I appreciate the room. Farewell.",
                    "Time for me to continue my journey. Goodbye."
                ]
            },
            request: {
                room: [
                    "I'm looking for a place to rest. Do you have any rooms available?",
                    "I need a room for the night. What do you have?",
                    "I'm weary from my travels. Is there a bed I could sleep in?"
                ],
                food: [
                    "I'm famished! What's cooking today?",
                    "Something smells delicious. Could I see a menu?",
                    "Do you serve meals here? I haven't eaten all day."
                ],
                information: [
                    "I'm new to these parts. What can you tell me about this area?",
                    "Have you heard any interesting news lately?",
                    "I'm looking for someone. Perhaps you've seen them pass through?"
                ]
            }
        };

        console.log('Dialog options loaded');
    }

    /**
     * Update the interaction system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        // Process any queued interactions
        if (this.interactionQueue.length > 0 && !this.currentInteraction) {
            this.startNextInteraction();
        }

        // Update current interaction if there is one
        if (this.currentInteraction) {
            this.updateCurrentInteraction(deltaTime);
        }
    }

    /**
     * Register an interactable object
     * @param {string} id - Unique identifier for the object
     * @param {Object} object - The object to register
     */
    registerInteractableObject(id, object) {
        this.interactableObjects[id] = object;
        console.log(`Registered interactable object: ${id}`);
    }

    /**
     * Register an interactable NPC
     * @param {string} id - Unique identifier for the NPC
     * @param {Object} npc - The NPC to register
     */
    registerInteractableNPC(id, npc) {
        this.interactableNPCs[id] = npc;
        console.log(`Registered interactable NPC: ${id}`);
    }

    /**
     * Start an interaction with an object
     * @param {string} objectId - ID of the object to interact with
     * @param {string} interactionType - Type of interaction
     * @returns {boolean} True if the interaction was started successfully
     */
    interactWithObject(objectId, interactionType) {
        const object = this.interactableObjects[objectId];

        if (!object) {
            console.error(`Object ${objectId} not found`);
            return false;
        }

        // Check if the object supports this interaction type
        if (!object.interactions || !object.interactions.includes(interactionType)) {
            console.error(`Object ${objectId} does not support interaction type ${interactionType}`);
            return false;
        }

        // Queue the interaction
        this.interactionQueue.push({
            type: 'object',
            targetId: objectId,
            interactionType,
            startTime: Date.now()
        });

        console.log(`Queued interaction with object ${objectId} (${interactionType})`);
        return true;
    }

    /**
     * Start an interaction with an NPC
     * @param {string} npcId - ID of the NPC to interact with
     * @param {string} interactionType - Type of interaction
     * @param {Object} options - Additional options for the interaction
     * @returns {boolean} True if the interaction was started successfully
     */
    interactWithNPC(npcId, interactionType, options = {}) {
        const npc = this.interactableNPCs[npcId];

        if (!npc) {
            console.error(`NPC ${npcId} not found`);
            return false;
        }

        // Check if the NPC supports this interaction type
        if (!npc.interactions || !npc.interactions.includes(interactionType)) {
            console.error(`NPC ${npcId} does not support interaction type ${interactionType}`);
            return false;
        }

        // Queue the interaction
        this.interactionQueue.push({
            type: 'npc',
            targetId: npcId,
            interactionType,
            options,
            startTime: Date.now()
        });

        console.log(`Queued interaction with NPC ${npcId} (${interactionType})`);
        return true;
    }

    /**
     * Start the next interaction in the queue
     */
    startNextInteraction() {
        if (this.interactionQueue.length === 0) return;

        this.currentInteraction = this.interactionQueue.shift();
        console.log(`Starting interaction: ${JSON.stringify(this.currentInteraction)}`);

        // Dispatch based on interaction type
        if (this.currentInteraction.type === 'object') {
            this.startObjectInteraction();
        } else if (this.currentInteraction.type === 'npc') {
            this.startNPCInteraction();
        }
    }

    /**
     * Start an interaction with an object
     */
    startObjectInteraction() {
        const { targetId, interactionType } = this.currentInteraction;
        const object = this.interactableObjects[targetId];

        if (!object) {
            console.error(`Object ${targetId} not found`);
            this.endCurrentInteraction();
            return;
        }

        // Trigger the interaction start event
        const event = new CustomEvent('interaction-start', {
            detail: {
                type: 'object',
                targetId,
                interactionType
            }
        });
        document.dispatchEvent(event);

        // In a real implementation, this would trigger specific behavior based on the object and interaction type
        console.log(`Started interaction with object ${targetId} (${interactionType})`);
    }

    /**
     * Start an interaction with an NPC
     */
    startNPCInteraction() {
        const { targetId, interactionType, options } = this.currentInteraction;
        const npc = this.interactableNPCs[targetId];

        if (!npc) {
            console.error(`NPC ${targetId} not found`);
            this.endCurrentInteraction();
            return;
        }

        // Trigger the interaction start event
        const event = new CustomEvent('interaction-start', {
            detail: {
                type: 'npc',
                targetId,
                interactionType,
                options
            }
        });
        document.dispatchEvent(event);

        // In a real implementation, this would trigger specific behavior based on the NPC and interaction type
        console.log(`Started interaction with NPC ${targetId} (${interactionType})`);

        // For dialog interactions, get appropriate dialog options
        if (interactionType === 'dialog') {
            this.startDialog(targetId, options.topic || 'greeting');
        }
    }

    /**
     * Start a dialog interaction
     * @param {string} npcId - ID of the NPC
     * @param {string} topic - Dialog topic
     */
    startDialog(npcId, topic) {
        const npc = this.interactableNPCs[npcId];

        if (!npc) {
            console.error(`NPC ${npcId} not found`);
            return;
        }

        // Check if we have dialog options for this topic
        if (!this.dialogOptions[topic]) {
            console.error(`No dialog options found for topic ${topic}`);
            return;
        }

        // Check if this is a returning NPC
        const isReturning = this.hasInteractedBefore(npcId);

        // Get appropriate dialog options based on relationship
        let dialogCategory = isReturning ? 'returning' : 'regular';

        // If the topic doesn't have subcategories, use it directly
        if (!this.dialogOptions[topic][dialogCategory]) {
            dialogCategory = null;
        }

        // Get a random dialog option
        const options = dialogCategory ?
            this.dialogOptions[topic][dialogCategory] :
            this.dialogOptions[topic];

        const dialogText = options[Math.floor(Math.random() * options.length)];

        // Trigger dialog event
        const event = new CustomEvent('dialog', {
            detail: {
                npcId,
                text: dialogText,
                topic,
                isReturning
            }
        });
        document.dispatchEvent(event);

        console.log(`NPC ${npcId} says: "${dialogText}"`);
    }

    /**
     * Update the current interaction
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    updateCurrentInteraction(deltaTime) {
        // In a real implementation, this would update the interaction state
        // For now, we'll just end the interaction after a short delay

        const interactionDuration = Date.now() - this.currentInteraction.startTime;

        // End the interaction after 3 seconds
        if (interactionDuration > 3000) {
            this.endCurrentInteraction();
        }
    }

    /**
     * End the current interaction
     */
    endCurrentInteraction() {
        if (!this.currentInteraction) return;

        const { type, targetId, interactionType } = this.currentInteraction;

        // Record the interaction in history
        this.recordInteraction(targetId, interactionType);

        // Trigger the interaction end event
        const event = new CustomEvent('interaction-end', {
            detail: {
                type,
                targetId,
                interactionType
            }
        });
        document.dispatchEvent(event);

        console.log(`Ended interaction with ${type} ${targetId} (${interactionType})`);

        this.currentInteraction = null;

        // Start the next interaction if there is one
        if (this.interactionQueue.length > 0) {
            this.startNextInteraction();
        }
    }

    /**
     * Record an interaction in the history
     * @param {string} targetId - ID of the interaction target
     * @param {string} interactionType - Type of interaction
     */
    recordInteraction(targetId, interactionType) {
        if (!this.interactionHistory[targetId]) {
            this.interactionHistory[targetId] = [];
        }

        this.interactionHistory[targetId].push({
            type: interactionType,
            timestamp: Date.now()
        });
    }

    /**
     * Check if we've interacted with a target before
     * @param {string} targetId - ID of the interaction target
     * @returns {boolean} True if we've interacted with the target before
     */
    hasInteractedBefore(targetId) {
        return this.interactionHistory[targetId] && this.interactionHistory[targetId].length > 0;
    }

    /**
     * Get the interaction history for a target
     * @param {string} targetId - ID of the interaction target
     * @returns {Array} Array of interaction records
     */
    getInteractionHistory(targetId) {
        return this.interactionHistory[targetId] || [];
    }

    /**
     * Get the current state of the interaction system
     * @returns {Object} The current interaction state
     */
    getState() {
        return {
            interactionHistory: this.interactionHistory
        };
    }

    /**
     * Load a saved interaction state
     * @param {Object} state - The interaction state to load
     */
    loadState(state) {
        if (state && state.interactionHistory) {
            this.interactionHistory = state.interactionHistory;
            console.log('Interaction state loaded');
        }
    }
}
