
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

// Set var to cancel db update code (update status if you will)
var cancelSnapshotAction = false;

// Set global turnCount for tracking turn number (dictates which person's turn it is)
var turnCount = 0;

// Set globals for tracking player wins & losses
var player1Wins   = 0;
var player1Losses = 0;
var player2Wins   = 0;
var player2Losses = 0;

var player1Exists;
var player2Exists;

// Set globals for storing player names
var player1Name = "";
var player2Name = "";

// Set global for storing player's play number.  Used for restricting clicks on other player's move choice container
var myPlayerNumber = 0;

// Set global for storing player's name.  Used for showing player's name along with their message in the chat window. 
// Stored as session var on client, so that if player reloads windown, their name is still saved and sill display in the chat window.
var myPlayerName = "";

// Set global class name for player-active styling instruction
var activeClassName = "player-active";

// Set global for chat message action, default == true (so that initial msg will appear).  Chat msg will only be appended to chat area if chatMsgEntered == true
var chatMsgEntered = true;

// Firebase db object, for defining methods etc for queries
var dbObj = {

	// Property referencing db 'chat' node
	chatRef: db.ref('chat'),

	// Property referencing db 'players' node
	playersRef: db.ref('players'),

	// Property referencing db 'turn' node
	turnRef: db.ref('turn'),

	// This works
	getChat: function() {
		this.chatRef.on('value', function(snapshot) {
			if(snapshot.val() != null) {
				$('#chat-textarea').append(snapshot.val() + "\n");
			}
			//console.log("The chat value function ran! snapshot = " , snapshot.val());
		});
	},

	// This works
	getPlayers: function() {
		this.playersRef.on('value', function(snapshot) {
			// Set player default names so that if data is erased in db, names will update with default name.
			// DO NOT set player1Name or player2Name globals to default string, as further logic depends on these null values for entering names into db as players join
			var player1NameDefault = "Player 1";
			var player2NameDefault = "Player 2";

			// Check to see if players exist. If so, set player1 and player2 names
			player1Exists = snapshot.child('1').exists();
			player2Exists = snapshot.child('2').exists();

			// If player 1 exists, set player1 name (it's okay to reset every time. Ensures that name stays set)
			if(player1Exists) {
				player1Data   = snapshot.child('1').val();
				player1Name   = player1Data.name;
				player1Wins   = player1Data.wins;
				player1Losses = player1Data.losses;

				// Update side content and main content html with most up-to-date player name
				game.updatePlayerName({
					htmlSideObj: $('.player1-side-h'),
					htmlMainObj: $('#player1Name'),
					playerName:  player1Name
				});

				// Update player win/loss with most up-to-date stats. Note: getBattleResults in snapshot sets globals for you
				game.updatePlayerScore ({
					htmlWinObj: $('#player1-win-count'),
					htmlLossObj: $('#player1-loss-count'),
					winCount: player1Wins,
					lossCount: player1Losses
				});
				
			} else {
				// Set name global back to null, so that modal ("There are already two players!") does not fire, and new name may be inserted
				player1Name = "";

				// Update side content and main content html with most up-to-date player name
				game.updatePlayerName({
					htmlSideObj: $('.player1-side-h'),
					htmlMainObj: $('#player1Name'),
					playerName:  player1NameDefault
				});

				// Update player win/loss with most up-to-date stats. Note: getBattleResults in snapshot sets globals for you
				game.updatePlayerScore ({
					htmlWinObj: $('#player1-win-count'),
					htmlLossObj: $('#player1-loss-count'),
					winCount: player1Wins,
					lossCount: player1Losses
				});
			}

			// If player 2 exists, set player2 name
			if(player2Exists) {
				player2Data   = snapshot.child('2').val();
				player2Name   = player2Data.name;
				player2Wins   = player2Data.wins;
				player2Losses = player2Data.losses;

				// Update side content and main content html with most up-to-date player name
				game.updatePlayerName({
					htmlSideObj: $('.player2-side-h'),
					htmlMainObj: $('#player2Name'),
					playerName:  player2Name
				});

				// Update player win/loss with most up-to-date stats. Note: getBattleResults in snapshot sets globals for you
				game.updatePlayerScore ({
					htmlWinObj: $('#player2-win-count'),
					htmlLossObj: $('#player2-loss-count'),
					winCount: player2Wins,
					lossCount: player2Losses
				});

			} else {
				// Set name global back to null, so that modal ("There are already two players!") does not fire, and new name may be inserted
				player2Name = "";

				// Update side content and main content html with most up-to-date player name
				game.updatePlayerName({
					htmlSideObj: $('.player2-side-h'),
					htmlMainObj: $('#player2Name'),
					playerName:  player2NameDefault
				});

				// Update player win/loss with most up-to-date stats. Note: getBattleResults in snapshot sets globals for you
				game.updatePlayerScore ({
					htmlWinObj: $('#player2-win-count'),
					htmlLossObj: $('#player2-loss-count'),
					winCount: player2Wins,
					lossCount: player2Losses
				});
			}

			console.log("turnCount inside of getPlayers(): " + turnCount);
			// If turnCount == 1 (player 1's turn), add active class to content for styling
			if(turnCount == 0 || turnCount == 1) {
				// If both players' names have been entered, and player one hasn't moved yet, highlight player 1 content area and heading
				if(player1Exists && player2Exists) {
					var elementArray = [ $('#player1Name'), $('#player1') ];
					game.addActiveClass(elementArray);
				}

			} else if (turnCount == 2) {
				// If player one already moved, highlight player 2 content area and heading. First, remove class from player 1
				var elementArray = [ $('#player1Name'), $('#player1') ];
				game.removeActiveClass(elementArray);
	
				var elementArray = [ $('#player2Name'), $('#player2') ];
				game.addActiveClass(elementArray);
			
			} else if (turnCount > 2) {
				// Remove active class from player 2 content
				var elementArray = [ $('#player2Name'), $('#player2')];
				game.removeActiveClass(elementArray);

				// Show move choices on both screens now that both players have chosen a move
				var imgUrl1 = player1Data.imgUrl;
				//console.log("Player 1 snapshot img test turnCount 3: " + imgUrl1);
	
				var player1Choice = player1Data.choice;
				// console.log("Player 1 snapshot choice test turnCount 3: " + choiceTest);
	
				// Replace choice content with player-selected move
				game.showMoveSelected(imgUrl1, $('#player1'));
	
				var imgUrl2 = player2Data.imgUrl;
				//console.log("Player 2 snapshot img test turnCount 3: " + imgUrl2);
	
				var player2Choice = player2Data.choice;
				// console.log("Player 2 snapshot choice test turnCount 3: " + choiceTest);
	
				// Replace choice content with player-selected move
				game.showMoveSelected(imgUrl2, $('#player2'));

				// Reset turn node in db back to 1, only after loss count has also been updated
				dbObj.turnRef.set(1);
				
				// Determine who won, display middle feedback msg, update win/loss count, and then reset answer choice and middle feedback content to default
				game.getBattleOutcome(player1Choice, player2Choice);
			}

			console.log("The players snapshot function ran: snapshot = " , snapshot.val());
			//console.log("player1Exists: " + player1Exists + "\n player1Name: " + player1Name);
			//console.log("player2Exists: " + player2Exists + "\n player2Name: " + player2Name);
		});
	},

	// This works
	getTurn: function() {
		this.turnRef.on('value', function(snapshot) {
			turnCount = snapshot.val();
			//console.log("The turn value function ran: snapshot = " , snapshot.val());
		});
	}
}

