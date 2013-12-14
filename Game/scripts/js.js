$(window).load(function () {
    $(this).remove();
    $('#menu-bar').stop().fadeTo(0, 1);
    $('#main').stop().fadeTo(0, 1);
    var pk = new ProdigalKnight();
    pk.initGame();
});

var ProdigalKnight = function () {
    var self = this;
    var doc = document;

    /*============================================================================================*/
    /* Utility / Mathematical / Miscellaneous */
    /*============================================================================================*/
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
    self.menuBar = self.get('menu-bar');
    self.windows = doc.querySelectorAll('.window');
    self.mainWindow = self.get('main');
    self.gameWindow = self.get('game');

    // button content
    // - main
    self.playGameButton = self.get('playGameBtn');
    self.overallStatsButton = self.get('overallStatsBtn');
    self.resetGameDataButton = self.get('resetGameDataBtn');

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