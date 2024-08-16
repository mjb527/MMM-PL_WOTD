# PL-WordOfTheDay

Author: mjb527

![Example of Result](/img/Word-of-the-Day-Example.png)

## Description

Polish can be difficulty to learn, so I created this [Magic Mirror](https://github.com/MichMich/MagicMirror) module that scrapes a Polish Word of the Day from [https://www.polishpod101.com/polish-phrases/](https://www.polishpod101.com/polish-phrases/). It formats the Polish word and sentences, and their English translations, creating a result like the one above, and displays it in the document.

Includes:
1. The word of the day
2. The translation of the word
3. The part of speech (noun, verb, etc.)
4. Examples of how to use it in a sentence, plus the English translation

## Config

There's really no config required for this module. Just include the module name and the
position. Example:

```
{
    module: 'MMM-PL_WOTD',
    position: 'bottom_right'
}
```


## Technologies

* JavaScript
* Node.js - including Node Helper, Cheerio, and Request-Promise-Native

![Polish Eagle](/img/polish-eagle.png)
