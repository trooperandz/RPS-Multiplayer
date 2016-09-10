
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

// Set global turnCount for tracking turn number (dictates which person's turn it is)
var turnCount = 0;

// Set globals for tracking player wins & losses
var player1Wins   = 0;
var player1Losses = 0;
var player2Wins   = 0;
var player2Losses = 0;

// Set globals for storing player names
var player1Name = "";
var player2Name = "";

// Set global class name for player-active styling instruction
var activeClassName = "player-active";

// Set values when items are added to db
db.ref().on("value", function(snapshot) {
	console.log("snapshot: " , snapshot.val());

	// Update the turnCount with the value in the database
	if(snapshot.child("turn").exists()) {
		turnCount = snapshot.val().turn;
		console.log("turnCount snapshot value: " + turnCount);

		// If turnCount == 1 (player 1's turn), add active class to content for styling
		if(turnCount == 0 || turnCount == 1) {
			// If both players' names have been entered, and player one hasn't moved yet, highlight player 1 content area and heading
			$('#player1Name').addClass(activeClassName);
			$('#player1').addClass(activeClassName);
			// var test1 = snapshot.val().players["1"].name;
			// console.log("Player 1 snapshot name test turnCount 1: " + test1);
			// var test2 = snapshot.val().players["2"].name;
			// console.log("Player 2 snapshot name test turnCount 1: " + test2);
		} else if (turnCount == 2) {
			// If player one already moved, highlight player 2 content area and heading. First, remove class from player 1
			$('#player1Name').removeClass(activeClassName);
			$('#player1').removeClass(activeClassName);
			$('#player2Name').addClass(activeClassName);
			$('#player2').addClass(activeClassName);
			// Test player 1 data
			// var imgTest1 = snapshot.val().players["1"].imgUrl;
			// console.log("Player 1 snapshot img test turnCount 2: " + imgTest1);
			// var nameTest2 = snapshot.val().players["2"].name;
			// console.log("Player 2 snapshot name test turnCount 2: " + nameTest2);
		} else if (turnCount > 2) {
			// Remove active class from player 2 content
			$('#player2Name').removeClass(activeClassName);
			$('#player2').removeClass(activeClassName);

			// Show move choices on both screens now that both players have chosen a move
			var imgUrl1 = snapshot.val().players["1"].imgUrl;
			//console.log("Player 1 snapshot img test turnCount 3: " + imgUrl1);

			// var choiceTest = snapshot.val().players["1"].choice;
			// console.log("Player 1 snapshot choice test turnCount 3: " + choiceTest);
			var content = '<div class="row">' +
        					'<div class="col-sm-12 col-md-12 col-lg-12" id="answer-reveal">' +
        						'<img src="' + imgUrl1 + '">' +
        					'</div>' +
        				  '</div>';
			$('div#player1').html(content);

			var imgUrl2 = snapshot.val().players["2"].imgUrl;
			//console.log("Player 2 snapshot img test turnCount 3: " + imgUrl2);

			// var choiceTest = snapshot.val().players["2"].choice;
			// console.log("Player 2 snapshot choice test turnCount 3: " + choiceTest);
			var content = '<div class="row">' +
        					'<div class="col-sm-12 col-md-12 col-lg-12" id="answer-reveal">' +
        						'<img src="' + imgUrl2 + '">' +
        					'</div>' +
        				  '</div>';
			$('div#player2').html(content);
			//$('#player1Name').addClass(activeClassName);
			//$('#player1').addClass(activeClassName);
			// Reset turnCount to 1 in db
			//db.ref().child("turn").set(1);
		}
	}

	if(snapshot.child("players").child("1").exists()) {
		player1Name = snapshot.val().players["1"].name;
		//console.log("player1Name inside of exists check: " + player1Name);
		// Update side content and main content player name
		$('#player1-side-h').html(player1Name);
		$('#player1Name').html(player1Name);
	}
	if(snapshot.child("players").child("2").exists()) {
		player2Name = snapshot.val().players["2"].name;
		// Update side content and main content player name
		$('#player2-side-h').html(player2Name);
		$('#player2Name').html(player2Name);
	}

// If any errors are experienced, log them to console. 
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});

// Main game object for play functionality
var game = {

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

		// Check the state of player1Name and player2Name
		if(player1Name == "") {
			player1Name = name;
			db.ref().set({
				players: {
					1: {
						losses: 0,
						name: name,
						wins: 0
					}
				}
			});
		} else if (player1Name != "" && player2Name == "") {
			player2Name = name;
			db.ref().child("players").child("2").set({
				losses: 0,
				name: name,
				wins: 0
			});

			db.ref().child("turn").set(1);
		} else {
			game.showModal("There are already two active players! Somebody must leave first before adding a new player.");
			return false;
		}
	});

	// Create handler for player move click event
	$('.play-icons').on('click', 'img', function(e) {

		// Get the player value. Actual player number will be the last 'letter' of the id string.
		var playerNum = $(this).closest('div.play-icons').attr("id");
		playerNum = playerNum.slice(-1);
		//console.log("playerNum: " + playerNum);

		// Make sure that the player does not go out of turn. turnCount comes from the db
		if(turnCount != playerNum) {
			game.showModal("You can't go right now; It's not your turn!");
			return false;
		}
		
		// Get the move selected
		var move = $(this).attr("id");
		//console.log("Move: " + move);

		// Save the img url for later insertion into player answer shown content
		var imgUrl = $(this).attr("src");
		//console.log("imgUrl: " + imgUrl);

		// If it is player 1's move, just update "turn" and "choice"
		if(turnCount == 1) {
			// Increment turnCount so that system recongnizes 2nd player's turn
			turnCount += 1;

			// If playerNum == 1, update local play area content with move chosen display. Put in function 
			var content = '<div class="row">' +
        					'<div class="col-sm-12 col-md-12 col-lg-12" id="answer-reveal">' +
        						'<img src="' + imgUrl + '">' +
        					'</div>' +
        				  '</div>';
			$('div#player1').html(content).fadeIn(1300);

			// Set turnCount with updated value
			db.ref().child("turn").set(turnCount);

			// Add "choice" as child to players "1" object
			db.ref().child("players").child("1").update({
				choice: move,
				imgUrl: imgUrl
			});

		} else if (turnCount == 2) {
			// Increment turnCount so that it can be reset to 1
			turnCount += 1;

			// If playerNum == 1, update local play area content with move chosen display. Put in function 
			var content = '<div class="row">' +
        					'<div class="col-sm-12 col-md-12 col-lg-12" id="answer-reveal">' +
        						'<img src="' + imgUrl + '">' +
        					'</div>' +
        				  '</div>';
			$('div#player2').html(content).fadeIn(1300);

			// Set turnCount with updated value
			db.ref().child("turn").set(turnCount);

			// Add "choice" as child to players "2" object
			db.ref().child("players").child("2").update({
				choice: move,
				imgUrl: imgUrl
			});
		}
		// Note: don't do anything if turnCount == 3?
	});
});
    