// Activate event listener for database chat node
dbObj.getChat();

// Activate event listener for database turn node
dbObj.getTurn();

// Activate event listener for database players node
dbObj.getPlayers();



// Set values when items are added to db
/*
db.ref().on("value", function(snapshot) {
	console.log("snapshot: " , snapshot.val());

	// Update the turnCount with the value in the database. Note: if cancelSnapshotAction == true, do not run below code
	if(snapshot.child("turn").exists() && !cancelSnapshotAction) {
		turnCount = snapshot.val().turn;
		console.log("turnCount snapshot value: " + turnCount);

		// If turnCount == 1 (player 1's turn), add active class to content for styling
		if(turnCount == 0 || turnCount == 1) {
			// If both players' names have been entered, and player one hasn't moved yet, highlight player 1 content area and heading
			var elementArray = [ $('#player1Name'), $('#player1') ];
			game.addActiveClass(elementArray);

			// var test1 = snapshot.val().players["1"].name;
			// console.log("Player 1 snapshot name test turnCount 1: " + test1);
			// var test2 = snapshot.val().players["2"].name;
			// console.log("Player 2 snapshot name test turnCount 1: " + test2);
		} else if (turnCount == 2) {
			// If player one already moved, highlight player 2 content area and heading. First, remove class from player 1
			var elementArray = [ $('#player1Name'), $('#player1') ];
			game.removeActiveClass(elementArray);

			var elementArray = [ $('#player2Name'), $('#player2') ];
			game.addActiveClass(elementArray);

			// Test player 1 data
			// var imgTest1 = snapshot.val().players["1"].imgUrl;
			// console.log("Player 1 snapshot img test turnCount 2: " + imgTest1);
			// var nameTest2 = snapshot.val().players["2"].name;
			// console.log("Player 2 snapshot name test turnCount 2: " + nameTest2);
		} else if (turnCount > 2) {
			// Remove active class from player 2 content
			var elementArray = [ $('#player2Name'), $('#player2')];
			game.removeActiveClass(elementArray);

			// Show move choices on both screens now that both players have chosen a move
			var imgUrl1 = snapshot.val().players["1"].imgUrl;
			//console.log("Player 1 snapshot img test turnCount 3: " + imgUrl1);

			 var player1Choice = snapshot.val().players["1"].choice;
			// console.log("Player 1 snapshot choice test turnCount 3: " + choiceTest);

			// Replace choice content with player-selected move
			game.showMoveSelected(imgUrl1, $('#player1'));

			var imgUrl2 = snapshot.val().players["2"].imgUrl;
			//console.log("Player 2 snapshot img test turnCount 3: " + imgUrl2);

			var player2Choice = snapshot.val().players["2"].choice;
			// console.log("Player 2 snapshot choice test turnCount 3: " + choiceTest);

			// Replace choice content with player-selected move
			game.showMoveSelected(imgUrl2, $('#player2'));

			// Determine who won, display middle feedback msg, and then reset answer choice and middle feedback content to default
			game.getBattleOutcome(player1Choice, player2Choice);
		}
	}

	// Update player names and win/loss count on every call for ease of shiz niz
	if(snapshot.child("players").child("1").exists()) {
		player1Name = snapshot.val().players["1"].name;
		//console.log("player1Name inside of exists check: " + player1Name);
		// Update side content and main content player name
		$('.player1-side-h').html(player1Name);
		$('#player1Name').html(player1Name);

		// Update player win/loss stats.  Note: getBattleResults in snapshot sets globals for you
		document.getElementById("player1-win-count").innerHTML = player1Wins;
		document.getElementById("player1-loss-count").innerHTML = player1Losses;
	}
	if(snapshot.child("players").child("2").exists()) {
		player2Name = snapshot.val().players["2"].name;
		// Update side content and main content player name
		$('.player2-side-h').html(player2Name);
		$('#player2Name').html(player2Name);

		// Update player win/loss stats. Note: getBattleResults in snapshot sets globals for you
		document.getElementById("player2-win-count").innerHTML = player2Wins;
		document.getElementById("player2-loss-count").innerHTML = player2Losses;
	}
	
	// Update chat window with most recent chat message, only if child "chat" exists and chatMsgEntered == true (true state is set by msg click handler)
	if (snapshot.child("chat").exists() && chatMsgEntered == true) {
		$('#chat-textarea').append(snapshot.val().chat + "\n");
	}

	// If snapshot.val() == null, fill in game defaults (names & scores)
	if (snapshot.val() == null) {
		// Erase db data, restore main name headings in gameplay and sidebar area, and set all scores back to zero
		game.resetGame();

		// Remove active class from player 1 area
		var elementArray = [ $('#player1Name'), $('#player1') ];
		game.removeActiveClass(elementArray);
	}

// If any errors are experienced, log them to console. 
}, function (errorObject) {
  	console.log("The read failed: " + errorObject.code);
});*/

