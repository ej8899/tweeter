//
//  TWEETER - client.js
//  main client side JS file - use with composer-char-counter.js and index.html
//  LHL project "Tweeter" -
//  https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m04w8/activities/587?journey_step=39&workbook=11
//
//  2022-08-23 -- http://www.github.com/ej8899/tweeter
//  https://twitter.com/ejdevscom
//


//
// global variables
//
let numTotalUnreadTweets = 0, inputFormState = 0, tweetsOnDisplay = 0, tweetsPerLoad = 10, totalTweetsRemaining = 0;
let statusDB = [];  // array of objects: { flag: true/false, heart:true/false, retweet:true/false } - index is tweet ID
const badWords = ["arse","peepee","trudeau","jabs"];

// toggle to switch classes between .light and .dark
// if no class is present (initial state), then assume current state based on system color scheme
// if system color scheme is not supported, then assume current state is light
const toggleDarkMode = function(option) {
  const addDark = () => {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
    $("#dayicon").addClass("darkmodeIconVisible");
    $("#dayicon").removeClass("darkmodeIconInvisible");
    $("#nighticon").removeClass("darkmodeIconVisible");
    $("#nighticon").addClass("darkmodeIconInvisible");
  };
  const addLight = () => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    $("#dayicon").addClass("darkmodeIconInvisible");
    $("#dayicon").removeClass("darkmodeIconVisible");
    $("#nighticon").addClass("darkmodeIconVisible");
    $("#nighticon").removeClass("darkmodeIconInvisible");
  };
  // check localStorage to see if we have a dark preference & apply theme if so
  if (option === 'check') {
    if (localStorage.getItem('isDarkMode') === 'true') {
      $('#darkmodeswitch').prop('checked', true);
      setTimeout(() => {    // fake delay IS required here
        addDark();
      }, 0);
      setTimeout(() => {    // minimize 'flash' when initially loading page
        $('body').css('transition', 'all .3s ease-in');
      }, 10);
    } else {
      addLight();
    }
    // remove any flash as we've hidden the page initially - BUT also needs transitions OFF (we add above after load)
    $('body').css('visibility','visible');
    $('body').css('opacity','1');
    return;
  }

  if (document.documentElement.classList.contains("light")) {
    addDark();
  } else if (document.documentElement.classList.contains("dark")) {
    addLight();
  } else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      addDark();
    } else {
      addLight();
    }
  }
  // save our preference for next time here
  if (document.documentElement.classList.contains("dark")) {
    localStorage.setItem('isDarkMode',true);  // https://blog.logrocket.com/localstorage-javascript-complete-guide/
  } else {
    localStorage.removeItem('isDarkMode');
  }
};


