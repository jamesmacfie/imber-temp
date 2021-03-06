'use strict';

/* Helper functions for the historyItem template */

// All the different display details for a history item, available by key
var statusDetails = {
	stop: {
		title: 'Turned Off',
		description: 'was turned off',
		iconTemplate: 'iconStop',
		iconType: 'default'
	},
	start: {
		title: 'Turned On',
		description: 'was turned on',
		iconTemplate: 'iconStart',
		iconType: 'default'
	},
	pause: {
		title: 'Paused',
		description: 'was paused',
		iconTemplate: 'iconPause',
		iconType: 'default'
	},
	resume: {
		title: 'Resumed',
		description: 'was resumed',
		iconTemplate: 'iconStart',
		iconType: 'default'
	},
	timerOn: {
		title: 'Turned On',
		description: 'turned on',
		iconTemplate: 'iconStart',
		iconType: 'default'
	},
	timerOff: {
		title: 'Turned Off',
		description: 'turned off',
		iconTemplate: 'iconStop',
		iconType: 'default'
	},
	reset: {
		title: 'Reset',
		description: 'reset',
		iconTemplate: 'iconReset',
		iconType: 'default'
	}
};

Template.historyItem.helpers(
	{
		/*
		 * Returns the display details for a history record's action
		 *
		 * @returns {object} An object of strings for use in display informative info to the user
		 */
		statusDetails: function() {
			var detail = statusDetails[this.action];

			if (!detail) {
				// Somehow the action we have for this record wasn't in our object.
				return {
					title: 'Error',
					description: 'did this one weird trick',
					iconTemplate: 'iconError',
					iconType: 'default'
				};
			}

			return detail;
		},

		/*
		* Returns a human readable string abot how long ago an action happened
		*
		* @returns {string} How long ago the event happened
		*/
		timeAgo: function() {
			var then = new moment(this.timeStamp),
				now = new moment(Date.now());

			return then.from(now);
		},

	}
);
