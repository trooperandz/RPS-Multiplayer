# RPS - Multiplayer

> This assignment is designed to familiarize students with the Google Firebase database service.  Users play rock, paper, scissors against another player, and content updates in real-time on both players' machines from the Firebase database protocol.

# This repository contains the following folders/files:

### Root files
 * index.html
 * index.php
 * composer.json

### assets/css
 * game.css
 * dashboard.css
 * Note: The program includes Bootstrap's core CSS code, delivered from Bootstrap's CDN
 
### assets/js
 * game.js
 * Note: The program includes Bootstrap's core js code, delivered from Bootstrap's CDN
 * Note: The program includes Firebase's core js library for db connection and functionality

### assets/sounds
 * Note: this directory contains game background music and game play alert/action sounds

### assets/img
 * Note: this directory contains: Rock, paper, scissors images, and player icon images

## Program General Information:

 * JS objects were used for housing main game properties and methods.

 * Bootstrap was used for the structure of this project.

 * The project layout is in a dashboard-style format, with the player dashboard on the left sidebar, and the main game content area on the right.

 * Rock, Paper, Scissors actions are represented by images.

 * The site is fully responsive.

 * A modal is used for all important user messages instead of alert boxes.

 * Game sounds are available for the following: modal alert message, player join alert, move choice selection click, battle concluded action, player turn action alert 

 * Player is allowed to play/pause the background music via a button

 * Designated user may reset the game (resets db) via a reset button