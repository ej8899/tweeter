/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */


//
// global variables
//
let numTotalUnreadTweets = 0, inputFormState = 0, tweetsOnDisplay = 0, tweetsPerLoad = 10, totalTweetsRemaining = 0;


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
  let extraClass = "";
  numTotalUnreadTweets = tweets.length;
  tweetsOnDisplay = numTotalUnreadTweets - tweetsPerLoad;
  for (let x = 0; x < tweets.length; x ++) {
    if (x < (tweets.length - tweetsPerLoad)) { extraClass = "hide"; } else { extraClass = ""; }
    const tweet = createTweetElement(tweets[x],extraClass,x);
    $('#tweets-container').prepend(tweet);
  }
  totalTweetsRemaining = tweets.length - tweetsPerLoad;
  $("#more").attr("data-badge",(totalTweetsRemaining));
};


//
//  createTweetElement
//  take tweet object and return HTML <article>
//
const createTweetElement = (tweetData,extraClass,id) => {
  // timeago.format(1473245023718);                 // using timeago library - see index.html for SCRIPT link
  let timeStamp = timeago.format(tweetData.created_at);
  let escapeTextElement = escapeText(tweetData.content.text);
  let tweetContainer = `        <article class="tweets-layout ${extraClass}" id="id-${id}">
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
                                </article>`;
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
// toggleTweetForm() - open or close the form
// - if passing "true", we'll override where the form sits now and just open it.
//
const toggleTweetForm = (forceOpen) => {
  const slideSpeed = 300;
  if (forceOpen === true) {                             // ! we can also: if ($("#newtweetform").is(":visible") == true) {}
    inputFormState = 0;                                // 0 closed, 1 open
  }
  if (inputFormState === 0) {
    $("#newtweetform").slideDown(slideSpeed);          // open input form
    $("#tweet-text").focus();                          // give form input FOCUS
    inputFormState = 1;
  } else {
    inputFormState = 0;
    $("#newtweetform").slideUp(slideSpeed);            // close input form
  }
};  
// ! QUESTION: BEST PRACTICE - should we have these class names all assigned into (global) variables
// ! for reference instead of 'hard coding' them?  


//
// process FLAGS on each tweet 
//
$(document).on("click", ".fa-flag", function(event){
  const $aFlag = $(this).parent().find(".fa-flag");
  event.stopPropagation();                              // ! QUESTION is stopPropagation to be used here?
  if ($aFlag.hasClass("redflag")) {
    $aFlag.removeClass("redflag");
    $(this).parent().parent().parent().removeClass("redborder");  // ! QUESTION: what is best/better practice? this line or next?
    $(this).closest('.tweets-layout').children('.tweets-message').removeClass("blurredtext");
  } else {
    $aFlag.addClass("redflag");
    // let $mainTweet = $(this).parents().hasClass('tweets-layout');      // NOTE: parents (PLURAL) traverses UP the structure
    // alert($mainTweet);                                                 // shows TRUE since we have a match
    
    $(this).parent().parent().parent().addClass("redborder");
    //$(this).parent().parent().parent().siblings(".tweets-message").addClass("blurredtext");
    $(this).closest('.tweets-layout').children('.tweets-message').addClass("blurredtext");
  }
  // HOW TO continue this process:
  // let's add another class which is unique ID for this message so we can reference it
  // so we have class fa-flag IDxxx (xxx is the unique number)
  // then strip like so: messageId = $(this).attr('class') // then extract the "IDxxx",strip ID and process on the ID #.
  // this ID would then get passed back to sever as reported for algorithm to deal with, or someone to review.
});


//
// process HEARTS on each tweet 
//
$(document).on("click", ".fa-heart", function(){
  const $aFlag = $(this).parent().find(".fa-heart");
  if ($aFlag.hasClass("redflag")) {
    $aFlag.removeClass("redflag");
  } else {
    $aFlag.addClass("redflag");  // also removeClass
  }
});


//
// process RETWEET on each tweet 
//
$(document).on("click", ".fa-retweet", function(){
  const $aFlag = $(this).parent().find(".fa-retweet");

  $aFlag.addClass("redflag");   // might already be set, but that's ok - not removing it as already 'retweeted'
  // get message out of tweets-message class container
  let reTweetMessage = $(this).closest('.tweets-layout').children('.tweets-message').text();
  // slide open tweet form
  toggleTweetForm(true);        // force tweet window open
  // populate it
  $('#tweet-text').val(reTweetMessage);
  // scroll to top (form area)
  document.body.scrollIntoView(true);
});


//
// document.ready HANDLER
//
$(document).ready(function() {
  $("#floater").hide();                               // default to hide our 'floater' icon on page load
  
  $("#newtweetform").hide();                          // default to input form closed
  inputFormState = 0;                                 // 0 closed, 1 open
  
  $("#opentweet").click(function() {                  // allow for click on chevron icon,
    toggleTweetForm();
  });
  $("#opentweet2").click(function() {                 // and the 'write a new tweet' text
    toggleTweetForm();
  });

  // toggle 'flag' for review on tweets
  $(".fa-flag").click(function() {                 // and the 'write a new tweet' text // ! QUEsTION - why doesn't work and flag2 does?
    alert("flag1");
  });

  // process "more" tweets to load
  $("#more").click(function() {
    // see how many tweetsOnDisplay
    // numTotalUnreadTweets
    // remember we have to count backwards
    if (tweetsOnDisplay < 1) {
      $("#more").addClass("hide");
      return;
    }
    for(let x = 1; x < tweetsPerLoad + 1; x ++) {
      // grab ID of numTotalUnreadTweets - tweetsOnDisplay
      // example, 40 total tweets, then tweetsOnDisplay = 30 (first run)
      // so on first click we want tweetsondisplay (id) to unhide with id - x;
      let divId = '#id-' + (tweetsOnDisplay - x);
      $(divId).removeClass("hide");
    }
    totalTweetsRemaining -= tweetsPerLoad;
    tweetsOnDisplay = tweetsOnDisplay - tweetsPerLoad;  // TODO - clean this - am I using it with 'totalTweetsRemaining'?
    $("#more").attr("data-badge",totalTweetsRemaining);
    // UPDATE HTML to show # of tweets remaining: can we put badge on the "more"? 
    // $('#error-block').html -- numTotalUnreadTweets - tweetsOnDisplay

      if (tweetsOnDisplay < 0) {
        $("#more").addClass("hide");
        tweetsOnDisplay = 0;
      }
  });

  // keep any error block closed
  $("#error-block").hide();

  //
  // process form submission
  //
  $("#new-tweet-form").submit(function(event) {
    //const maxTweetChars = 140;
    event.preventDefault();

    // error check submission
    $("#error-block").slideUp(errorSlideUpSpeed);
    let tweetMessage = $(this).find('#tweet-text').val().trim();
    $(this).find("#tweet-text").val(tweetMessage);
    const tweetLength = tweetMessage.length;
    
    if ((maxTweetChars - tweetLength) < 0) {              // error check for tweet TOO LONG
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is too long!");
      $("#error-block").slideDown(errorSlideDownSpeed);
      $("#tweet-text").css("outline","2px solid red");
    } else if (tweetLength === 0) {                       // error check for tweet EMPTY
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is missing!");
      $("#error-block").slideDown(errorSlideDownSpeed);
      
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

    if (scrollPos > 200) {
      // show 'to top' float button
      $("#floater").show();
      $("#writenewlink").hide();
    } else {
      $("#floater").hide();
      $("#writenewlink").show();
    }
  });
}); // end of document.ready