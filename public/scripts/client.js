/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */




// DELETE FAKE DATA:
const data = [
  {
    "user": {
      "name": "Newton",
      "avatars": "https://i.imgur.com/73hZDYK.png"
      ,
      "handle": "@SirIsaac"
    },
    "content": {
      "text": "If I have seen further it is by standing on the shoulders of giants"
    },
    "created_at": 1461116232227
  },
  {
    "user": {
      "name": "Descartes",
      "avatars": "https://i.imgur.com/nlhLi3I.png",
      "handle": "@rd" },
    "content": {
      "text": "Je pense , donc je suis"
    },
    "created_at": 1461113959088
  }
];


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
  let tweetContainer = `        <article class="tweets-layout">`;
  tweetContainer += `        <div class="tweets-header">`;
  tweetContainer += `          <div><IMG SRC="${tweetData.user.avatars}"> ${tweetData.user.name}</div>`;
  tweetContainer += `          <div>${tweetData.user.handle}</div>`;
  tweetContainer += `         </div>`;
  tweetContainer += `      <div class="tweets-message">${tweetData.content.text}</div>`;
  tweetContainer += `      <footer class="tweets-footer">`;
  tweetContainer += `      <div>${tweetData.created_at}</div> `;
  tweetContainer += `      <div>`;
  tweetContainer += `        <i class="fa-solid fa-flag icon tooltip"><span class="tooltiptext">file a complaint</span></i>&nbsp;<i class="fa-solid fa-retweet icon tooltip"><span class="tooltiptext">re-tweeter this</span></i>&nbsp;<i class="fa-solid fa-heart icon tooltip"><span class="tooltiptext">like this</span></i>`;
  tweetContainer += `      </div>`;
  tweetContainer += `      </footer>`;
  tweetContainer += `      </article>`;
  tweetContainer += `    <br clear="all">`;
  return tweetContainer;
};


const loadTweets = () => {
  data.length = 0;  // reset our RAM database
  $.get("/tweets/", function(tweetData) {          // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
    renderTweets(tweetData);
  });
};


  
$(document).ready(function() {
  
  $("#new-tweet-form").submit(function(event) {
    event.preventDefault();
    const newTweet = $(this).serialize();
    $.post("/tweets/", newTweet, () => {          // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
      // call back for error checks
    
      loadTweets();
    });
  });

  loadTweets();
});