// Main game object for play functionality
var game = {

	// Set img src strings as vars for DRY adherence in case location changes etc.
	rockImgSrc: "assets/img/rock.png",
	paperImgSrc: "assets/img/paper.png",
	scissorsImgSrc: "assets/img/scissors.png",

	/**
	 * Activate the <audio> tag with specified id param for game sound gameplay user feedback
	 * @param {string} id HTML element id
	 * @return N/A
	 */
	playGameNoise: function(id) {
		var audio = document.getElementById(id);
		audio.play();
	},

	/**
	 * Update player name html, when new name is inserted, or existing name is removed
	 * @param {string} playerName Player name string update
	 * @return N/A
	 */
	updatePlayerName: function(dataObj) {
		// Update side content and main content html with most up-to-date player name
		$(dataObj.htmlSideObj).html(dataObj.playerName);
		$(dataObj.htmlMainObj).html(dataObj.playerName);
	},

	/**
	 * Update player win/loss html, when battle outcome is decided, or existing data is removed from db
	 * @param {object} dataObj Object containing: 'htmlWinObj,', 'htmlLossObj', 'winCount', 'lossCount'
	 * @return N/A
	 */
	updatePlayerScore: function(dataObj) {
		// Update player win/loss stats. Note: getBattleResults in snapshot sets globals for you
		dataObj.htmlWinObj.text(dataObj.winCount);
		dataObj.htmlLossObj.text(dataObj.lossCount);
	},

	/**
	 * Generate html content for player move selection choices display
	 * @param N/A
	 * @return N/A
	 */
	showMoveChoices: function() {
		// Build move choice html content
		var content =
		'<div class="row">' +
        	'<div class="col-sm-12 col-md-12 col-lg-12" id="icon-single">' +
        		'<img src="' + this.rockImgSrc + '" id="rock">' +
        	'</div>' +
        '</div>' +
        '<div class="row">' +
        	'<div class="col-sm-12 col-md-12 col-lg-12" id="icon-double">' +
        		'<img src="' + this.paperImgSrc + '" class="img-1" id="paper">' +
        		'<img src="' + this.scissorsImgSrc + '" class="img-2" id="scissors">' +
        	'</div>' +
        '</div>';

        // Replace #player1 & #player2 div content with updated content
        $('#player1').html(content);
        $('#player2').html(content);

        // Add active class to player1 content
        var elementArray = [ $('#player1Name'), $('#player1') ];
		game.addActiveClass(elementArray);
	},

	/**
	 * Apply player-active class to current player display content and name heading, for signaling to players who's turn it is
	 * @param {array} elementArray Array of html dom objects
	 * @return N/A
	 */
	addActiveClass: function(elementArray) {
		elementArray.forEach(function(element, index, arr) {
			element.addClass(activeClassName);
		})
	},

	/**
	 * Remove player-active class from player 1 container after player 2 has selected his/her move
	 * @param {array} elementArray Array of html dom objects
	 * @return N/A
	 */
	removeActiveClass: function(elementArray) {
		elementArray.forEach(function(element, index, arr) {
			element.removeClass(activeClassName);
		})
	},

	/**
	 * Generate html content for player choice selected display
	 * @param {string} imgUrl Image source attribute for <img> tag
	 * @return N/A
	 */
	showMoveSelected: function(imgUrl,htmlObj) {
		// Build choice selected html content. Add class "no-hover-bg" so that the hover white bg is not initialized
		var content =
		'<div class="row">' +
        	'<div class="col-sm-12 col-md-12 col-lg-12" id="answer-reveal">' +
        		'<img class="no-hover-bg" src="' + imgUrl + '">' +
        	'</div>' +
        '</div>';

        // Replace #player1 & #player2 div content with updated content
        htmlObj.html(content);
	},

	/**
	 * Determine game player outcome (who won), update player win/loss count in db
	 * @param {string} player1Choice, player2Choice The selection the player made
	 * @return N/A
	 * Note: gameResult true == player 1 won; false == player 2 won, null == tie.
	 * Return value will be used for updating page content (wins,losses)
	 * Updates to global vars player1Wins, player1Losses, player2Wins, player2Losses occurr in code
	 */
	getBattleOutcome: function(player1Choice, player2Choice) {
		console.log("getBattleOutcome fun ran!");
		// Establish & assign boolean values to winner vars for easy readability
		var player1 = true;
		var player2 = false;

		// Initialize return var
		var gameResult = "";

		// Use switch statements for better readability
		if (player1Choice == "rock") {
			switch (player2Choice) {
    			case "paper":
    	    		gameResult = player2;
    	    		player2Wins++;
    	    		player1Losses++;
    	    		break;
    			case "scissors":
    	    		gameResult = player1;
    	    		player1Wins++;
    	    		player2Losses++;
    	    		break;
    			default:
    	    		gameResult = "tie";
    	    }
		} else if (player1Choice == "paper") {
			switch (player2Choice) {
				case "rock":
					gameResult = player1;
					player1Wins++;
					player2Losses++;
					break;
				case "scissors":
					gameResult = player2;
					player2Wins++;
					player1Losses++;
					break;
				default:
					gameResult = "tie";
			}
		} else if (player1Choice == "scissors") {
			switch (player2Choice) {
				case "rock":
					gameResult = player2;
					player2Wins++;
					player1Losses++;
					break;
				case "paper":
					gameResult = player1;
					player1Wins++;
					player2Losses++;
					break;
				default:
					gameResult = "tie";
			}
		}

		// Set db snapshot action instruction (true will disable gameplay code content updates & changes which only need to happen during game play)
		cancelSnapshotAction = true;

		// Depending on who won/loss, update game status and set win message for middle content area
		var winMsg = "";

		if (gameResult == "tie") {
			//console.log("Tied game!");
			winMsg = "'Twas a tie!";

		} else if (gameResult) {
			//console.log("Player 1 won!");
			// Player 1 won. Update player 1 win and player 2 loss count in db
			// Note: when these 2 separate db instructions for updating wins and losses in db, if never executes the second loss update. Why?

			/* This erases data. Doesn't work.  BUT it does set both values!
			dbObj.playersRef.update({
				1: {
					wins: player1Wins
				},

				2: {
					losses: player2Losses
				}
			});*/

			dbObj.playersRef.child("1").update({
				wins: player1Wins
			});
			
			dbObj.playersRef.child("2").update({
				losses: player2Losses
			});

			winMsg = "Player 1 won!";

		} else if (!gameResult) {
			console.log("Player 2 won!");
			// Player 2 won
			dbObj.playersRef.child("2").update({
				wins: player2Wins
			});

			dbObj.playersRef.child("1").update({
				losses: player1Losses
			});

			winMsg = "Player 2 won!";
		}

		// Reset turn node in db back to 1
		//dbObj.turnRef.set(1);

		// Play the battle decided noise
		game.playGameNoise("battle-decided-sound");

		// Update middle content area with winner message
		$('#round-feedback').html(winMsg);

		// Reset snapshot action var back to default false so that normal gameplay actions may resume
		cancelSnapshotAction = false;

		// Restore game choice content and middle message feedback to original content, after delay of 5s
		setTimeout(game.resetPlayContent, 5000);
	},

	/**
	 * Reset the game content for the next R,P,S round (repopulate move icons and middle content feedback area)
	 * @param N/A
	 * @return N/A
	 * Note: Executed inside of getBattleOutcome() function, in a setTimeout function 
	 */
	resetPlayContent: function() {
		console.log("resetPlayContent fun ran!");
		// Show all move choices again
		game.showMoveChoices();

		// Update middle feedback content
		var msg = $('#round-feedback').data("text");
		$('#round-feedback').text(msg);

		// Set turnCount back to 1 so that player 1 can go (otherwise, will get an out-of-turn message)
		//turnCount = 1;
		
		// Play the next move alert noise
		game.playGameNoise("next-move-sound");
	},

	/**
	 * Reset the game: remove db content, and restore player names and scores to defaults
	 * @param N/A
	 * @return N/A
	 */
	resetGame: function() {
		// Erase db info
		db.ref().remove();

		// Restore all name headings to defaults
		var name1 = $('#player1Name').data("default");
		var name2 = $('#player2Name').data("default");
		$('#player1Name').text(name1);
		$('#player2Name').text(name2);
		$('.player1-side-h').text(name1);
		$('.player2-side-h').text(name2);

		
		// Restore all scores to zero
		var scoreDefault = 0;
		$('#player1-win-count').text(scoreDefault);
		$('#player1-loss-count').text(scoreDefault);
		$('#player2-win-count').text(scoreDefault);
		$('#player2-loss-count').text(scoreDefault);

		// Clear out the chat text input after it is submitted
		$('#chat-input').val("");
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

		// Play the modal alert noise
		game.playGameNoise("modal-alert-sound");
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
		// Note: activate the below line if you want to disallow remote player from entering their opponent's name
		//if(player1Name == "" && myPlayerNumber == 0) {
		if (player1Name == "") {

			// Play the player joined noise
			game.playGameNoise("player-join-noise");

			// Set player1 name to name entered in Join Game input
			player1Name = name;

			// Set myPlayerName as session var, so that it will still exist on page reload.
			localStorage.setItem("myPlayerName", name);
			myPlayerName = name;

			// Set player's number (unique to their computer).  Will dictate click rights
			myPlayerNumber = 1;

			// Insert player info into db
			db.ref().set({
				players: {
					1: {
						losses: 0,
						name: name,
						wins: 0
					}
				},
				turn: 0
			});
		// Note: activate the below line if you want to disallow remote player from entering their opponent's name
		//} else if (player1Name != "" && player2Name == "" && myPlayerNumber == 0) {
		} else if (player1Name != "" && player2Name == "") {

			// Play the player joined noise
			game.playGameNoise("player-join-noise");

			// Set player2 name to name entered in Join Game input
			player2Name = name;

			// Set myPlayerName as session var, so that it will still exist on page reload.
			localStorage.setItem("myPlayerName", name);
			myPlayerName = name;

			// Set player's number (unique to their computer).  Will dictate click rights
			myPlayerNumber = 2;

			// Insert player 2 info into db
			dbObj.playersRef.child('2').set({
				losses: 0,
				name: name,
				wins: 0
			});

			// Update turn node to 1
			dbObj.turnRef.set(1);
			
		} else {
			game.showModal("There are already two active players! Somebody must leave first before adding a new player.");
			return false;
		}

		// Clear the input text to make room for next player name input
		$('input.player-join-input').val("");
	});

	// Create handler for player move click event
	$('.play-icons').on('click', 'img', function(e) {

		// Play the move selection click noise
		game.playGameNoise("click-noise");

		// Get the player value. Actual player number will be the last 'letter' of the id string.
		var playerNum = $(this).closest('div.play-icons').attr("id");
		playerNum = playerNum.slice(-1);
		//console.log("playerNum: " + playerNum);

		// Make sure that the player does not go out of turn. turnCount comes from the db
		if(turnCount != playerNum) {
			game.showModal("You can't go right now; It's not your turn!");
			return false;
		}

		// Reset to false so that program will not append the most recent chat every time db action occurs
		chatMsgEntered = false;
		
		// Get the move selected
		var move = $(this).attr("id");
		//console.log("Move: " + move);

		// Save the img url for later insertion into player answer shown content
		var imgUrl = $(this).attr("src");
		//console.log("imgUrl: " + imgUrl);

		// If it is player 1's move, just update "turn", "choice" & "imgUrl"
		// Note: activate the below line if you want to disallow remote computer player from selecting their opponent's move choice
		//if(turnCount == 1 && myPlayerNumber == 1) {
		if(turnCount == 1) {
			// Increment turnCount so that system recongnizes 2nd player's turn
			turnCount += 1;

			// Update player 1 play area content with move chosen display content
			game.showMoveSelected(imgUrl, $('#player1'));

			// Set turnCount with updated value
			dbObj.turnRef.set(turnCount);

			// Add "choice" as child to players "1" object
			dbObj.playersRef.child("1").update({
				choice: move,
				imgUrl: imgUrl
			});
		// If it is player 2's move, just update "turn", "choice" & "imgUrl"
		// Note: activate the below line if you want to disallow remote computer player from selecting their opponent's move choice
		//} else if (turnCount == 2 && myPlayerNumber == 2) {
		} else if (turnCount == 2) {
			// Increment turnCount so that it can be reset to 1
			turnCount += 1;

			// Update player 1 play area content with move chosen display content
			game.showMoveSelected(imgUrl, $('#player2'));

			// Set turnCount with updated value
			dbObj.turnRef.set(turnCount);

			// Add "choice" as child to players "2" object
			dbObj.playersRef.child("2").update({
				choice: move,
				imgUrl: imgUrl
			});
		} 
		/* Note: activate this else block if you chose to prevent a remote player from from selecting their opponent's move choice
		else {
			game.showModal("Sorry, but you just tried an illegal move, man!");
		}*/
	});

	// Click handler for reset game button, to erase db data and restore game defaults
	$('#reset-btn').on('click', function() {
		db.ref().remove();
	});

	// Click handler for chat input
	$('.share-icon').on('click', function() {
		var text = $('#chat-input').val().trim();
		console.log("Chat text: " + text);

		// If there is nothing entered, do not submit message
		if (text == "") {
			game.showModal("You didn't enter a message!");
			return false;
		}

		// Add player's name to their text message, for display in chat window. If page was reloaded (erasing their local name), load session var
		if (myPlayerName == "" && localStorage.getItem("myPlayerName") != "") {
			myPlayerName = localStorage.getItem("myPlayerName");
		}

		text = myPlayerName + ": " + text;

		// Clear out the chat text input after it is submitted
		$('#chat-input').val("");

		// Set chat state so that db will only update the chat area when a message has been entered (otherwise will append when player chooses move)
		chatMsgEntered = true;

		// Update the chat node with the chat input text
		dbObj.chatRef.set(text);
		/*
		db.ref().update({
			chat: text
		});*/

		//dbObj.updateChat();

	});

	// Click handler for play/pause bg music control. Initialize default data state first (pause icon displayed initially)
	var musicState = "glyphicon-pause";
	$('#music-controls').on('click', function() {
		if (musicState == "glyphicon-pause") {
			// Pause the bg music
			document.getElementById("bg-music").pause();
			var icon = $(this).data("play");
			$(this).removeClass(musicState);
			$(this).addClass(icon);
			// Reset musicState
			musicState = "glyphicon-play-circle";
		} else {
			// Play the bg music
			document.getElementById("bg-music").play();
			var icon = $(this).data("pause");
			$(this).removeClass(musicState);
			$(this).addClass(icon);
			// Reset musicState
			musicState = "glyphicon-pause";
		}

	});

	// Allow user to enter their player name via the "Enter" key
 	$('input.player-join-input').keypress(function(e) {
        if (e.which == 13) {
            $("span.plus-icon").click();
        }
    });

    // Allow user to enter their chat message via the "Enter" key
 	$('input#chat-input').keypress(function(e) {
        if (e.which == 13) {
        	// Run the click handler for chat input action
            $("span.share-icon").click();
        }
    });
}); 