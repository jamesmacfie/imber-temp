'use strict';

/* Helper functions for the sprinklerItem template */
Template.sprinklerItem.helpers(
	{
		/*
		 * How much time is remaining for an active sprinkler? We store the duration and
		 * currentTimer state in the record but rely on the template to show the correct
		 * display value in a human readable form.
		 *
		 * @returns {string} How much time is remaining for the active sprinkler
		 */
		remainingTime: function() {
			var remainingTime = (this.timer.duration - this.currentTimer) / 60;
			if (remainingTime > 1) {
				return Math.floor(remainingTime) + ' minutes';
			} else {
				return remainingTime * 60 + ' seconds';
			}
		},

		/*
		 * Is this sprinkler either active or paused? Determines whether or not to show
		 * the remaining time on the view.
		 *
		 * @returns {boolean} Whether this sprinkler is active or paused (duh)
		 */
		isActiveOrPaused: function() {
			return this.status === 'active' ||
				this.status === 'paused';
		},

		/*
		 * What icon should be shown for this sprinkler. Is is active or not?
		 *
		 * @returns {string} The name of the icon template
		 */
		timerIcon: function() {
			return this.timer.active ? 'iconTimerOn' : 'iconTimerOff';
		},

		/*
		 * Whether the timer is currently active or not
		 *
		 * @returns {boolean} Is the sprinkler's timer active?
		 */
		timerActive: function() {
			return this.timer.active;
		},

		/*
		 * Returns an human readable string about what a sprinkler's timer schedule
		 * is
		 *
		 * @returns {string} The sprinkler's schedule
		 */
		timerSchedule: function() {

			/*
			 * How much time is remaining for an active sprinkler in minutes?
			 *
			 * @params {number} [duration] The duration of the sprinkler in seconds
			 *
			 * @returns {number} The duration of the sprinkler in minutes
			 */
			function displayDuration(duration) {
				try {
					return Math.round(duration / 60);
				} catch (e) {
					// Something went wrong. Just return zero
					return 0;
				}
			}

			/*
			 * Returns a human readable string summarises how many days between activation
			 * this sprinkler is scheduled to run.
			 *
			 * @params {number} [days] The numner of days the sprinkler is scheduled to run
			 *
			 * @returns {string} The summary of the scheduled days
			 */
			function getDayText(day) {
				if (day ===1) {
					return 'day';
				} else if (day === 2) {
					return 'couple of days';
				} else if (day === 4) {
					return 'few days';
				} else if (day === 14) {
					return 'couple of weeks';
				}

				return day + ' days';
			}

			var timer = this.timer,
				duration = displayDuration(timer.duration),
				// Random day, set time. Don't care about the actual date at this point, we just want
				// to use moment for it's helper functions.
				timeMoment = new moment('2014/01/01 ' + timer.time);

			if (!timer.active) {
				return 'This sprinkler is not scheduled to run automatically';
			}

			return ['Scheduled to turn on every', getDayText(timer.days), 'at', timeMoment.format('LT'), 'for', duration, duration > 1 ? 'minutes': 'minute'].join(' ');

		}
	}
);

/* Event listeners for the sprinklerItem template */
Template.sprinklerItem.events = {
	/*
	 * Begin the sprinkler and set it's state as active.
	 *
	 * Not only do we set the particular sprinkler as active, but we also set the currently
	 * active sprinkler to be inactive. Currently assumes that there is only one active sprinkler
	 * at any point (which there should be...)
	 */
	'click .js-startSprinkler': function() {
		var activeSprinkler = Sprinklers.activeSprinkler();

		if (activeSprinkler) {
			// We have an active sprinkler. Set it as inactive.
			Sprinklers.update(activeSprinkler._id, {
				$set: {
					status: 'inactive',
					currentTimer: 0
				}
			});
		}

		Sprinklers.update(this._id, {
			$set: {
				status: 'active'
			}
		});

		// Create a history record for this event
		History.insert({
			sprinklerName: this.name,
			action: 'start',
			timeStamp: new Date()
		});
	},

	/*
	 * Resumes the current sprinkler.
	 *
	 * It is assumed that on the view the sprinkler that has this js hook avaliable
	 * has a state of paused.
	 */
	'click .js-resumeSprinkler': function() {
		Sprinklers.update(this._id, {
			$set: {
				status: 'active'
			}
		});

		// Create a history record for this event
		History.insert({
			sprinklerName: this.name,
			action: 'resume',
			timeStamp: new Date()
		});
	},

	/*
	 * Pauses the current active sprinkler.
	 *
	 * It is assumed that on the view the sprinkler that has this js hook avaliable
	 * has a state of active.
	 */
	'click .js-pauseSprinkler': function() {
		Sprinklers.update(this._id, {
			$set: {
				status: 'paused'
			}
		});

		// Create a history record for this event
		History.insert({
			sprinklerName: this.name,
			action: 'pause',
			timeStamp: new Date()
		});
	},

	/*
	 * Stops the current active or paused sprinkler.
	 */
	'click .js-stopSprinkler': function() {
		Sprinklers.update(this._id, {
			$set: {
				status: 'inactive',
				currentTimer: 0
			}
		});

		// Create a history record for this event
		History.insert({
			sprinklerName: this.name,
			action: 'stop',
			timeStamp: new Date()
		});
	},

	/*
	 * Resets any active sprinkler's timer back to zero
	 */
	'click .js-resetSprinkler': function() {
		Sprinklers.update(this._id, {
			$set: {
				currentTimer: 0
			}
		});

		// Create a history record for this event
		History.insert({
			sprinklerName: this.name,
			action: 'reset',
			timeStamp: new Date()
		});
	},

	/*
	 * Sets a sprinkler to use or not use the scheduler
	 */
	'click .js-toggleTimer': function() {
		Sprinklers.update(this._id, {
			$set: {
				'timer.active': !this.timer.active
			}
		});
	}
};
