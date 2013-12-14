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
    var levelsWindow = get('levels');
    var overallStatsWindow = get('overall-stats');
    var gameWindow = get('game');
    // button content
    // - main
    var playGameButton = get('playGameBtn');
    var overallStatsButton = get('overallStatsBtn');
    // - main - levels
    var levelButtons = doc.querySelectorAll('.level');
    var returnFromLevelsToMainButton = get('returnFromLevelsToMainBtn');
    // - main - levels - misc
    var completedLevelsDisplay = get('completedLevels');
    // - main - overallStats
    var returnFromStatsToMainButton = get('returnFromStatsToMainBtn');
    // DOM Object
    var dom = {};
    dom.menuAudio = $('#audio-select');
    dom.menuBar = $('#menu-bar');
    dom.buttonAudioTrue = $('#audioTrue');
    dom.buttonAudioFalse = $('#audioFalse');
    var settings = {};

    /*============================================================================================*/
    /* Initialize Game */
    /*============================================================================================*/
    this.initGame = function () {
        settings = {
            music: false,
            sound: false
        };
        // set completed levels display
        completedLevelsDisplay.innerHTML = 0;
        bindMenuEvents();
        animationSpeed = 300;
    };

    /*============================================================================================*/
    /* Utility / Mathematical / Miscellaneous */
    /*============================================================================================*/
    function get(a) {
        return doc.getElementById(a);
    }

    /*============================================================================================*/
    /* Menu Interaction / Event Binding */
    /*============================================================================================*/
    // hide all windows
    function hideWindows() {
        $(windows).fadeTo(animationSpeed, 0, function () {
            $(this).hide();
        });
    }

    // bind button events
    function bindMenuEvents() {
        playGameButton.addEventListener('click', playGame, false);
        returnFromLevelsToMainButton.addEventListener('click', returnToMain, false);
        overallStatsButton.addEventListener('click', overallStats, false);
        returnFromStatsToMainButton.addEventListener('click', returnToMain, false);

        dom.buttonAudioTrue.click('click', function (e) {
            e.preventDefault();
            hideWindows();
            dom.menuBar.stop().fadeTo(animationSpeed, 1);
            $(mainWindow).stop().fadeTo(animationSpeed, 1, function () {
                settings.music = true;
                settings.sound = true;
                $('#music')[0].play();
            });
        });

        dom.buttonAudioFalse.click('click', function (e) {
            e.preventDefault();
            $('#toggleMusic').addClass('off');
            $('#toggleSound').addClass('off');
            hideWindows();
            dom.menuBar.stop().fadeTo(animationSpeed, 1);
            $(mainWindow).stop().fadeTo(animationSpeed, 1);
        });

        // bind all levels
        var i = levelButtons.length;
        while (i--) {
            levelButtons[i].addEventListener('click', startLevel, false);
        }

        $('#toggleMusic').click('click', function (e) {
            e.preventDefault();
            settings.music = !settings.music;
            $(this).toggleClass('off');
            if (settings.music) {
                $('#music')[0].play();
            } else {
                $('#music')[0].pause();
            }
        });
    }

    function playGame(e) {
        e.preventDefault();
        hideWindows();
        $(levelsWindow).stop().fadeTo(animationSpeed, 1);

    }

    function overallStats(e) {
        e.preventDefault();
        hideWindows();
        $(overallStatsWindow).stop().fadeTo(animationSpeed, 1);
    }

    function returnToMain(e) {
        e.preventDefault();
        hideWindows();
        $(mainWindow).stop().fadeTo(animationSpeed, 1);
    }

    function startLevel(e) {
        e.preventDefault();
        hideWindows();
        $(gameWindow).stop().fadeTo(animationSpeed, 1);
        var script = document.createElement("script");
        script.src = "scripts/game.js";
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
    }
}; // end game