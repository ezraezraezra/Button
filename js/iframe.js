/*
 * Project:     Button
 * Description: Basic Embed Button to put on website
 * Website:     http://ezraezraezra.com/tb/button/third_party.html
 * 
 * Author:      Ezra Velazquez
 * Website:     http://ezraezraezra.com
 * Date:        October 2011
 * 
 */

/** @namespace Holds functionality for basic embed button*/
var TB_BUTTON = function() {
	// Declare all variables
	var $button_overlay;
	var $button_cover;
	var $online;
	var $offline;
	var $offline_counter;
	var $cloud;
	
	/**
	 * VARIABLES NEEDED FOR HIDDEN OPENTOK SESSION
	 */
	var _OT_INFO_ = {
		_sessionID : '153975e9d3ecce1d11baddd2c9d8d3c9d147df18',
		_apiKey : 1127,
		_token : 'devtoken'
	};
	
	var hash_id = getHashId();
	var user_counter_online = 0;
	var user_counter_offline = 1;
	var fade_time = '1000';
	
	// Positions for pop-up
	var screenX = 550;
	var screenY = 550;
	
	$(document).ready(function() {
		$button_overlay = $("#button_overlay");
	    $button_cover = $("#button_cover");
		$online = $("#online_container");
		$offline_counter = $("#offline_counter");
		$offline = $("#offline_container");
		$cloud = $("#cloud_backdrop");
		
		// Display cloud with users watching/live
		cloudDisplay();
		
		// Capture click events
		$button_cover.mouseover(mouseIn).mouseout(mouseOut).click(mouseClick);
	});
	
	function getHashId() {
		var hash_id = self.document.location.hash.substring(1);
		return hash_id;
	}

	//--------------------
	// Event Handlers
	//--------------------
	function mouseIn() {
		//$button_overlay.stop(true,true).fadeOut(fade_time);
		$button_overlay.css("visibility", "hidden");
	}

	function mouseOut() {
		//$button_overlay.stop(true,true).fadeIn(fade_time);
		$button_overlay.css("visibility", "visible");
	}
	function mouseClick() {
		// Specific rules to open the pop-up
		window.open('http://api.opentok.com/hl/embed/' + hash_id, 'TokBoxBasicEmbed', 'location=no,menubar=no,scrollbars=no,status=no,titlebar=no,toolbar=no,resizable=no,innerHeight=265px,innerWidth=350px,directores=no,screenX='+screenX+'px,screenY='+screenY+'px');
		
		// "Turn off" the watching/live counter, as not to duplicate amount of people actualy present
		TB_Session.disconnect();
	}
	
	function cloudDisplay() {
		//TB_Session.init('153975e9d3ecce1d11baddd2c9d8d3c9d147df18');
		TB_Session.init(_OT_INFO_);
	}
	
	
	/** @namespace Holds functionality for OpenTok Session acting as participating / watching counter*/
	var TB_Session = function() {
		// Get updated via init()
		var session_id;
		var apiKey;
		var token;
		var session;
		
		function connect() {
			session.connect(apiKey, token);
		}
		
		// Update connections counter
		function connectionHandler(event) {
			$cloud.css("visibility", "visible");
			
			if (event.type === "connectionCreated") {
				user_counter_offline += 1;
			}
			else 
				if (event.type === "connectionDestroyed") {
					user_counter_offline -= 1;
				}
			$offline_counter.html(user_counter_offline);
		}
		
		// Initialize counter & publishing counter
		function sessionConnectedHandler(event) {
			$cloud.css("visibility", "visible");
			if (event.streams) {
				user_counter_online = event.streams.length;
				$online.html(user_counter_online + " Live");
					
				user_counter_offline = event.connections.length;
				$offline_counter.html(user_counter_offline);
				
				if (event.streams.length > 0) {					
					$offline.css("visibility", "hidden");
					$online.css("visibility", "visible");
				}
				else {
					$online.css("visibility", "hidden");
					$offline.css("visibility", "visible");
				}
			}
		}
		
		// Update publishing counter
		function streamHandler(event) {
			if (event.type === "streamCreated") {
				user_counter_online += 1;
			}
			else {
				if (event.type === "streamDestroyed") {
					user_counter_online -= 1;
				}
			}
			
			$online.html(user_counter_online + " Live");
		
		}
		
		/** @namespace Holds functionality for basic embed button*/
		return {
			/**
			 * Initializes the OpenTok session. Must be called prior to any other functions
			 * @param {Object} _OT_INFO_ values of necessary variables to start an OpenTok session
			 */
			init : function(_OT_INFO_) {
				session_id = _OT_INFO_._sessionID;
				apiKey = _OT_INFO_._apiKey;
				token = _OT_INFO_._token;
				
				if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
					alert("You don't have the minimum requirements to run this aplication." +
					"Please upgrade to the latest version of Flash.");
				}
				else {
					session = TB.initSession(session_id);
					session.addEventListener('sessionConnected', sessionConnectedHandler);
					session.addEventListener('connectionCreated', connectionHandler);
					session.addEventListener('connectionDestroyed', connectionHandler);
					session.addEventListener('streamCreated', streamHandler);
					session.addEventListener('streamDestroyed', streamHandler);
					
					connect();
				}
			},
			// Turn off the 'extra' session
			disconnect: function(){
				session.disconnect();
			}
		};
	}();
}();
