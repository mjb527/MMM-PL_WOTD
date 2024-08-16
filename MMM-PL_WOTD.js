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
		const _this = this;
		Log.log("Starting module " + this.name);

		// Schedule update timer.
		_this.getData();
		setInterval(function() {
			_this.getData();
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

	getStyles: function () {
		return [
			this.file("MMM-PL_WOTD.css"),
		];
	},

	// set the dom
	getDom: function() {

		// create element wrapper for show into the module
		const wrapper = document.createElement("div");
		// If this.dataRequest is not empty
		if (this.config.wotd) {

			const title = document.createElement("div");
			const partOfSpeech = document.createElement("div");
			const examples = document.createElement("ul");

			// long text may interfere with other modules, keep it nice and small here
            wrapper.setAttribute('style', 'max-width: 40vw;');


			title.setAttribute('style', 'margin: 1%; padding: 0; font-size: x-large; line-height: 100%;');
			partOfSpeech.setAttribute('style', 'margin: 1%; padding: 0; font-size: medium; line-height: 100%;');
			examples.setAttribute('style', 'margin: 0; padding: 0; line-height: 100%;');

			wrapper.appendChild(title);
			wrapper.appendChild(partOfSpeech);
			wrapper.appendChild(examples);

			title.innerHTML = this.config.wotd.word + " - " + this.config.wotd.translation;
			partOfSpeech.innerHTML = this.config.wotd.partOfSpeech;

			this.config.wotd.examples.forEach(example => {
				const li = document.createElement("li");
				li.setAttribute('style', 'margin: 1%; padding: 0; font-size: medium; list-style-type: none; line-height: 100%;');
				li.innerHTML = example.polish + " - " + example.english;
				examples.appendChild(li);
			});

		}

		return wrapper;
	},



});
