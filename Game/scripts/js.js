$(window).load(function () {
    $('#loading').fadeTo(800, 0, function () {
        $(this).remove();
        setTimeout(function () {
            $('#cover').fadeTo(800, 0, function () {
                $(this).remove();
            });
            var pk = new ProdigalKnight();
            pk.initGame();
        }, 1000);
    });
});

var ProdigalKnight = function () {
    var doc = document;
    var animationSpeed = 0;
    // window content
    var mainWindow = get('main');
    var windows = doc.querySelectorAll('.window');
    var gameWindow = get('game');
    // button content
    // - main
    var playGameButton = get('playGameBtn');
    // DOM Object
    var dom ={};
    dom.menuAudio = $('#audio-select');
    dom.menuBar = $('#menu-bar');
    dom.buttonAudioTrue = $('#audioTrue');
    dom.buttonAudioFalse = $('#audioFalse');

    /*============================================================================================*/
    /* Initialize Game */
    /*============================================================================================*/
    this.initGame = function () {
        bindMenuEvents();
        animationSpeed = 300;
    };

    /*============================================================================================*/
    /* Utility / Mathematical / Miscellaneous */
    /*============================================================================================*/
    function get (a) {
        return doc.getElementById(a);
    }

    /*============================================================================================*/
    /* Menu Interaction / Event Binding */
    /*============================================================================================*/
    // hide all windows
    function hideWindows () {
        $(windows).fadeTo(animationSpeed, 0, function () {
            $(this).hide();
        });
    }

    // bind button events
    function bindMenuEvents () {
        playGameButton.addEventListener('click', playGame, false);

        dom.buttonAudioTrue.click('click', function (e) {
            e.preventDefault();
            hideWindows();
            dom.menuBar.stop().fadeTo(animationSpeed, 1);
            $(mainWindow).stop().fadeTo(animationSpeed, 1);
        });

        dom.buttonAudioFalse.click('click', function (e) {
            e.preventDefault();
            $('#toggleMusic').addClass('off');
            $('#toggleSound').addClass('off');
            hideWindows();
            dom.menuBar.stop().fadeTo(animationSpeed, 1);
            $(mainWindow).stop().fadeTo(animationSpeed, 1);
        });
    }

    function playGame (e) {
        e.preventDefault();
        hideWindows();
        $(gameWindow).stop().fadeTo(animationSpeed, 1);
        var script = document.createElement("script");
        script.src = "scripts/game.js";
        script.type="text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}; // end game