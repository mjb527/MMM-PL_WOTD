const NodeHelper = require("node_helper");
// get necessary packages to webscrape with
const rp = require("request-promise-native");
const cheerio = require("cheerio");

module.exports = NodeHelper.create({

  socketNotificationReceived: async function(notification) {
    const _this = this;

    if(notification === "GET_WORD") {
      const data = await _this.getData();
      setTimeout(function() {
        _this.sendSocketNotification("GOT_WORD", data );
      }, 3000);
    }

    else return;
  },

  formatText: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  // get and format data
  getData: async function() {

    return new Promise( async (resolve, reject) => {

      const _this = this;

      // config the packages
      const options = {
        uri: "https://www.polishpod101.com/polish-phrases/",
        transform: function (body) {
          return cheerio.load(body);
        },
        resolveWithFullResponse: true
      };

      const wotd_data = {};

      rp(options)
      .then( async function (data) {
        return new Promise( async (ressolve, reject) => {
          data = await _this.processData(data);
          resolve(data)
        })
      })
      .catch(function (err) {
        // set the word to an error message if something has gone wrong
        // set the rest to null to avoid any `undefined` issues later

        reject({"word": "ERROR",
        "translation": err,
        "partOfSpeech": "",
        "examples": []
      });

    });

  });
},

processData: async function(data) {

  return new Promise( (resolve, reject) => {

    const _this = this;
    const wotd_data = {}

    const $ = cheerio.load(data._root.children[1].children);
    // rows of Polish and English translation
    const pRows = $(".r101-wotd-widget__word");
    const eRows = $(".r101-wotd-widget__english");

    const word = _this.formatText(pRows[0].children[0].data);
    const translation = _this.formatText(eRows[0].children[0].data);
    const partOfSpeech = _this.formatText($(".r101-wotd-widget__class").text().trim());

    const examples = [];

    // iterate through each example sentence or phrase
    for(let i = 1; i < pRows.length; i++) {
      // get the text, capitalize first letter
      let polish = _this.formatText(pRows[i].children[0].data);
      let english = _this.formatText(eRows[i].children[0].data)

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
    resolve(wotd_data);


  });

}
});
