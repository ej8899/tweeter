/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

//
// global variables
//
let numTotalUnreadTweets = 0;


//
//  escape() - escape and bad text for cross-site-scripting
//  https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m04w9/activities/629?journey_step=49&workbook=19
//
const escapeText = function (str) {
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
};


//
// renderTweets
//
const renderTweets = (tweets) => {
  numTotalUnreadTweets = 0;
  for (let x = 0; x < tweets.length; x ++) {
    const tweet = createTweetElement(tweets[x]);
    $('#tweets-container').prepend(tweet);          // TODO lets see how data is saved - this may need to be append like stated
    numTotalUnreadTweets ++;
  }
};

//
//  createTweetElement
//  take tweet object and return HTML <article>
//
const createTweetElement = (tweetData) => {
  // timeago.format(1473245023718);                 // using timeago library - see index.html for SCRIPT link
  let timeStamp = timeago.format(tweetData.created_at);
  let escapeTextElement = escapeText(tweetData.content.text);
  let tweetContainer = `        <article class="tweets-layout">
                                <div class="tweets-header">
                                  <div><IMG SRC="${tweetData.user.avatars}"> ${tweetData.user.name}</div>
                                  <div>${tweetData.user.handle}</div>
                                </div>
                                <div class="tweets-message">${escapeTextElement}</div>
                                <footer class="tweets-footer">
                                  <div>${timeStamp}</div> 
                                  <div>
                                    <i class="fa-solid fa-flag icon tooltip"><span class="tooltiptext">file a complaint</span></i>&nbsp;<i class="fa-solid fa-retweet icon tooltip"><span class="tooltiptext">re-tweeter this</span></i>&nbsp;<i class="fa-solid fa-heart icon tooltip"><span class="tooltiptext">like this</span></i>
                                  </div>
                                </footer>
                                </article>
                                <br clear="all">`;
  return tweetContainer;
};

//
//  get tweets from 'server' & render to page
//
const loadTweets = () => {
  $.get("/tweets/", function(tweetData) {                 // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
    renderTweets(tweetData);
    $('#badge').html(Math.floor(numTotalUnreadTweets));   // update tweet count badge
  });
};



//
// document.ready HANDLER
//
$(document).ready(function() {
  
  // keep any error block closed
  $("#error-block").hide();

  //
  // process form submission
  //
  $("#new-tweet-form").submit(function(event) {
    const maxTweetChars = 140;
    event.preventDefault();

    // error check submission
    $("#error-block").slideUp(100);
    let tweetMessage = $(this).find('#tweet-text').val().trim();
    $(this).find("#tweet-text").val(tweetMessage);
    const tweetLength = tweetMessage.length;
    
    if ((maxTweetChars - tweetLength) < 0) {              // error check for tweet TOO LONG
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is too long!");
      $("#error-block").slideDown(300);
      $("#tweet-text").css("outline","2px solid red");
    } else if (tweetLength === 0) {                       // error check for tweet EMPTY
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is missing!");
      $("#error-block").slideDown(300);
      
      $("#tweet-text").css("outline","2px solid red");
      
    } else {                                              // error checks all good, allow post to submit
      const newTweet = $(this).serialize();
      $.post("/tweets/", newTweet, () => {                // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
        $(this).find("#tweet-text").val("");              // clear tweet form
        $(this).find(".counter").val(maxTweetChars);      // reset character counter to max
        loadTweets();
      });
    }
  });

  //
  // render our page of all tweets in database
  //
  loadTweets();
  
  //
  // monitor scrolling so we can update for unread tweets
  //
  $(window).scroll(function() {
    
    let docHeight = $(document).height();
    let scrollPos = $(window).scrollTop();
    let windowHeight = $(window).height();
    let scrollPerTweet = (docHeight - 400) / numTotalUnreadTweets;

    let remainingTweets = (docHeight - windowHeight - scrollPos) / scrollPerTweet;

    // update badge for unread tweets
    $('#badge').html(Math.floor(remainingTweets));
  });

}); // end of document.ready