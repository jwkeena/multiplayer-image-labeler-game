// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmhH-MHk71LAzeyzO5dlvTbhdNVAol1Yw",
    authDomain: "fir-test-cfa84.firebaseapp.com",
    databaseURL: "https://fir-test-cfa84.firebaseio.com",
    projectId: "fir-test-cfa84",
    storageBucket: "fir-test-cfa84.appspot.com",
    messagingSenderId: "694044494784"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Create shorthand firebase variable
const database = firebase.database();

// Initialize global variables
let player1Name = "";
let player2Name = "";
let score = 0;
let livesRemaining = 5;
let currentRound = 0;
let successfulMatches = [];
let unsuccessfulMatches = [];
let player1WrongGuess = "";
let player2WrongGuess = "";
let localGifUrl = "";
let isPlayerOneSetUpLocally = false;
let isPlayerTwoSetUpLocally = false;

// Game functions
const game = {

    // Displays player's name on screen
    updatePlayerName: function (spanID, newName) {
        $(spanID).text(newName);
    },

    updateSuccessfulMatches: function(answer) {
        database.ref().child("matches/successful").push(
            {answer: answer});
    },

    // Pushes both wrong answers to separate branches, so they can be identified later
    updateUnsuccessfulMatches: function(answer, wrongGuess) {
        database.ref().child("matches/unsuccessful/player1").push(
            {answer: answer});
            
        database.ref().child("matches/unsuccessful/player2").push(
            {wrongGuess: wrongGuess});
       },

    // Gets random gif from GIPHY API
    getNewGif: function() {
        $.ajax(
            {url: "https://api.giphy.com/v1/gifs/random?&q=&api_key=0390oddk4iEFytYmuT0Y4rBFADo3F1j0&rating=pg-13",
            method: "GET"})
            .then(function (response) {
                let newUrl = response.data.fixed_height_downsampled_url;
                localGifUrl = newUrl;
                database.ref().update({
                    currentGifURL: newUrl,
                    hasGifURLBeenChosenAlready: true
                });
              });
    },

    displayNewGif: function() {
        database.ref().once("value", function (snapshot) {
            let newSrc = snapshot.val().currentGifURL;
            $("#gif").attr("src", newSrc);
        })
    },

    setUpPlayerOneLocally: function() {
        // Controls can be disabled only if another set remains enabled
        if (isPlayerOneSetUpLocally === true && isPlayerTwoSetUpLocally === false) {
            // Disable other player's buttons locally
            $("#player-2-choice").attr("disabled", true);
            $("#name-set-2").attr("disabled", true);
            $("#player-2-answer").attr("disabled", true);
            $("#name-choice-2").attr("disabled", true);
            $("#status-prefix-2").css("background-color", "rgb(90,170,255)");
            $("#answer-2").attr("disabled", true);
        }
    },

    setUpPlayerTwoLocally: function() {
        // Controls can be disabled only if another set remains enabled
        if (isPlayerTwoSetUpLocally === true && isPlayerOneSetUpLocally === false) {
            // Disable other player's buttons locally
            $("#player-1-choice").attr("disabled", true);
            $("#name-set-1").attr("disabled", true);
            $("#player-1-answer").attr("disabled", true);
            $("#name-choice-1").attr("disabled", true);
            $("#status-prefix-1").css("background-color", "rgb(90,170,255)");
            $("#answer-1").attr("disabled", true);
            }
    },

    readyPlayerOneInFirebase: function() {
        // Only sets up player in firebase if the other player has NOT been set up
        database.ref().once("value", function (snapshot) {
            if (snapshot.val().isPlayerOneReady === false) {
                if (isPlayerOneSetUpLocally === true) {
                    database.ref().update({
                        isPlayerOneReady: true
                    })
                };
            }
        })
        
    },

    readyPlayerTwoInFirebase: function() {
        // Only sets up player in firebase if the other player has NOT been set up
        database.ref().once("value", function (snapshot) {
            if (snapshot.val().isPlayerTwoReady === false) {
                if (isPlayerTwoSetUpLocally === true) {
                    database.ref().update({
                        isPlayerTwoReady: true
                    })
                };
            }
        })
        
    },

    enableAllControls: function() {
        // Re-enable player1's controls
        $("#player-1-choice").attr("disabled", false);
        $("#name-set-1").attr("disabled", false);
        $("#player-1-answer").attr("disabled", false);
        $("#name-choice-1").attr("disabled", false);
        $("#status-prefix-1").css("background-color", "rgb(0,123,255)");
        $("#answer-1").attr("disabled", false);

        // Re-enable player2's controls
        $("#player-2-choice").attr("disabled", false);
        $("#name-set-2").attr("disabled", false);
        $("#player-2-answer").attr("disabled", false);
        $("#name-choice-2").attr("disabled", false);
        $("#status-prefix-2").css("background-color", "rgb(0,123,255)");
        $("#answer-2").attr("disabled", false);
    },
    
    // Clears current answers in firebase
    clearCurrentAnswers: function() {
        database.ref().child("currentAnswers").update({
            playerOneAnswer: "",
            playerTwoAnswer: ""
        });
    },

    // Update score
    increaseScore: function() {
        // This method works, but .transaction doesn't
        score++
        database.ref().update({
            currentScore: score
        });
        game.clearCurrentAnswers();
    },

    //Update lives remaining
    decrementLives: function() {
        livesRemaining--
        database.ref().update({
            currentLives: livesRemaining
        })
        game.clearCurrentAnswers();
    },

    // Increment round, reset lives, get new gif
    nextRound: function() {
        currentRound++
        database.ref().update({
            currentRound: currentRound
        })

        database.ref().child("currentLives").update({
            currentLives: 5
        });

        game.getNewGif();
    }
}

