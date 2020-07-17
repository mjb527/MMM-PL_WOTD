/* global Module */

/* Magic Mirror
 * Module: MMM-PL_WOTD
 *
 * By mjb527
 */

Module.register("MMM-PL_WOTD", {
	defaults: {
		updateInterval: 24 * 60 * 60 * 1000, // update once per day
		retryDelay: 5 * 1000, // number of seconds in milliseconds
		wotd: null // set null to start
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		Log.log("Starting module " + this.name);

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.getData();
		}, this.config.updateInterval);
	},

	// get the word data from node helper
	getData: function() {
		this.sendSocketNotification("GET_WORD");
	},

	// received notificaiton from node_helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "GOT_WORD") {
			// set the word of the day to the payload
			this.config.wotd = payload;
			if(this.config.wotd.name === "ERROR") {
				setInterval(function() {
					this.getData()
				}, this.config.retryDelay);

			}
			else {
				this.updateDom();
			}
		}
	},

	// set the dom
	getDom: function() {

		// create element wrapper for show into the module
		const wrapper = document.createElement("div");
		// If this.dataRequest is not empty
		if (this.wotd) {
			wrapper = document.createElement("div");

			const title = document.createElement("h4");
			const translation = document.createElement("h6");
			const partOfSpeech = document.createElement("h6");
			const examples = document.createElement("ul");

			wrapper.append(title);
			wrapper.append(translation);
			wrapper.append(partOfSpeech);
			wrapper.append(examples);

			title.innerHTML = this.wotd.word;
			translation.innerHTML = this.wotd.translation;
			partOfSpeech.innerHTML = this.wotd.partOfSpeech;

			this.wotd.examples.forEach(example => {
				const li = createElement("li");
				li.innerHTML = example;
				examples.appendChild(li);
			});

		}

		return wrapper;
	},

	getStyles: function () {
		return [
			"MMM-PL_WOTD.css",
		];
	},


});
