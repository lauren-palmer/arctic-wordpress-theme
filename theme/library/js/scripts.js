/*
 * Bones Scripts File
 * Author: Eddie Machado
 *
 * This file should contain any js scripts you want to add to the site.
 * Instead of calling it in the header or throwing it inside wp_head()
 * this file will be called automatically in the footer so as not to
 * slow the page load.
 *
 * There are a lot of example functions and tools in here. If you don't
 * need any of it, just remove it. They are meant to be helpers and are
 * not required. It's your world baby, you can do whatever you want.
*/


/*
 * Get Viewport Dimensions
 * returns object with viewport dimensions to match css in width and height properties
 * ( source: http://andylangton.co.uk/blog/development/get-viewport-size-width-and-height-javascript )
*/
function updateViewportDimensions() {
	var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
	return { width:x,height:y };
}
// setting the viewport width
var viewport = updateViewportDimensions();


/*
 * Throttle Resize-triggered Events
 * Wrap your actions in this function to throttle the frequency of firing them off, for better performance, esp. on mobile.
 * ( source: http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed )
*/
var waitForFinalEvent = (function () {
	var timers = {};
	return function (callback, ms, uniqueId) {
		if (!uniqueId) { uniqueId = "Don't call this twice without a uniqueId"; }
		if (timers[uniqueId]) { clearTimeout (timers[uniqueId]); }
		timers[uniqueId] = setTimeout(callback, ms);
	};
})();

// how long to wait before deciding the resize has stopped, in ms. Around 50-100 should work ok.
var timeToWaitForLast = 100;


/*
 * Here's an example so you can see how we're using the above function
 *
 * This is commented out so it won't work, but you can copy it and
 * remove the comments.
 *
 *
 *
 * If we want to only do it on a certain page, we can setup checks so we do it
 * as efficient as possible.
 *
 * if( typeof is_home === "undefined" ) var is_home = $('body').hasClass('home');
 *
 * This once checks to see if you're on the home page based on the body class
 * We can then use that check to perform actions on the home page only
 *
 * When the window is resized, we perform this function
 * $(window).resize(function () {
 *
 *    // if we're on the home page, we wait the set amount (in function above) then fire the function
 *    if( is_home ) { waitForFinalEvent( function() {
 *
 *	// update the viewport, in case the window size has changed
 *	viewport = updateViewportDimensions();
 *
 *      // if we're above or equal to 768 fire this off
 *      if( viewport.width >= 768 ) {
 *        console.log('On home page and window sized to 768 width or more.');
 *      } else {
 *        // otherwise, let's do this instead
 *        console.log('Not on home page, or window sized to less than 768.');
 *      }
 *
 *    }, timeToWaitForLast, "your-function-identifier-string"); }
 * });
 *
 * Pretty cool huh? You can create functions like this to conditionally load
 * content and other stuff dependent on the viewport.
 * Remember that mobile devices and javascript aren't the best of friends.
 * Keep it light and always make sure the larger viewports are doing the heavy lifting.
 *
*/

/*
 * We're going to swap out the gravatars.
 * In the functions.php file, you can see we're not loading the gravatar
 * images on mobile to save bandwidth. Once we hit an acceptable viewport
 * then we can swap out those images since they are located in a data attribute.
*/
function loadGravatars() {
  // set the viewport using the function above
  viewport = updateViewportDimensions();
  // if the viewport is tablet or larger, we load in the gravatars
  if (viewport.width >= 768) {
  jQuery('.comment img[data-gravatar]').each(function(){
    jQuery(this).attr('src',jQuery(this).attr('data-gravatar'));
  });
	}
} // end function


function mobileNav(){
	var trigger = $("#nav-trigger");
	
	if(!trigger.length) return false;
	
	trigger.on("click", function(e){
		//Hide/Show the triggers
		trigger.children(".icon").toggleClass("hidden");
		
		//Hide/Show the menu
		$("#main-nav").slideToggle();
	});
	
	//Show submenus when a root link is clicked
	$(".nav > li").click(function(e){
		var parentEl = e.target.tagName == "LI"? e.target : $(e.target).parent("li");
		if(!parentEl || !$(parentEl).length) return;
		
		$(parentEl).find(".sub-menu").slideToggle();
		
	});
}

//Inserts the ORCID icon in the sign-in button in the top navigation
function insertOrcidIcon(){
	$(".nav .login.btn a").prepend('<img src="/wp-content/themes/aurora/library/images/orcid_64x64.png" class="icon icon-on-left" />');
}

//Performs custom Slaask functionality
function slaaskCustomization(){
	
	var slaaskOptions = {
			closeMsg: "(Visitor has closed the chat.)",
			leaveMsg: "(Visitor has left the page.)",
			openMsg: "(Visitor has opened the chat.)"
	}
	
	//When the chat window is open, send a message
	document.addEventListener('slaask.open', function (e) { 		
		//First hide all the messages that the user doesn't need to see
		$("#slaask-widget-container .conversation-text p:contains('" + slaaskOptions.closeMsg + "')").parents(".conversation-text").hide();
		$("#slaask-widget-container .conversation-text p:contains('" + slaaskOptions.openMsg + "')").parents(".conversation-text").hide();
		//$("#slaask-widget-container .conversation-text p:contains('" + slaaskOptions.leaveMsg + "')").parents(".conversation-text").hide();
		
		//If we're not currently chatting, exit
		if(!isChatting()) return;

		//Send a message that the user has reopened the chat
		$.ajax({
			type: "POST",
			url: _slaask.post_url + "/api/publish",
			data: JSON.stringify({
				key: _slaask.api_key,
				guest_id: _slaask.guest_id,
				message: slaaskOptions.openMsg,
				user_group_id: _slaask.user_group_id,
				hidden: true
			}),
			contentType: "application/json"
		});
	}, false);
	
	//When the chat window is closed, send a message
	document.addEventListener('slaask.close', function (e) { 
		//If we're not currently chatting, exit
		if(!isChatting()) return;
		
		$.ajax({
			type: "POST",
			url: _slaask.post_url + "/api/publish",
			data: JSON.stringify({
				key: _slaask.api_key,
				guest_id: _slaask.guest_id,
				message: slaaskOptions.closeMsg,
				user_group_id: _slaask.user_group_id,
				hidden: true
			}),
			contentType: "application/json"
		});
	}, false);
	
	function isChatting(){
		if(!slaask.available) return false;
		
		var messages = $("#conversation-list").children("li");
		
		//If there are no messages, then no
		if(!messages.length) return false;
		//If there is only one message in the widget, and its from us, then no
		else if((messages.length == 1) && (messages.first().find(".chat-avatar").length > 1)) return false;
		//If the conversation has been marked as closed, then no
		else if(messages.last().find(".slaask-notification").text().indexOf("marked as closed") > -1) return false;
		else return true;	
	}
}

/*
 * Put all your regular jQuery in here.
*/
jQuery(document).ready(function($) {

	window.$ = jQuery;
	
  /*
   * Let's fire off the gravatar function
   * You can remove this if you don't need it
  */
  loadGravatars();
  
  mobileNav();
  
  insertOrcidIcon();
  
  slaaskCustomization();
  
  /* Google Analyics */
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-75482301-1', 'auto');
  ga('send', 'pageview');

}); /* end of as page load scripts */

