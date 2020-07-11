Module.register('MMM-PL_WOTD', {

  defaults: {
    loaded: false,
    horizontal: false,
    wotd: {}

  }

  start: function() {
    Log.log('Starting PL_WOTD');

    // make initial request
    this.getWord();

  },

  // return word of the day data
  getWord: function() {

    // requests/webscraping
    const rp = require('request-promise');
    const cheerio = require('cheerio');

    // config the packages
    const options = {
      uri: `https://www.polishpod101.com/polish-phrases/`,
      transform: function (body) {
        return cheerio.load(body);
      }
    };

    const wotd_data = {};

    rp(options)
    .then(function (data) {
      const $ = cheerio.load(data._root.children[1].children);

      // rows of Polish and English translation
      const pRows = $('.r101-wotd-widget__word');
      const eRows = $('.r101-wotd-widget__english');

      const word = formatText(pRows[0].children[0].data);
      const translation = formatText(eRows[0].children[0].data);
      const partOfSpeech = formatText($('.r101-wotd-widget__class').text().trim());

      const examples = [];

      console.log(`${word} - ${translation} - ${partOfSpeech}`);

      for(let i = 1; i < pRows.length; i++) {
        // get the text, capitalize first letter
        let polish = formatText(pRows[i].children[0].data);
        let english = formatText(eRows[i].children[0].data)

        examples.push({"polish" : polish,
        "english" : english});
        console.log(examples[i-1].polish + ' - ' + examples[i-1].english);
      }

      // in 2 parts to keep incomplete data from being saved to obj
      wotd_data.word = word;
      wotd_data.translation = translation;
      wotd_data.partOfSpeech = partOfSpeech;
      wotd_data.examples = examples;

      // save data
      this.wotd = wotd_data;

    })
    .catch(function (err) {
      Log.log(err);
      // TODO write error to page instead of the word of the day stuff
      wotd = {'word': 'Error getting word of the day'};
      // REQUEST FAILED: ERROR OF SOME KIND
    });

    // we have data
    this.loaded = true;

  },

  display: function() {
    let wrapper = null;

    // check if we have data
    if(this.loaded) {

      wrapper = document.createElement('div');

      const title = document.createElement('h4');
      const translation = document.createElement('h6');
      const partOfSpeech = document.createElement('h6');
      const examples = document.createElement('ul');

      wrapper.append(title);
      wrapper.append(translation);
      wrapper.append(partOfSpeech);
      wrapper.append(examples);

      title.innerHTML = this.wotd.word;
      translation.innerHTML = this.wotd.translation;
      partOfSpeech.innerHTML = this.wotd.partOfSpeech;

      this.wotd.examples.forEach(example => {
        const li = createElement('li');
        li.innerHTML = example;
        examples.appendChild(li);
      });

    }

    return wrapper;
  }

});
