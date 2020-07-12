/* global Module */

/* Magic Mirror
 * Module: MMM-PL_WOTD
 *
 * By mjb527
 */

Module.register("MM-PL_WOTD", {
	defaults: {
		updateInterval: 24 * 60 * 60 * 1000, // update once per day
		retryDelay: 5000,
		wotd: null
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		Log.log("Starting module " + this.name);

		var self = this;

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		const rp = require("request-promise");
		const cheerio = require("cheerio");

		// config the packages
		const options = {
			uri: "https://www.polishpod101.com/polish-phrases/",
			transform: function (body) {
				return cheerio.load(body);
			}
		};

		const wotdData = {};

		rp(options)
			.then(function (data) {
				const $ = cheerio.load(data._root.children[1].children);

				// rows of Polish and English translation
				const pRows = $(".r101-wotd-widget__word");
				const eRows = $(".r101-wotd-widget__english");

				const word = formatText(pRows[0].children[0].data);
				const translation = formatText(eRows[0].children[0].data);
				const partOfSpeech = formatText($(".r101-wotd-widget__class").text().trim());

				const examples = [];

				console.log(`${word} - ${translation} - ${partOfSpeech}`);

				for(let i = 1; i < pRows.length; i++) {
				// get the text, capitalize first letter
					let polish = formatText(pRows[i].children[0].data);
					let english = formatText(eRows[i].children[0].data)

					examples.push({"polish" : polish,
						"english" : english});
					console.log(examples[i-1].polish + " - " + examples[i-1].english);
				}

				// in 2 parts to keep incomplete data from being saved to obj
				wotd_data.word = word;
				wotd_data.translation = translation;
				wotd_data.partOfSpeech = partOfSpeech;
				wotd_data.examples = examples;

				// save data
				this.wotdData = wotdData;

			})
			.catch(function (err) {
				Log.log(err);
				// TODO write error to page instead of the word of the day stuff
				wotd = {"word": "Error getting word of the day"};
			});
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		// create element wrapper for show into the module
		var wrapper = document.createElement("div");
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


		// Data from helper
		// if (this.dataNotification) {
		// 	var wrapperDataNotification = document.createElement("div");
		// 	// translations  + datanotification
		// 	wrapperDataNotification.innerHTML =  this.translate("UPDATE") + ": " + this.dataNotification.date;
		//
		// 	wrapper.appendChild(wrapperDataNotification);
		// }
	},

	// getScripts: function() {
	// 	return [];
	// },

	getStyles: function () {
		return [
			"MMM-PL_WOTD.css",
		];
	},

	// Load translations files
	// getTranslations: function() {
	// 	//FIXME: This can be load a one file javascript definition
	// 	return {
	// 		en: "translations/en.json",
	// 		es: "translations/es.json"
	// 	};
	// },

	// processData: function(data) {
	// 	var self = this;
	// 	this.dataRequest = data;
	// 	if (this.loaded === false) { self.updateDom(self.config.animationSpeed) ; }
	// 	this.loaded = true;
	//
	// 	// the data if load
	// 	// send notification to helper
	// 	this.sendSocketNotification("{{MODULE_NAME}}-NOTIFICATION_TEST", data);
	// },

	// socketNotificationReceived from helper
	// socketNotificationReceived: function (notification, payload) {
	// 	if(notification === "{{MODULE_NAME}}-NOTIFICATION_TEST") {
	// 		// set dataNotification
	// 		this.dataNotification = payload;
	// 		this.updateDom();
	// 	}
	// },
});
