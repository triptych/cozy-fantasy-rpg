/**
 * Cozy Hearth - Game Data
 *
 * This file contains initial game data and configuration.
 */

// Initial player data
export const initialPlayerData = {
    name: 'Innkeeper',
    skills: {
        cooking: 1,
        gardening: 1,
        crafting: 1,
        diplomacy: 1
    },
    inventory: []
};

// Initial inn data
export const initialInnData = {
    name: 'The Crossroads Inn',
    reputation: 1,
    rooms: [
        {
            id: 'room1',
            name: 'Cozy Corner',
            quality: 1,
            occupied: false,
            furniture: ['bed', 'table', 'chair']
        },
        {
            id: 'room2',
            name: 'Forest View',
            quality: 1,
            occupied: false,
            furniture: ['bed', 'table', 'chair', 'bookshelf']
        }
    ],
    staff: [],
    upgrades: []
};

// Initial guest data
export const initialGuestTypes = [
    {
        type: 'traveler',
        name: 'Weary Traveler',
        description: 'A tired traveler looking for a place to rest.',
        preferences: {
            food: ['hearty_stew', 'fresh_bread'],
            room: ['quiet', 'comfortable']
        },
        dialogues: {
            greeting: [
                "Hello there, I've been on the road for days. Do you have a room available?",
                "What a charming inn! I could use a good night's rest."
            ],
            request: [
                "I'm famished from my journey. What's cooking today?",
                "Is there somewhere I can wash up? The road has been dusty."
            ],
            farewell: [
                "Thank you for your hospitality. I'll be sure to recommend this place.",
                "I feel refreshed and ready to continue my journey. Farewell!"
            ]
        },
        stayDuration: { min: 1, max: 3 },
        paymentRange: { min: 10, max: 20 }
    },
    {
        type: 'merchant',
        name: 'Traveling Merchant',
        description: 'A merchant with goods to sell and stories to tell.',
        preferences: {
            food: ['roast_chicken', 'apple_pie'],
            room: ['secure', 'spacious']
        },
        dialogues: {
            greeting: [
                "Greetings, innkeeper! I have wares to sell and coin to spend.",
                "Ah, a fine establishment! I hope you have room for a merchant and his goods."
            ],
            request: [
                "Do you have a secure place for my merchandise?",
                "I'd love a hearty meal and perhaps some local gossip."
            ],
            farewell: [
                "Business was good here. I'll return on my next route.",
                "Thank you for accommodating my unusual hours. Until next time!"
            ]
        },
        stayDuration: { min: 2, max: 5 },
        paymentRange: { min: 15, max: 30 },
        sellsItems: true
    }
];

// Recipe data
export const recipeData = [
    {
        id: 'hearty_stew',
        name: 'Hearty Stew',
        description: 'A filling stew that warms the body and soul.',
        ingredients: {
            vegetables: 2,
            meat: 1,
            herbs: 1
        },
        cookingTime: 30, // minutes
        difficulty: 1,
        effects: {
            energy: 3,
            comfort: 2
        },
        season: 'all'
    },
    {
        id: 'fresh_bread',
        name: 'Fresh Bread',
        description: 'Warm, crusty bread with a soft interior.',
        ingredients: {
            flour: 2,
            water: 1
        },
        cookingTime: 60, // minutes
        difficulty: 1,
        effects: {
            energy: 1,
            comfort: 1
        },
        season: 'all'
    },
    {
        id: 'apple_pie',
        name: 'Apple Pie',
        description: 'Sweet and tangy apple pie with a flaky crust.',
        ingredients: {
            flour: 1,
            apples: 3,
            sugar: 1,
            butter: 1
        },
        cookingTime: 45, // minutes
        difficulty: 2,
        effects: {
            energy: 2,
            comfort: 3,
            happiness: 2
        },
        season: 'autumn'
    }
];

// Item data
export const itemData = {
    furniture: [
        {
            id: 'basic_bed',
            name: 'Basic Bed',
            description: 'A simple but comfortable bed.',
            cost: 50,
            comfort: 1,
            requiredMaterials: {
                wood: 5,
                cloth: 3
            }
        },
        {
            id: 'wooden_table',
            name: 'Wooden Table',
            description: 'A sturdy wooden table.',
            cost: 30,
            requiredMaterials: {
                wood: 4
            }
        },
        {
            id: 'wooden_chair',
            name: 'Wooden Chair',
            description: 'A simple wooden chair.',
            cost: 15,
            comfort: 1,
            requiredMaterials: {
                wood: 2,
                cloth: 1
            }
        }
    ],

    decorations: [
        {
            id: 'flower_vase',
            name: 'Flower Vase',
            description: 'A ceramic vase for displaying flowers.',
            cost: 10,
            beauty: 1
        },
        {
            id: 'wall_tapestry',
            name: 'Wall Tapestry',
            description: 'A decorative tapestry to hang on the wall.',
            cost: 25,
            beauty: 2,
            comfort: 1
        }
    ],

    tools: [
        {
            id: 'cooking_pot',
            name: 'Cooking Pot',
            description: 'Essential for cooking stews and soups.',
            cost: 20,
            requiredMaterials: {
                metal: 3
            }
        },
        {
            id: 'gardening_tools',
            name: 'Gardening Tools',
            description: 'Basic tools for tending the garden.',
            cost: 15,
            requiredMaterials: {
                wood: 2,
                metal: 1
            }
        }
    ]
};

// Season data
export const seasonData = [
    {
        id: 'spring',
        name: 'Spring',
        description: 'A time of renewal and growth.',
        weatherTypes: ['sunny', 'rainy', 'cloudy'],
        weatherProbabilities: [0.5, 0.3, 0.2],
        growableCrops: ['herbs', 'early_vegetables', 'flowers'],
        events: ['spring_festival', 'planting_season']
    },
    {
        id: 'summer',
        name: 'Summer',
        description: 'Warm days and abundant harvests.',
        weatherTypes: ['sunny', 'hot', 'stormy'],
        weatherProbabilities: [0.6, 0.3, 0.1],
        growableCrops: ['vegetables', 'fruits', 'berries'],
        events: ['summer_fair', 'fishing_contest']
    },
    {
        id: 'autumn',
        name: 'Autumn',
        description: 'Harvest time and colorful foliage.',
        weatherTypes: ['sunny', 'cloudy', 'rainy', 'windy'],
        weatherProbabilities: [0.3, 0.3, 0.2, 0.2],
        growableCrops: ['pumpkins', 'apples', 'late_vegetables'],
        events: ['harvest_festival', 'autumn_market']
    },
    {
        id: 'winter',
        name: 'Winter',
        description: 'Cold days and cozy nights by the fire.',
        weatherTypes: ['snowy', 'clear', 'blizzard'],
        weatherProbabilities: [0.5, 0.4, 0.1],
        growableCrops: ['winter_herbs', 'mushrooms'],
        events: ['winter_solstice', 'gift_exchange']
    }
];

// Game settings and configuration
export const gameConfig = {
    dayLength: 24, // minutes in a game day
    startingSeason: 'spring',
    startingDay: 1,
    startingYear: 1,
    startingTime: 6, // 6 AM
    timeScale: 60, // 1 real second = 60 game seconds (1 minute)
    maxGuestsAtStart: 3,
    maxRoomsAtStart: 2,
    currencyName: 'Gold',
    autosaveInterval: 5 // minutes
};
