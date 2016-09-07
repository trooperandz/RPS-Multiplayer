
// Connection credentials for firebase multi-rps database
var config = {
  apiKey: 	   "AIzaSyB_M3jo8D8_tTkrgMiEpCzoe_k_hYCucT0",
  authDomain:    "multi-rps-74cdc.firebaseapp.com"		,
  databaseURL:   "https://multi-rps-74cdc.firebaseio.com" ,
  storageBucket: ""
};

// Initialize Firebase
firebase.initializeApp(config);

// Create db var for easy access
var db = firebase.database();

// Main game object for play functionality
var game = {

	// Establish turn counter.  Will determine whose turn it is (dictates who can go etc)
	turnCount: 0,

	// Establish vars for storing player wins/losses
	playerWins1:   0,
	playerLosses1: 0,
	playerWins2:   0,
	playerLosses2: 0,

	// Establish vars for storing current player names
	playerName1: "",
	playerName2: "",

	// Establish vars for storing player move choice img url, for later answer choice content generation
	playerImg1: "",
	playerImg2: "",

	/**
	 * Generate html content for player move selection choices display
	 * @param N/A
	 * @return N/A
	 */
	createMoveChoices: function() {

	},

	/**
	 * Apply player-active class to current player display content, for signaling to players who's turn it is
	 * @param N/A
	 * @return N/A
	 */
	applyActiveClass: function(htmlObj) {
		htmlObj.addClass("player-active");
	},

	/**
	 * Remove player-active class from container after player has finished their move
	 * @param N/A
	 * @return N/A
	 */
	removeActiveClass: function(htmlObj) {

	},

	/**
	 * Generate html content for player choice selected display
	 * @param N/A
	 * @return N/A
	 */
	createCurrMoveChoice: function() {

	},

	/**
	 * Show modal for alert information
	 * @param {string} msg Message to be displayed
	 * @return N/A
	 */
	showModal: function(msg) {
		// Put the message inside of the modal
		$('p#modal-msg').text(msg);

		// Show the modal
		$('.infoModal').modal("show");
	}
}

$(document).ready(function() {

	// Create handler for player join input submit event
	$('.glyphicon-plus').on('click', function(e) {
		// Get the name of the new player. Trim off any whitespace.
		var name = $('.player-join-input').val().trim();

		// Make sure something was entered
		if(name == "") {
			game.showModal("You must enter a name before proceeding!");
			return false;
		}

		// Check the state of playerName1.  If null, set playerNum == 1
		var playerNum;
		if(game.playerName1 == "") {
			playerNum = "1";
		} else if (game.playerName1 != "" && game.playerName2 == "") {
			playerNum = "2";
		} else {
			game.showModal("There are already two active players! Somebody must leave first before adding a new player.");
			return false;
		}

		// Create an object to insert into the db
		var playerObj = {
			"players": {
				playerNum: {
					losses: 0,
					name: name,
					wins: 0
				}
			}
		}

		// Push the object to the db
		db.ref().push(playerObj);
	});

	// Create handler for player move click event
	$('.play-icons').on('click', 'img', function(e) {

		// Get the player value. Actual player number will be the last 'letter' of the id string.
		var playerNum = $(this).closest('div.play-icons').attr("id");
		playerNum = playerNum.slice(-1);
		console.log("playerNum: " + playerNum);

		// Get the move selected
		var move = $(this).attr("id");
		console.log("Move: " + move);

		// Save the img url for later insertion into player answer shown content
		var imgUrl = $(this).attr("src");
		console.log("imgUrl: " + imgUrl);

		// Create an object for insertion into db
		var playerMove = {

		}
	});
});
    