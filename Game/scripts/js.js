$(window).load(function () {
    $(this).remove();
    $('#menu-bar').stop().fadeTo(0, 1);
    $('#main').stop().fadeTo(0, 1);
    var pk = new ProdigalKnight();
    pk.initGame();
});

var ProdigalKnight = function () {
    var doc = document;
    var animationSpeed = 0;

    // window content
    var windows = doc.querySelectorAll('.window');
    var gameWindow = get('game');

    // button content
    // - main
    var playGameButton = get('playGameBtn');

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