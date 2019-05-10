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
let thisPlayer = "";
let player1Name = "";
let player2Name = "";
let score = 0;
let livesRemaining = 3;
let currentRound = 0;
let successfulMatches = [];
let unsuccessfulMatches = [];
let player1WrongGuess = "";
let player2WrongGuess = "";
let localGifUrl = "";
let isPlayerOneSetUpLocally = false;
let isPlayerTwoSetUpLocally = false;
let isRoundSwitching = false;
let hasPlayerSubmitted = false;

// Game functions
const game = {

    // Displays live alerts
    liveUpdate: function (alert) {
        $("#live-update").text(alert);
        $("#live-update").toggleClass("live-update-in");   
        setTimeout(function() {
            $("#live-update").removeClass().addClass("live-update-out");
        }, 2500);
        setTimeout(function() {
            $("#live-update").removeClass().text("");
        }, 5500);
    },
    
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
        setTimeout(game.clearCurrentAnswers(), 2000);

        // Resets bottleneck for round switching, so that an infinite loop isn't caused
        isRoundSwitching = false;
    },

    //Update lives remaining
    decrementLives: function() {
        livesRemaining--
        database.ref().update({
            livesRemaining
        })
        setTimeout(game.clearCurrentAnswers(), 2000);
    },

    // Increment round, reset lives, reset answers, get new gif
    nextRound: function() {
        // Increment round
        currentRound++
        database.ref().update({
            currentRound
        });

        // Reset lives
        database.ref().update({
            livesRemaining: 3
        });

        // Reset answers
        database.ref().child("matches").set({
        })

        // Get new gif
        game.getNewGif();
    }
}

