/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */


//
// renderTweets
//
const renderTweets = (tweets) => {
  // loop thru data to build ea tweet then post it
  // alert(JSON.stringify(tweets));
  for (let x = 0; x < tweets.length; x ++) {
    const tweet = createTweetElement(tweets[x]);
    $('#tweets-container').prepend(tweet);          // TODO lets see how data is saved - this may need to be append like stated
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
  });
};


  
$(document).ready(function() {
  
  // process form submission
  $("#new-tweet-form").submit(function(event) {
    const maxTweetChars = 140;
    event.preventDefault();
    const newTweet = $(this).serialize();
    $.post("/tweets/", newTweet, () => {          // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
      $(this).find("#tweet-text").val("");        // clear tweet form
      $(this).find(".counter").val(maxTweetChars);      // reset character counter to max
      loadTweets();
    });
  });

  // render our page of all tweets in database
  loadTweets();
});