var gamePattern = []
var userClickedPattern = []
var level = 0
var started = false

function playSound(name){

    switch (name){

        case 'red':
            var redSound = new Audio('sounds/red.mp3')
            redSound.play()
            break
        case 'blue':
            var blueSound = new Audio('sounds/blue.mp3')
            blueSound.play()
            break
        case 'green':
            var greenSound = new Audio('sounds/green.mp3')
            greenSound.play()
            break
        case 'yellow':
            var yellowSound = new Audio('sounds/yellow.mp3')
            yellowSound.play()
            break
        default: break

    }

}

function animatePress(currentColor){

    var color = '#' + currentColor
    $(color).addClass('pressed')

    setTimeout(function(){
        $(color).removeClass('pressed')
    }, 100)

}

function nextSequence(){

    userClickedPattern = []

    var randomNumber = Math.floor(Math.random() * 4)
    var buttonColors = ["red", "blue", "green", "yellow"]

    var randomChosenColor = buttonColors[randomNumber]
    gamePattern.push(randomChosenColor)
    // $("#" + randomChosenColor).fadeOut(100).fadeIn(100)

    playSound(randomChosenColor)
    animatePress(randomChosenColor)

    level += 1  
    $('#level-title').text("Level " + level)

    }


$('.btn').click(function(){
    var userChosenColor = $(this).attr('id')
    userClickedPattern.push(userChosenColor)
    playSound(userChosenColor)
    animatePress(userChosenColor)
    checkAnswer(userClickedPattern.length - 1)
})



$(document).keydown(function(event){


    if(!started){

            $('#level-title').text("Level " + level)
            nextSequence()
            started = true
            

    }

})

function checkAnswer(currentLevel){


    if(gamePattern[currentLevel] === userClickedPattern[currentLevel]){

        // console.log(gamePattern[currentLevel])
        // console.log(userClickedPattern[currentLevel])
        // console.log(gamePattern)
        // console.log(userClickedPattern)

        if (gamePattern.length == userClickedPattern.length){

            setTimeout(function(){
                nextSequence()
            }, 1000)

        }

    }

    else{
        var wrongSound = new Audio('sounds/wrong.mp3')
        wrongSound.play()

        $('body').addClass('game-over')
        setTimeout(function(){
            $('body').removeClass('game-over')
        }, 200)

        $('h1').text('Game Over, Press Any Key to Restart')

        startOver()


    }

}

function startOver(){

    level = 0
    gamePattern = []
    userClickedPattern = []
    started = false

}

