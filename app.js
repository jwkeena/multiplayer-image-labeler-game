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

// Game functions
const game = {
    updatePlayerName: function (spanID, newName) {
        $(spanID).text(newName);
    },

    newGif: function() {
        $.ajax(
            {url: "https://api.giphy.com/v1/gifs/random?&q=&api_key=0390oddk4iEFytYmuT0Y4rBFADo3F1j0&rating=pg-13",
            method: "GET"})
            .then(function (response) {
                console.log(response.data)
                let newSrc = response.data.fixed_height_downsampled_url;
                $("#gif").attr("src", newSrc)
            })
    }   
}

//calls GIFS from the GIPHY API
function getGIFS (queryURL) {
    $.ajax(
        {url: queryURL,
        method: "GET"})
        .then(function (response) {
            console.log(response.data)
            let data = response.data;
            for (i=0; i < data.length; i++){

                //building new imageWrapper (to allow absolute position of rating)
                var imageWrapper = $("<div>")
                imageWrapper.css("position", "relative");
                imageWrapper.css("display", "inline-block");
                $(".gifs").prepend(imageWrapper);

                //building new gif
                var newImage = $("<img>");
                newImage.css("display", "inline-block");
                newImage.attr("class", "gif");
                newImage.attr("data-state", "still");
                newImage.attr("src", data[i].images.fixed_height_small_still.url);
                newImage.attr("data-still", data[i].images.fixed_height_small_still.url);
                newImage.attr("data-animate", data[i].images.fixed_height_small.url);
                imageWrapper.append(newImage)

                //attaching rating to each gif
                var newRating = $("<p>");
                newRating.text(data[i].rating);
                newRating.attr("class", "rating");
                imageWrapper.append(newRating);
            }
        }
    )
}

// Creates users node if it doesn't already exist on pageload
database.ref().once("value", function (snapshot) {
    
    // Grab and display stored player names
    if (snapshot.child("users").exists()) {
        
        player1NameStored = snapshot.val().users.player1;
        player2NameStored = snapshot.val().users.player2;

        $("#name1").text(player1NameStored)
        $("#name2").text(player2NameStored)

        return;
    // If there is no users node, create placeholder names
    } else {
        database.ref().set( {
            users: {
                player1: "Player 1",
                player2: "Player 2",
            }
        })
    }
})

// Event listeners


$("#name-set1").on("click", function () {
    event.preventDefault();
    newNamePlayer1 = $("#nameChoice1").val();
    database.ref().child("users").update(
        {player1: newNamePlayer1}, 
    );
    game.updatePlayerName("#name1", newNamePlayer1);
})

$("#name-set2").on("click", function () {
    event.preventDefault();
    newNamePlayer2 = $("#nameChoice2").val();
    database.ref().child("users").update(
        {player2: newNamePlayer2}, 
    );
    game.updatePlayerName("#name2", newNamePlayer2);
})

database.ref().on("child_added", function (snapshot) {
    let snap = snapshot.val();
    $("#firebase-log").prepend(snap.chat)

    // Handle the errors
    }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
  });