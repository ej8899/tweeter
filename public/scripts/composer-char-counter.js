//
// TWEETER javascript files
//
//  composer-char-counter.js - deal with JS in the input form
//



//
// randomNumer(5,98);
// return a random number between min and max supplied values
// from library at http://www.github.com/ej8899/conColors/
//
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;



//
// decrement counter on tweeter input
// swap class to 'toomanychars' (which changes to red) & reverse if ok
//
$(document).ready(function() {
  $("#tweet-text").on("input", function() {                       // update character counter in tweet form
    const maxChar = 140;
    const inputChar = $(this).val().length;
    const charCounter = maxChar - inputChar;

    const $inputCounter = $(this).parent().find(".counter");

    $inputCounter.text(charCounter);
    if (charCounter < 0) {
      $inputCounter.addClass("toomanychars");
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is too long!");
      $("#error-block").slideDown(300);
    } else {
      $inputCounter.removeClass("toomanychars");
      $("#error-block").slideUp(100);
      $("#tweet-text").css("outline","none");
    }
  });

  $("#randomizer").click(function() {                             // random tweet posts if user desires
    let randomQuotes = [
      "The quick brown fox jumps over the lazy dog.",
      "Die with memories, not dreams.",
      "Everything you can imagine is real.",
      "Simplicity is the ultimate sophistication.",
      "How do you keep a fool in suspense?",
      "What do you call a magic dog? A labracadabrador.",
      "Lorem Ipsum has roots in a piece of classical Latin literature from 45 BC?",
      "Aliens exist.  Change my mind.",
      "The quick brown fox does what?",
      "I went to buy some camo pants but couldn't find any.",
      "I used to have a handle on life, but then it broke.",
      "I used to think I was indecisive. But now I'm not so sure.",
      "A termite walks into the bar and asks, 'Is the bar tender here?'",
      " I don't suffer from insanity—I enjoy every minute of it.",
      "People who take care of chickens are literally chicken tenders.",
      "Despite the high cost of living, it remains popular.",
      "A blind man walked into a bar… and a table… and a chair…"
    ];
    let rando = randomNumber(0,randomQuotes.length);
    
    $('#tweet-text').val(randomQuotes[rando]);
  });
});