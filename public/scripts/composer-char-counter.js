//
// decrement counter on tweeter input
// swap class to 'toomanychars' (which changes to red) & reverse if ok
//
$(document).ready(function() {
  $("#tweet-text").on("input", function() {
    const maxChar = 140;
    const inputChar = $(this).val().length;
    const charCounter = maxChar - inputChar;

    const $inputCounter = $(this).parent().find(".counter");

    $inputCounter.text(charCounter);
    if (charCounter < 0) {
      $inputCounter.addClass("toomanychars");
    } else {
      $inputCounter.removeClass("toomanychars");
    }
  });
});