//
//  escape() - escape any bad text for cross-site-scripting
//  https://flex-web.compass.lighthouselabs.ca/workbooks/flex-m04w9/activities/629?journey_step=49&workbook=19
//
const escapeText = function(str) {
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

  $('#tweet-container').empty();          // empty the container to add in new after new a fetch.

  if (tweets.length > 10) {
    $("#moreitems").removeClass("hide");
  }

  tweetsOnDisplay = numTotalUnreadTweets - tweetsPerLoad;
  for (let x = 0; x < tweets.length; x ++) {
    if (x < (tweets.length - tweetsPerLoad)) {
      extraClass = "hide";
    } else {
      extraClass = "";
    }
    const tweet = createTweetElement(tweets[x],extraClass,x);
    $('#tweet-container').prepend(tweet);
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
  let redflagStatus = '', redborderStatus = '', blurredtextStatus = '', redheartStatus = '';
  let timeStamp = timeago.format(tweetData.created_at);
  let escapeTextElement = escapeText(tweetData.content.text);
  if (statusDB[id].flag === true) {             // is this post flagged as offensive?
    redflagStatus = 'redflag';
    redborderStatus = 'redborder';
    blurredtextStatus = 'blurredtext';
  }
  if (statusDB[id].heart === true) {            // is this post hearted / liked?
    redheartStatus = 'redflag';
  }

  let badWordsFound = badWords.some(word => escapeTextElement.includes(word));
  //alert(badWordsFound);
  if (badWordsFound) {
    redborderStatus = 'yellowborder';
    blurredtextStatus = 'blurredtext';
  }

  let tweetContainer = `      <article class="tweet-layout ${extraClass} ${redborderStatus}" id="id-${id}">
                                <div class="tweet-header">
                                  <div style="display: flex; justify-content: flex-start; align-items:center;"><div><IMG SRC="${tweetData.user.avatars}"></div><div style="padding-left:15px">${tweetData.user.name}</div></div>
                                  <div style="display: flex; align-items: center">${tweetData.user.handle}</div>
                                </div>
                                <div class="tweet-message ${blurredtextStatus}">${escapeTextElement}</div>
                                <footer class="tweet-footer">
                                  <div>${timeStamp}</div> 
                                  <div>
                                    <i class="fa-solid fa-flag icon tooltip ${redflagStatus}"><span class="tooltiptext">file a complaint</span></i>&nbsp;<i class="fa-solid fa-retweet icon tooltip"><span class="tooltiptext">re-tweeter this</span></i>&nbsp;<i class="fa-solid fa-heart icon tooltip ${redheartStatus}"><span class="tooltiptext">like this</span></i>
                                  </div>
                                </footer>
                            </article>`;
  return tweetContainer;
};


//
//  get tweets from server & render to page
//
const loadTweets = function() {
  let statusObject = {};
  let jqxhr = $.get("/tweets/", function(tweetData) {     // https://www.w3schools.com/jquery/jquery_ajax_get_post.asp
    // primary success
    for (let x = 0; x < tweetData.length; x++) {          // build our statusDB tracking database (in memory)
      statusObject = {
        flag: false,
        heart: false,
        retweet: false,
      };
      if (statusDB[x] === undefined) {
        statusDB.push(statusObject);
      }
    }
    renderTweets(tweetData);
    $('#badge').html(Math.floor(numTotalUnreadTweets));   // update tweet count badge
  })
    .done(function() {                                    // second done function
      
    })
    .always(function() {                                  // "always" runs - error or not
      
    })
    .fail(function() {                                    // https://stackoverflow.com/questions/2175756/how-to-handle-error-in-get
      $(".criticalerror").removeClass("hide");
    });
};



//
// toggleTweetForm() - open or close the form
// - if passing "true", we'll override where the form sits now and just open it.
//
const toggleTweetForm = (forceOpen) => {
  const slideSpeed = 300;
  if (forceOpen === true) {                               // ! we can also use: if ($("#newtweetform").is(":visible") == true) {}
    inputFormState = 0;                                   // 0 closed, 1 open
  }
  if (inputFormState === 0) {
    $("#submit").removeClass("shake");                    // css animation is a bit finiky to reset it, so remove it when possible
    $("#newtweetform").slideDown(slideSpeed);             // open input form
    $("#tweet-text").focus();                             // give form input FOCUS
    inputFormState = 1;
  } else {
    inputFormState = 0;
    $("#newtweetform").slideUp(slideSpeed);               // close input form
    $("#submit").removeClass("shake");                    // css animation is a bit finiky to reset it, so remove it when possible
  }
};

//
// parseID(string);
// strips id- from input string and returns just the ID #
// NOTE: CSS id's can't start with a number, so we need to strip any alpha prefix used.
//
const parseID = (string) => {
  return (string.replace(/id-/,""));
};

//
// process FLAGS on each tweet
//
$(document).on("click", ".fa-flag", function(event) {
  const $aFlag = $(this).parent().find(".fa-flag");
  let idNumber = parseID($(this).closest('.tweet-layout').attr('id'));  // for statusDB
  
  event.stopPropagation();                                        // ! QUESTION is stopPropagation to be used here - or needed?
  if ($aFlag.hasClass("redflag")) {
    $aFlag.removeClass("redflag");
    statusDB[idNumber].flag = false;
    $(this).parent().parent().parent().removeClass("redborder");  // ! QUESTION: what is best/better practice? this line or next?
    $(this).closest('.tweet-layout').children('.tweet-message').removeClass("blurredtext");
  } else {
    statusDB[idNumber].flag = true;
    $aFlag.addClass("redflag");
    $(this).parent().parent().parent().addClass("redborder");
    $(this).closest('.tweet-layout').children('.tweet-message').addClass("blurredtext");
  }
  // HOW TO continue this process:
  // let's add another class which is unique ID for this message so we can reference it
  // so we have class fa-flag IDxxx (xxx is the unique number)
  // then strip like so: messageId = $(this).attr('class') // then extract the "IDxxx",strip ID and process on the ID #.
  // this ID would then get passed back to sever as reported for algorithm to deal with, or someone to review.
});


//
// process HEARTS (likes) on each tweet
//
$(document).on("click", ".fa-heart", function() {
  const $aFlag = $(this).parent().find(".fa-heart");
  let idNumber = parseID($(this).closest('.tweet-layout').attr('id'));  // for statusDB
  if ($aFlag.hasClass("redflag")) {
    $aFlag.removeClass("redflag");
    statusDB[idNumber].heart = false;
  } else {
    $aFlag.addClass("redflag");  // also removeClass
    statusDB[idNumber].heart = true;
  }
  
  // loop thru all posts, count # of checked HEARTS
  // update counter in circle-check-heart
  let likeCounter = 0;
  const likedTweets = $('.fa-heart');
  for (let i = 0; i < likedTweets.length; i++) {
    if ($(likedTweets[i]).hasClass("redflag")) {
      likeCounter ++;
    }
  }
  // update our heart/like counter here:
  $('#heartcounter').html("(" + likeCounter + ")");
});


//
// process RETWEET on each tweet
//
$(document).on("click", ".fa-retweet", function() {
  const $aFlag = $(this).parent().find(".fa-retweet");

  $aFlag.addClass("redflag");   // might already be set, but that's ok - not removing it as already 'retweeted'
  // get message out of tweets-message class container
  let reTweetMessage = $(this).closest('.tweet-layout').children('.tweet-message').text();
  // slide open tweet form
  toggleTweetForm(true);        // force tweet window open
  // populate it
  $('#tweet-text').val(reTweetMessage);
  // scroll to top (form area)
  document.body.scrollIntoView(true);
  $("#submit").addClass("shake");                 // css animation is a bit finiky to reset it
  restartAnimation("#submit");
});

//
// process click on 'badwords' flagged post - unblur the text for 3 seconds, then obscure it again
//
$(document).on("click",".yellowborder", function() {
  $(this).closest('.tweet-layout').children('.tweet-message').removeClass("blurredtext");
  setTimeout(() => {
    $(this).closest('.tweet-layout').children('.tweet-message').addClass("blurredtext");
  }, 3000);
});


//
// START: document.ready HANDLER
//
$(document).ready(function() {

  toggleDarkMode('check');                            // check if user prefers dark mode (saved state)
  
  $("#floater").hide();                               // default to hide our 'floater' icon on page load
  
  $("#newtweetform").hide();                          // default to input form closed
  inputFormState = 0;                                 // 0 closed, 1 open
  
  $("#opentweet").click(function() {                  // allow for click on chevron icon,
    toggleTweetForm();
  });
  $("#opentweet2").click(function() {                 // and the 'write a new tweet' text
    toggleTweetForm();
  });

  // get clicks on header heart-circle-check - filter only LIKED tweets
  $(".fa-heart-circle-check").click(function() {
    const likedTweets = $('.fa-heart');

    // if heart-circle-check is RED, & we click again, then we want to return to a default view of paginated tweets
    if ($(this).hasClass("redView")) {
      $(this).removeClass("redView");
      loadTweets();
    } else {
      $(this).addClass("redView");
      $(".moreItems").addClass("hide");  // get rid of "more" pagination link

      for (let i = 0; i < likedTweets.length; i++) {
        if ($(likedTweets[i]).hasClass("redflag")) {                      // if hidden & has 'heart' set, show tweet
          $(likedTweets[i]).parent().parent().parent().removeClass("hide");
        } else {
          $(likedTweets[i]).parent().parent().parent().addClass("hide");  // hide the tweet as it's not liked.
        }
      }
    }
  });

  // process "more" tweets to load
  $("#more").click(function() {
    // see how many tweetsOnDisplay
    // numTotalUnreadTweets
    // remember we have to count backwards as we're prepending tweets to top of list - not bottom!
    if (totalTweetsRemaining < 1) {
      $(".moreItems").addClass("hide");
      return;
    }
    for (let x = 1; x < tweetsPerLoad + 1; x ++) {
      // grab ID of numTotalUnreadTweets - tweetsOnDisplay
      // example, 40 total tweets, then tweetsOnDisplay = 30 (first run)
      // so on first click we want tweetsondisplay (id) to unhide with id - x;
      let divId = '#id-' + (tweetsOnDisplay - x);
      $(divId).removeClass("hide");
    }
    totalTweetsRemaining -= tweetsPerLoad;
    tweetsOnDisplay = tweetsOnDisplay - tweetsPerLoad;
    $("#more").attr("data-badge",totalTweetsRemaining);
    if (totalTweetsRemaining < 1) {
      $(".moreItems").addClass("hide");               // don't display "more" if there aren't any more!
      tweetsOnDisplay = 0;
    }
  });

  // start with any error block closed
  $("#error-block").hide();

  //
  // process form submission
  //
  $("#new-tweet-form").submit(function(event) {
    event.preventDefault();                               // https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault

    // error check submission
    $("#error-block").slideUp(errorSlideUpSpeed);
    let tweetMessage = $(this).find('#tweet-text').val().trim();
    $(this).find("#tweet-text").val(tweetMessage);
    const tweetLength = tweetMessage.length;
    
    if ((maxTweetChars - tweetLength) < 0) {              // error check for tweet TOO LONG
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is too long!");
      $("#error-block").slideDown(errorSlideDownSpeed);
      $("#tweet-text").css("outline","2px solid var(--red)");
    } else if (tweetLength === 0) {                       // error check for tweet EMPTY
      $('#error-block').html("<i class=\"fa-solid fa-lg fa-beat-fade fa-circle-exclamation\"></i> Your Tweeter message is missing!");
      $("#error-block").slideDown(errorSlideDownSpeed);
      $("#tweet-text").css("outline","2px solid var(--red)");
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
      $("#floater").show();           // show 'to top' float button
      $("#writenewlink").hide();      // hide the top 'write new tweet'
      $("#newtweetform").hide();
    } else {
      $("#floater").hide();
      $("#writenewlink").show();
    }
  });

}); // END:  of document.ready()