// Functions to run on page load
    $("#name-1").text("");
    $("#name-2").text("");
    database.ref().update({
        isPlayerOneReady: false,
        isPlayerTwoReady: false,
        isGameRunning: false,
        currentGifURL: "",
        hasGifURLBeenChosenAlready: false,
        currentRound: 0,
        currentLives: 5,
        currentScore: 0,
        });
    database.ref().child("currentUsers").update({
        player1: "",
        player2: ""
    })
    database.ref().child("currentAnswers").update({
        playerOneAnswer: "",
        playerTwoAnswer: ""
    })
    database.ref().child("matches").set({

    })

// Event listeners

    // New name, gif url, score, lives, and round listener
    database.ref().on("value", function(snapshot) {
        // Only change gif url if it's been newly chosen for the current round
        if (snapshot.val().hasGifURLBeenChosenAlready === true) {
            localGifUrl = snapshot.val().currentGifURL;
            game.displayNewGif();
        }

        player1Name = snapshot.val().currentUsers.player1;
        player2Name = snapshot.val().currentUsers.player2;

        // Update isGameRunningLocally variable
        isGameRunningLocally = snapshot.val().isGameRunning;

        // Update score
        score = snapshot.val().currentScore;
        $("#score").text(score);

        // Update round number
        round = snapshot.val().currentRound;
        $("#current-round").text(round);

            // Check if the game is over
            if (round > 10) {
                console.log("game is over")
                //game.endGame();
            }

        // Update lives
        lives = snapshot.val().currentLives;
        $("#current-lives").text(lives);
            
            // Check if all lives have been lost
            if (lives === 0) {
                console.log("line 245")
                game.nextRound();
            } else {
                $("#lives-remaining").text(livesRemaining);
            } 
    });

    // Correct answer listener
    database.ref().child("matches/successful").on("child_added", function (snapshot) {
        correctAnswer = snapshot.val().answer;
        let newListItem = $("<li>" + correctAnswer + "</li>");
        $("#successful-matches").append(newListItem);
    });

    // Incorrect answer listener, player1
    database.ref().child("matches/unsuccessful/player1").on("child_added", function (snapshot) {
        incorrectAnswer = snapshot.val().answer;
        let newListItem = $("<li>" + incorrectAnswer + " (" + player1Name + ")</li>");
        $("#unsuccessful-matches").append(newListItem);
    });

    // Incorrect answer listener, player2
    database.ref().child("matches/unsuccessful/player2").on("child_added", function (snapshot) {
        incorrectAnswer = snapshot.val().wrongGuess;
        let newListItem = $("<li>" + incorrectAnswer + " (" + player2Name + ")</li>");
        $("#unsuccessful-matches").append(newListItem);
    });

    // Disable other player's controls remotely listener. When firebase updates, check if other player is ready
    database.ref().on("value", function(snapshot) {
        if (snapshot.val().isPlayerOneReady === true) {
            // If the other player picked player1, player2 is picked automatically
            // Update player status
            $("#player-1-status").text("Connected & ready")
            isPlayerTwoSetUpLocally = true;
            game.setUpPlayerTwoLocally();
            game.readyPlayerTwoInFirebase();
        } else if (snapshot.val().isPlayerTwoReady === true) { 
            // Update player status
            $("#player-2-status").text("Connected & ready")
            isPlayerOneSetUpLocally = true;
            game.setUpPlayerOneLocally();
            game.readyPlayerOneInFirebase();
        } else {
            return;
        }
    });
   
    // Listen for one or both players being ready, then start the game
    database.ref().on("value", function(snapshot) {
        if (snapshot.val().isGameRunning === false && (snapshot.val().currentUsers.player1) && (snapshot.val().currentUsers.player2)){

            database.ref().update({
                isGameRunning: true
            });

            // Updates whichever player's status is missing
            $("#player-1-status").text("Connected & ready");
            $("#player-2-status").text("Connected & ready");

            game.nextRound();
         }
    });

    // Answer submission listeners
    $("#player-1-answer").on("click", function () {
        let answer = $("#answer-1").val().trim().toLowerCase();
        player1WrongGuess = answer;

        // In case the player hasn't chosen a name, don't ping database
        if (player1Name === "") {
            alert("Choose your name to connect online first!");
        }
        // In case the form is left empty, don't ping database
        else if (answer === "") {
            alert("Type an answer before submitting!")
        } 
            // Otherwise, ping firebase 
            else {
                //Update answer in database
                database.ref().child("currentAnswers").update(
                    {playerOneAnswer: answer}, 
                );

                // Then check if there's an answer from playerTwo
                // MUST use .once method, otherwise promise resolves multiple times
                database.ref().once("value", function (snapshot) {
                    playerOneAnswer = snapshot.val().currentAnswers.playerOneAnswer;
                    playerTwoAnswer = snapshot.val().currentAnswers.playerTwoAnswer;

                    // If there's no answer yet, display waiting message
                    if (playerTwoAnswer === "") {
                        alert("Answer submitted. Waiting on player2...")
                        //update this to status in HTML
                    } 
                        // If there is an answer, check if they match
                        else {
                            if (playerOneAnswer === playerTwoAnswer) {
                                alert("it's a match! you both guessed " + answer + "!");
                                game.updateSuccessfulMatches(answer);
                                game.increaseScore();
                            } else {
                                alert("the other player guessed " + playerTwoAnswer + " instead");
                                
                                // Display this player's wrong answer; then, the other's 
                                game.updateUnsuccessfulMatches(answer, playerTwoAnswer);
                                game.decrementLives();
                            }
                        }
                    })
            }
    });

    $("#player-2-answer").on("click", function () {
        let answer = $("#answer-2").val().trim().toLowerCase();
        player2WrongGuess = answer;

        // In case the player hasn't chosen a name, don't ping database
        if (player2Name === "") {
            alert("Choose your name to connect online first!");
        }
        // In case the form is left empty, don't ping database
        else if (answer === "") {
            alert("Type an answer before submitting!")
        } 
            // Otherwise, ping firebase 
            else {
                //Update answer in database
                database.ref().child("currentAnswers").update(
                    {playerTwoAnswer: answer}, 
                );

                // Then check if there's an answer from playerOne
                // MUST use .once method, otherwise promise resolves multiple times
                database.ref().once("value", function (snapshot) {
                    playerOneAnswer = snapshot.val().currentAnswers.playerOneAnswer;
                    playerTwoAnswer = snapshot.val().currentAnswers.playerTwoAnswer;

                    // If there's no answer yet, display waiting message
                    if (playerOneAnswer === "") {
                        alert("Answer submitted. Waiting on player 1...")
                        //update this to status in HTML
                    } 
                        // If there is an answer, check if they match
                        else {
                            if (playerTwoAnswer === playerOneAnswer) {
                                alert("it's a match! you both guessed " + answer + "!");
                                game.updateSuccessfulMatches(answer);
                                game.increaseScore();
                            } else {
                                alert("the other player guessed " + playerOneAnswer + " instead");
                                // Display this player's wrong answer; then, the other's 
                                game.updateUnsuccessfulMatches(answer, playerOneAnswer);
                                
                                game.decrementLives();
                            }
                        }
                    })
            }
    });


    // Local name change listeners
    $("#name-set-1").on("click", function () {
        newNamePlayer1 = $("#name-choice-1").val().trim();
        player1Name = newNamePlayer1;
        database.ref().child("currentUsers").update(
            {player1: newNamePlayer1}, 
        );
        $("#player-1-status").text("Connected & ready");
        game.updatePlayerName("#name-1", newNamePlayer1);
        isPlayerOneSetUpLocally = true;
        game.setUpPlayerOneLocally();
        game.readyPlayerOneInFirebase();
    });

    $("#name-set-2").on("click", function () {
        newNamePlayer2 = $("#name-choice-2").val().trim();
        player2Name = newNamePlayer2;
        database.ref().child("currentUsers").update(
            {player2: newNamePlayer2}, 
        );
        $("#player-2-status").text("Connected & ready");
        game.updatePlayerName("#name-2", newNamePlayer2);
        isPlayerTwoSetUpLocally = true;
        game.setUpPlayerTwoLocally();
        game.readyPlayerTwoInFirebase();

    });

    // Remote name change listener. Lets you know when the other player has joined
    // For some reason .on("child_changed") doesn't grab the snapshot...
    database.ref().on("value", function(snapshot) {
       // Only updates if the other player has updated their status in firebase
       if (snapshot.val().isPlayerOneReady === true) {
           newNamePlayer1 = snapshot.val().currentUsers.player1;
           game.updatePlayerName("#name-1", newNamePlayer1);
       }  
       if (snapshot.val().isPlayerTwoReady === true) {
            newNamePlayer2 = snapshot.val().currentUsers.player2;
            game.updatePlayerName("#name-2", newNamePlayer2);
       }
    })

    // Handle the errors
//     }, function(errorObject) {
//     console.log("Errors handled: " + errorObject.code);
//   });