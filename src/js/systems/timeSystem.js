/**
 * Cozy Hearth - Time System
 *
 * This system manages the game's time progression, including day/night cycles and seasons.
 */

export class TimeSystem {
    constructor() {
        // Time constants
        this.MINUTES_PER_HOUR = 60;
        this.HOURS_PER_DAY = 24;
        this.DAYS_PER_SEASON = 30;
        this.SEASONS_PER_YEAR = 4;

        // Time scale (how fast game time passes compared to real time)
        // 1 game day = 24 minutes real time (1 game hour = 1 real minute)
        this.timeScale = 60;

        // Current time values
        this.minute = 0;
        this.hour = 6; // Start at 6 AM
        this.day = 1;
        this.season = 0; // 0: Spring, 1: Summer, 2: Autumn, 3: Winter
        this.year = 1;

        // Time-related flags
        this.isPaused = false;
        this.isDayTime = true;

        // Event tracking
        this.lastHour = this.hour;
        this.lastDay = this.day;
        this.lastSeason = this.season;
    }

    /**
     * Initialize the time system
     * @returns {Promise} A promise that resolves when initialization is complete
     */
    async init() {
        console.log('Initializing time system...');
        return Promise.resolve();
    }

    /**
     * Set the initial time for a new game
     * @param {number} hour - Starting hour (0-23)
     * @param {number} day - Starting day (1-30)
     * @param {number} season - Starting season (0: Spring, 1: Summer, 2: Autumn, 3: Winter)
     * @param {number} year - Starting year
     */
    setInitialTime(hour = 6, day = 1, season = 0, year = 1) {
        // Set initial time values
        this.minute = 0;
        this.hour = hour;
        this.day = day;
        this.season = season;
        this.year = year;

        this.updateDayNightState();

        // Reset event tracking
        this.lastHour = this.hour;
        this.lastDay = this.day;
        this.lastSeason = this.season;

        console.log(`Initial time set to ${this.getTimeString()} on ${this.getDateString()}`);
    }

    /**
     * Update the time system
     * @param {number} deltaTime - Time elapsed since last update in seconds
     */
    update(deltaTime) {
        if (this.isPaused) return;

        // Store previous values for event detection
        this.lastHour = this.hour;
        this.lastDay = this.day;
        this.lastSeason = this.season;

        // Calculate how many game minutes have passed
        const minutesElapsed = (deltaTime * this.timeScale);
        this.advanceTime(minutesElapsed);

        // Check for time-based events
        this.checkTimeEvents();
    }

    /**
     * Advance the game time by a specified number of minutes
     * @param {number} minutes - Number of minutes to advance
     */
    advanceTime(minutes) {
        // Add minutes
        this.minute += minutes;

        // Handle minute overflow
        if (this.minute >= this.MINUTES_PER_HOUR) {
            const hoursToAdd = Math.floor(this.minute / this.MINUTES_PER_HOUR);
            this.minute %= this.MINUTES_PER_HOUR;
            this.hour += hoursToAdd;

            // Handle hour overflow
            if (this.hour >= this.HOURS_PER_DAY) {
                const daysToAdd = Math.floor(this.hour / this.HOURS_PER_DAY);
                this.hour %= this.HOURS_PER_DAY;
                this.day += daysToAdd;

                // Handle day overflow
                if (this.day > this.DAYS_PER_SEASON) {
                    const seasonsToAdd = Math.floor((this.day - 1) / this.DAYS_PER_SEASON);
                    this.day = ((this.day - 1) % this.DAYS_PER_SEASON) + 1;
                    this.season += seasonsToAdd;

                    // Handle season overflow
                    if (this.season >= this.SEASONS_PER_YEAR) {
                        const yearsToAdd = Math.floor(this.season / this.SEASONS_PER_YEAR);
                        this.season %= this.SEASONS_PER_YEAR;
                        this.year += yearsToAdd;
                    }
                }
            }
        }

        // Update day/night state
        this.updateDayNightState();
    }

    /**
     * Update the day/night state based on current hour
     */
    updateDayNightState() {
        // Day is from 6 AM to 8 PM
        this.isDayTime = (this.hour >= 6 && this.hour < 20);
    }

    /**
     * Check for time-based events (hour change, day change, season change)
     */
    checkTimeEvents() {
        // Check for hour change
        if (this.hour !== this.lastHour) {
            this.onHourChange();
        }

        // Check for day change
        if (this.day !== this.lastDay) {
            this.onDayChange();
        }

        // Check for season change
        if (this.season !== this.lastSeason) {
            this.onSeasonChange();
        }
    }

