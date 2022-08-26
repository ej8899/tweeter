//
// TWEETER javascript files
//
//  composer-char-counter.js - deal with JS in the input form
//

//
//  global vars
//
const maxTweetChars = 140;      // maximum characters allowed for 'tweets'.
const errorSlideDownSpeed = 500;    // slider DOWN speed for error drop downs
const errorSlideUpSpeed = 100;  // slider UP speed for error drop downs

//
// restartAnimation(element ID or Class)
// reset CSS animation
// example: resetAnimation("#submitbutton");   or resetAnimation(".formfields");  ** UNTESTED on classes!
// after calling this function, add your class back on the element to restart animation.
// reference: https://www.kirupa.com/animations/restarting_css_animations.htm - video at 08:10 has explanation
//
const restartAnimation = (element) => {
  let animatedElement = document.querySelector(element);
  animatedElement.style.animationName = "none";
  requestAnimationFrame(() => {           // http://www.javascriptkit.com/javatutors/requestanimationframe.shtml
    setTimeout(() => {
      animatedElement.style.animationName = "";
    }, 0);
  });
};

//
// randomNumer(5,98);
// return a random number between min and max supplied values
// from library at http://www.github.com/ej8899/conColors/
//
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min)) + min;

//
//  fetchDadJoke() as a random tweet generator
//  uses API at icanhazdadjoke.com
//
const fetchDadJoke = function() {
  const apiEndPoint = "https://icanhazdadjoke.com/";

  let jqXHR = $.ajax({
    async: false,                                           // CAUTION: not the ideal method being used here!  figure out ASYNC!
    url: apiEndPoint,
    beforeSend: function(xhr) {
      xhr.setRequestHeader("User-Agent","https://github.com/ej8899/tweeter"); // TODO - this does NOT work - find out how to fix it!!
    },
    contentType: "application/json",
    dataType: 'json',
    // NOTE use different than below commented section when using async false - see jqXHR object for details
    // success: function(data) { alert(data.joke); return (data.joke); },
  });
  let response = JSON.parse(jqXHR.responseText);            // REFERENCE: https://www.sitepoint.com/jqxhr-object/
  return (response.joke);
};


//
// decrement counter on tweeter input
// swap class to 'toomanychars' (which changes to red) & reverse if ok
//
$(document).ready(function() {
  $("#tweet-text").on("input", function() {                       // update character counter in tweet form
    
    const inputChar = $(this).val().length;
    const charCounter = maxTweetChars - inputChar;
    const $inputCounter = $(this).parent().find(".counter");

    $inputCounter.text(charCounter);
    if (charCounter < 0) {
      $inputCounter.addClass("toomanychars");
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is too long!");
      $("#error-block").slideDown(errorSlideDownSpeed);
    } else {
      $inputCounter.removeClass("toomanychars");
      $("#error-block").slideUp(errorSlideUpSpeed);
      $("#tweet-text").css("outline","none");
    }
  });

  //
  // user wants a dad joke
  //
  $("#dadjoke").click(function() {
    let theJoke = fetchDadJoke();
    if (theJoke.length > maxTweetChars) {                         // TODO: any errors we should check for?
      theJoke = "No jokes available right now.";
    }
    
    $('#tweet-text').val(theJoke);
    $("#error-block").hide();
    $("#tweet-text").css("outline","none");
    $("#submit").addClass("shake");
    restartAnimation("#submit");
  });

  //
  // user wants something else random
  //
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
    $("#error-block").hide();
    $("#tweet-text").css("outline","none");
    $("#submit").addClass("shake");                 // css animation is a bit finiky to reset it
    restartAnimation("#submit");
  });
}); // END DOCUMENT READY