// Functions to run on page load
    $("#name-1").text("");
    $("#name-2").text("");
    database.ref().update({
        livesRemaining: 3,
        isPlayerOneReady: false,
        isPlayerTwoReady: false,
        isGameRunning: false,
        currentGifURL: "",
        hasGifURLBeenChosenAlready: false,
        currentRound: 0,
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

        if (player1Name !== snapshot.val().currentUsers.player1) {
            player1Name = snapshot.val().currentUsers.player1;
            game.liveUpdate(player1Name + " has joined the game")
        }

        if (player2Name !== snapshot.val().currentUsers.player2) {
            player2Name = snapshot.val().currentUsers.player2;
            game.liveUpdate(player2Name + " has joined the game")
        }

        // Update isGameRunningLocally variable
        isGameRunningLocally = snapshot.val().isGameRunning;

        // Update score and display matching word
        if (score !== snapshot.val().currentScore) {
            score = snapshot.val().currentScore;
            $("#score").text(score);
        }
        
        // Update round number
        if (currentRound !== snapshot.val().currentRound) {
            currentRound = snapshot.val().currentRound;
            $("#current-round").text(currentRound);
            if (currentRound > 5) {
                game.liveUpdate("Game Over")
                //game.endGame();
            } else if (currentRound === 0) {
                return;
            } else {
                game.liveUpdate("Let round " + currentRound + " begin!");
            }
        };

        // Update lives
        if (livesRemaining !== snapshot.val().livesRemaining) {
            livesRemaining = snapshot.val().livesRemaining;
            $("#current-lives").text(livesRemaining);

            // Check if all lives have been lost
            if (livesRemaining === 0 && isRoundSwitching === false) {
                isRoundSwitching = true;
                game.nextRound();
            } else {
                $("#lives-remaining").text(livesRemaining);
            } 
        }
        
    });

    // Correct answer listener
    database.ref().child("matches/successful").on("child_added", function (snapshot) {
        game.increaseScore();
        hasPlayerSubmitted = false;

        correctAnswer = snapshot.val().answer;
        let newListItem = $("<li>" + correctAnswer + "</li>");
        $("#successful-matches").append(newListItem);
        game.liveUpdate("it's a match! you both guessed " + correctAnswer + "!");
    });

    // Incorrect answer listener, player1 node
    database.ref().child("matches/unsuccessful/player1").on("child_added", function (snapshot) {
        // Only need to decrement lives once, so I'll put it here and not in the next listener
        game.decrementLives();
        hasPlayerSubmitted = false;

        incorrectAnswer = snapshot.val().answer;

        if (thisPlayer === player1Name) {
            let newListItem = $("<li>" + incorrectAnswer + " (" + thisPlayer + ")</li>");
            $("#unsuccessful-matches").append(newListItem);
            // No update because the next event listener will take care of that
        } else {
            let newListItem = $("<li>" + incorrectAnswer + " (" + player1Name + ")</li>");
            $("#unsuccessful-matches").append(newListItem);
            game.liveUpdate("The other player guessed " + incorrectAnswer + " instead");
        }

    });

    // Incorrect answer listener, player2 node
    database.ref().child("matches/unsuccessful/player2").on("child_added", function (snapshot) {
        // Don't need to decrement lives twice
        incorrectAnswer = snapshot.val().wrongGuess;
        
        if (thisPlayer === player2Name) {
            let newListItem = $("<li>" + incorrectAnswer + " (" + thisPlayer + ")</li>");
            $("#unsuccessful-matches").append(newListItem);
            // No update because previous event listener took care of that
        } else {
            let newListItem = $("<li>" + incorrectAnswer + " (" + player2Name + ")</li>");
            $("#unsuccessful-matches").append(newListItem);
            game.liveUpdate("The other player guessed " + incorrectAnswer + " instead")
        }
        
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
        $("#answer-1").val("");

        // In case the player hasn't chosen a name, don't ping database
        if (player1Name === "") {
            game.liveUpdate("Choose your name to connect online first!");
        }
        // In case the form is left empty, don't ping database
        else if (answer === "") {
            game.liveUpdate("Type an answer before submitting!")
        } else if (hasPlayerSubmitted === true) {
            game.liveUpdate("You've already submitted an answer!")
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
                        game.liveUpdate("Answer submitted. Waiting on player2...");
                        hasPlayerSubmitted = true;
     
                    } 
                        // If there is an answer, check if they match
                        else {
                            if (playerOneAnswer === playerTwoAnswer) {
                                game.updateSuccessfulMatches(answer);
                            } else {
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
        $("#answer-2").val("");

        // In case the player hasn't chosen a name, don't ping database
        if (player2Name === "") {
            game.liveUpdate("Choose your name to connect online first!")
        }
        // In case the form is left empty, don't ping database
        else if (answer === "") {
            game.liveUpdate("Type an answer before submitting!");
        } else if (hasPlayerSubmitted === true) {
            game.liveUpdate("You've already submitted an answer!")
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
                        game.liveUpdate("Answer submitted. Waiting on player1...");
                        hasPlayerSubmitted = true;
                                          
                    } 
                        // If there is an answer, check if they match
                        else {
                            if (playerTwoAnswer === playerOneAnswer) {
                                game.liveUpdate("it's a match! you both guessed " + answer + "!");
                                game.updateSuccessfulMatches(answer);
                            } else {
                                game.liveUpdate("the other player guessed " + playerOneAnswer + " instead");
                                // Display this player's wrong answer; then, the other's 
                                game.updateUnsuccessfulMatches(answer, playerOneAnswer);
                            }
                        }
                    })
            }
    });


    // Local name change listeners
    $("#name-set-1").on("click", function () {
        newNamePlayer1 = $("#name-choice-1").val().trim();
        $("#name-set-2").val("");
        if (newNamePlayer1 === "") {
            game.liveUpdate("Pick a name first!");
        } else {
            thisPlayer = newNamePlayer1;
            player1Name = newNamePlayer1;
            database.ref().child("currentUsers").update(
                {player1: newNamePlayer1}, 
            );
            $("#player-1-status").text("Connected & ready");
            game.updatePlayerName("#name-1", newNamePlayer1);
            isPlayerOneSetUpLocally = true;
            game.setUpPlayerOneLocally();
            game.readyPlayerOneInFirebase();
        }
    });

    $("#name-set-2").on("click", function () {
        newNamePlayer2 = $("#name-choice-2").val().trim();
        $("#name-set-2").val("");
        if (newNamePlayer2 === "") {
            game.liveUpdate("Pick a name first!");
        } else {
            thisPlayer = newNamePlayer2;
            player2Name = newNamePlayer2;
            database.ref().child("currentUsers").update(
                {player2: newNamePlayer2}, 
            );
            $("#player-2-status").text("Connected & ready");
            game.updatePlayerName("#name-2", newNamePlayer2);
            isPlayerTwoSetUpLocally = true;
            game.setUpPlayerTwoLocally();
            game.readyPlayerTwoInFirebase();
        }
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