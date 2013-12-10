$(window).load(function () {
    var pk = new ProdigalKnight();
    pk.initGame();
});

var ProdigalKnight = function () {
    var self = this;
    var doc = document;

    // getElementById()
    self.get = function (a) {
        return doc.getElementById(a);
    };

    /*============================================================================================*/
    /* Initialize Game */
    /*============================================================================================*/
    self.initGame = function () {
        self.bindMenuEvents();
        self.animationSpeed = 300;
    };

    /*============================================================================================*/
    /* Menu Interaction / Event Binding */
    /*============================================================================================*/
    // window content
    self.gameWrap = self.get('game-wrap');
    self.mainWindow = self.get('main');
    self.windows = doc.querySelectorAll('.menu');

    self.gameWindow = self.get('game');

    // button content
    self.playGameButton = self.get('playGameBtn');

    // hide all windows
    self.hideWindows = function () {
        $(self.windows).fadeTo(self.animationSpeed, 0, function () {
            $(this).hide();
        });
    };

    // bind button events
    self.bindMenuEvents = function () {
        self.playGameButton.addEventListener('click', self.playGame, false);
    };

    self.playGame = function (e) {
        e.preventDefault();
        self.hideWindows();
        $(self.gameWindow).stop().fadeTo(self.animationSpeed, 1);
        var e = document.createElement("script");
        e.src = "scripts/game.js";
        e.type="text/javascript";
        document.getElementsByTagName("head")[0].appendChild(e);
    };
}; // end game