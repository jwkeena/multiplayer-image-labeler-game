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

// Game functions
const game = {

    // Displays player's name on screen
    updatePlayerName: function (spanID, newName) {
        $(spanID).text(newName);
    },

    // Deletes display to prevent duplicates and rewrites all items in array to add the newest one
    updateSuccessfulMatches: function() {
        $("#successful-matches").empty();
        for (i=0; i < successfulMatches.length; i++) {
            $("#successful-matches").append("<li>" + successfulMatches[i] + "</li>");
        }
    },

    // Deletes display to prevent duplicates and rewrites all items in array to add the newest one
    updateUnsuccessfulMatches: function() {
        $("#unsuccessful-matches").empty();

        // Increment by two, since every other item in the array is the player's name who made the guess
        for (i=0; i < unsuccessfulMatches.length; i += 2) {
            j = i + 1;
            $("#unsuccessful-matches").append("<li>" + unsuccessfulMatches[i] + " (" + unsuccessfulMatches[j] + ")</li>");
        }
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
                    currentGifURL: newUrl
                });
              });
    },

    displayNewGif: function() {
        database.ref().once("value", function (snapshot) {
            let newSrc = snapshot.val().currentGifURL;
            $("#gif").attr("src", newSrc);
        })
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
        score++;
        $("#score").text(score);
        game.clearCurrentAnswers();
    },

    //Update lives remaining
    decrementLives: function() {
        livesRemaining--;
        
        if (livesRemaining === 0) {
            game.nextRound();
            game.clearCurrentAnswers();
        } else {
            $("#lives-remaining").text(livesRemaining);
            game.clearCurrentAnswers();
        }
    },

    // Reset round and lives
    nextRound: function() {
        currentRound++;

        // Check if the game is over
        if (currentRound > 10) {
            //game.endGame();
        } else {
            $("#current-round").text(currentRound)
            livesRemaining = 5;
            $("#lives-remaining").text(livesRemaining);
        }
    }
}

// Clears current answers on page load
game.clearCurrentAnswers();

// Grab and display names of last players who played
database.ref().once("value", function (snapshot) {
    
    player1Name = snapshot.val().currentUsers.player1;
    player2Name = snapshot.val().currentUsers.player2;

    unsuccessfulMatches.player1Name = player1Name;
    unsuccessfulMatches.player2Name = player2Name;

    $("#name1").text(player1Name)
    $("#name2").text(player2Name)

})

// Event listeners

    // New gif url listener
    database.ref().on("child_changed", function(snapshot) {
        if (localGifUrl === snapshot.val().currentGifURL) {
            return;
        } else {
            localGifUrl = snapshot.val().currentGifURL;
            game.displayNewGif();
        }
    });

    // Answer submission listeners
    $("#player-1-answer").on("click", function () {
        let answer = $("#answer1").val().trim().toLowerCase();
        player1WrongGuess = answer;

        // In case the form is left empty, don't ping database
        if (answer === "") {
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
                    playerTwoAnswer = snapshot.val().currentAnswers.playerTwoAnswer;

                    // If there's no answer yet, display waiting message
                    if (playerTwoAnswer === "") {
                        alert("Answer submitted. Waiting on player2...")
                        //update this to status in HTML
                    } 
                        // If there is an answer, check if they match
                        else {
                            if (answer === playerTwoAnswer) {
                                alert("it's a match! you both guessed " + answer + "!");
                                successfulMatches.push(answer);
                                game.updateSuccessfulMatches();
                                game.increaseScore();
                            } else {
                                alert("the other player guessed " + playerTwoAnswer + " instead");
                                
                                // Display this player's wrong answer; then, the other's 
                                unsuccessfulMatches.push(answer);
                                unsuccessfulMatches.push(player1Name);
                                unsuccessfulMatches.push(player2WrongGuess);
                                unsuccessfulMatches.push(player2Name)
                                game.updateUnsuccessfulMatches();

                                game.decrementLives();
                            }
                        }
                    })
            }
    })

    $("#player-2-answer").on("click", function () {
        let answer = $("#answer2").val().trim().toLowerCase();
        player2WrongGuess = answer;

        // In case the form is left empty, don't ping database
        if (answer === "") {
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

                    // If there's no answer yet, display waiting message
                    if (playerOneAnswer === "") {
                        alert("Answer submitted. Waiting on player 1...")
                        //update this to status in HTML
                    } 
                        // If there is an answer, check if they match
                        else {
                            if (answer === playerOneAnswer) {
                                alert("it's a match! you both guessed " + answer + "!");
                                successfulMatches.push(answer);
                                game.updateSuccessfulMatches();
                                game.increaseScore();
                            } else {
                                alert("the other player guessed " + playerOneAnswer + " instead");
                                // Display this player's wrong answer; then, the other's 
                                unsuccessfulMatches.push(answer);
                                unsuccessfulMatches.push(player2Name);
                                unsuccessfulMatches.push(player1WrongGuess);
                                unsuccessfulMatches.push(player1Name);
                                game.updateUnsuccessfulMatches();
                                
                                game.decrementLives();
                            }
                        }
                    })
            }
    })


    // Name change listeners
    $("#name-set1").on("click", function () {
        event.preventDefault();
        newNamePlayer1 = $("#nameChoice1").val().trim();
        database.ref().child("currentUsers").update(
            {player1: newNamePlayer1}, 
        );
        unsuccessfulMatches.player1Name = player1Name;
        unsuccessfulMatches.player2Name = player2Name;
        game.updatePlayerName("#name1", newNamePlayer1);
    })

    $("#name-set2").on("click", function () {
        event.preventDefault();
        newNamePlayer2 = $("#nameChoice2").val().trim();
        database.ref().child("currentUsers").update(
            {player2: newNamePlayer2}, 
        );
        unsuccessfulMatches.player1Name = player1Name;
        unsuccessfulMatches.player2Name = player2Name;
        game.updatePlayerName("#name2", newNamePlayer2);
    })

    // Handle the errors
//     }, function(errorObject) {
//     console.log("Errors handled: " + errorObject.code);
//   });