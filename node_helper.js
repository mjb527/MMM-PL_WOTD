const NodeHelper = require("node_helper");
module.exports = NodeHelper.create({

  // this.sendSocketNotification('SET_CONFIG', this.config);
  socketNotificationReceived: function(notification) {
    if(notification === "GET_WORD")
      this.sendSocketNotification("GOT_WORD", this.getData() );
    else return;
  },

  // get and format data
  getData: function() {
    const _this = this;

    // get necessary packages to webscrape with
    const rp = require("request-promise");
    const cheerio = require("cheerio");

    // config the packages
    const options = {
      uri: "https://www.polishpod101.com/polish-phrases/",
      transform: function (body) {
        return cheerio.load(body);
      }
    };

    const wotd_data = {};

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

        // iterate through each example sentence or phrase
        for(let i = 1; i < pRows.length; i++) {
          // get the text, capitalize first letter
          let polish = formatText(pRows[i].children[0].data);
          let english = formatText(eRows[i].children[0].data)

          // push each example to the array
          examples.push({"polish" : polish,
            "english" : english});
        }

        // in 2 parts to keep incomplete data from being saved to obj
        wotd_data.word = word;
        wotd_data.translation = translation;
        wotd_data.partOfSpeech = partOfSpeech;
        wotd_data.examples = examples;

        // send back data
        return wotd_data;

      })
      .catch(function (err) {
        Log.log(err);
        // set the word to an error message if something has gone wrong
        // set the rest to null to avoid any `undefined` issues later
        return {"word": "ERROR",
                "translation": "Error getting word of the day",
                "partOfSpeech": "",
                "examples": []
        };
      });
  }

});
