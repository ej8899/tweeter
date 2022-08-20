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
// renderTweets
//
const renderTweets = (tweets) => {
  // loop thru data to build ea tweet then post it
  // alert(JSON.stringify(tweets));
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
  let tweetContainer = `        <article class="tweets-layout">`;
  tweetContainer += `        <div class="tweets-header">`;
  tweetContainer += `          <div><IMG SRC="${tweetData.user.avatars}"> ${tweetData.user.name}</div>`;
  tweetContainer += `          <div>${tweetData.user.handle}</div>`;
  tweetContainer += `         </div>`;
  tweetContainer += `      <div class="tweets-message">${tweetData.content.text}</div>`;
  tweetContainer += `      <footer class="tweets-footer">`;
  tweetContainer += `      <div>${timeStamp}</div> `;
  tweetContainer += `      <div>`;
  tweetContainer += `        <i class="fa-solid fa-flag icon tooltip"><span class="tooltiptext">file a complaint</span></i>&nbsp;<i class="fa-solid fa-retweet icon tooltip"><span class="tooltiptext">re-tweeter this</span></i>&nbsp;<i class="fa-solid fa-heart icon tooltip"><span class="tooltiptext">like this</span></i>`;
  tweetContainer += `      </div>`;
  tweetContainer += `      </footer>`;
  tweetContainer += `      </article>`;
  tweetContainer += `    <br clear="all">`;
  return tweetContainer;
};


const loadTweets = () => {
  $.get("/tweets/", function(tweetData) {          // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
    renderTweets(tweetData);
    $('#badge').html(Math.floor(numTotalUnreadTweets));
  });
};


  
$(document).ready(function() {
  
  // process form submission
  $("#new-tweet-form").submit(function(event) {
    const maxTweetChars = 140;
    event.preventDefault();

    // error check submission
    const tweetLength = $(this).find('#tweet-text').val().length;
    if ((maxTweetChars - tweetLength) < 0) {
      alert("too long");
    } else if (tweetLength === 0) {
      alert("no message");
    } else {                                              // error checks all good, allow post to submit
      const newTweet = $(this).serialize();
      $.post("/tweets/", newTweet, () => {                // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
        $(this).find("#tweet-text").val("");              // clear tweet form
        $(this).find(".counter").val(maxTweetChars);      // reset character counter to max
        loadTweets();
      });
    }
  });

  // render our page of all tweets in database
  loadTweets();
  

  // monitor scrolling so we can update for unread tweets
  
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