    /**
     * Handle hour change events
     */
    onHourChange() {
        // Check for specific times of day
        if (this.hour === 6) {
            // Morning (6 AM)
            console.log('Morning has arrived');
        } else if (this.hour === 12) {
            // Noon (12 PM)
            console.log('It\'s noon');
        } else if (this.hour === 18) {
            // Evening (6 PM)
            console.log('Evening has arrived');
        } else if (this.hour === 0) {
            // Midnight (12 AM)
            console.log('It\'s midnight');
        }
    }

    /**
     * Handle day change events
     */
    onDayChange() {
        console.log(`Day ${this.day} of ${this.getSeasonName()}, Year ${this.year}`);
    }

    /**
     * Handle season change events
     */
    onSeasonChange() {
        console.log(`The season has changed to ${this.getSeasonName()}`);
    }

    /**
     * Get the current time as a formatted string (HH:MM)
     * @returns {string} Formatted time string
     */
    getTimeString() {
        const hourDisplay = this.hour % 12 === 0 ? 12 : this.hour % 12;
        const ampm = this.hour < 12 ? 'AM' : 'PM';
        const minuteDisplay = this.minute.toString().padStart(2, '0');
        // Format hour to always be 2 digits (e.g., "01" instead of "1")
        const hourDisplayFormatted = hourDisplay.toString().padStart(2, '0');
        return `${hourDisplayFormatted}:${minuteDisplay} ${ampm}`;
    }

    /**
     * Get the name of the current season
     * @returns {string} Season name
     */
    getSeasonName() {
        const seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];
        return seasonNames[this.season];
    }

    /**
     * Get the current date as a formatted string
     * @returns {string} Formatted date string
     */
    getDateString() {
        return `Day ${this.day} of ${this.getSeasonName()}, Year ${this.year}`;
    }

    /**
     * Get information about the current time
     * @returns {Object} Object containing time information
     */
    getCurrentTimeInfo() {
        return {
            minute: this.minute,
            hour: this.hour,
            day: this.day,
            season: this.getSeasonName(),
            year: this.year,
            isDayTime: this.isDayTime,
            timeString: this.getTimeString(),
            dateString: this.getDateString(),
            isDayStart: this.hour === 6 && this.minute < 1,
            isNightStart: this.hour === 20 && this.minute < 1,
            isSeasonStart: this.day === 1 && this.hour === 6 && this.minute < 1
        };
    }

    /**
     * Set the time scale (game time vs real time)
     * @param {number} scale - The new time scale
     */
    setTimeScale(scale) {
        if (scale > 0) {
            this.timeScale = scale;
            console.log(`Time scale set to ${scale}x`);
        }
    }

    /**
     * Pause the time progression
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume the time progression
     */
    resume() {
        this.isPaused = false;
    }

    /**
     * Skip to a specific time of day
     * @param {number} targetHour - The hour to skip to (0-23)
     */
    skipToHour(targetHour) {
        if (targetHour >= 0 && targetHour < this.HOURS_PER_DAY) {
            // If target hour is earlier than current hour, advance to next day
            if (targetHour < this.hour) {
                this.day += 1;

                // Handle day overflow
                if (this.day > this.DAYS_PER_SEASON) {
                    this.day = 1;
                    this.season = (this.season + 1) % this.SEASONS_PER_YEAR;

                    // Handle year change
                    if (this.season === 0) {
                        this.year += 1;
                    }
                }
            }

            this.hour = targetHour;
            this.minute = 0;
            this.updateDayNightState();

            console.log(`Skipped to ${this.getTimeString()}`);
        }
    }

    /**
     * Get the current state of the time system
     * @returns {Object} The current time state
     */
    getState() {
        return {
            minute: this.minute,
            hour: this.hour,
            day: this.day,
            season: this.season,
            year: this.year,
            timeScale: this.timeScale
        };
    }

    /**
     * Load a saved time state
     * @param {Object} state - The time state to load
     */
    loadState(state) {
        if (state) {
            this.minute = state.minute || 0;
            this.hour = state.hour || 6;
            this.day = state.day || 1;
            this.season = state.season || 0;
            this.year = state.year || 1;
            this.timeScale = state.timeScale || 60;

            this.updateDayNightState();

            // Reset event tracking
            this.lastHour = this.hour;
            this.lastDay = this.day;
            this.lastSeason = this.season;

            console.log(`Loaded time: ${this.getTimeString()} on ${this.getDateString()}`);
        }
    }
}
