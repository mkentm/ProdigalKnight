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
    var levelScores = doc.querySelectorAll('.levelScore');
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
    var user;

    /*============================================================================================*/
    /* Initialize Game */
    /*============================================================================================*/
    this.initGame = function () {
        settings = {
            music: false,
            sound: false
        };
        setupUser();
        bindMenuEvents();
        animationSpeed = 300;
    };

    /*============================================================================================*/
    /* Utility / Mathematical / Miscellaneous */
    /*============================================================================================*/
    function get(a) {
        return doc.getElementById(a);
    }

    // class helpers - source: http://rockycode.com/blog/addremove-classes-raw-javascript/
    function hasClass(ele, cls) {
        return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    function addClass(ele, cls) {
        if (!hasClass(ele, cls)) ele.className += " " + cls;
    }

    function rmvClass(ele, cls) {
        if (hasClass(ele, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            ele.className = ele.className.replace(reg, ' ');
        }
    }

    // local storage helpers - source: http://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage/3146971#3146971
    Storage.prototype.setObject = function (key, value) {
        this.setItem(key, JSON.stringify(value));
    };

    Storage.prototype.getObject = function (key) {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    };

    Storage.prototype.removeObject = function (key) {
        this.removeItem(key);
    };

    // add commas to large numbers - source: http://stackoverflow.com/questions/6392102/add-commas-to-javascript-output
    function commas(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
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
        console.log("![" + parseInt(this.getAttribute('rel'), 10) + "]");
        if (!hasClass(this, 'disabled')) {
            hideWindows();
            $(gameWindow).stop().fadeTo(animationSpeed, 1);
            var script = document.createElement("script");
            script.src = "scripts/game.js";
            script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    }

    /*============================================================================================*/
    /* User */
    /*============================================================================================*/
    function setupUser () {
        user = localStorage.getObject('prodigalKnightUser') || {
            highestLevelBeaten: 0,
            levels: [
                {score: 0},
                {score: 0},
                {score: 0},
                {score: 0},
                {score: 0},
                {score: 0},
                {score: 0},
                {score: 0},
                {score: 0},
                {score: 0}
            ],

            overall: {
                score: 0,
                levelsPlayed: 0,
                timePlayed: 0
            }
        };
        syncDOM();
    }

    /*============================================================================================*/
    /* Sync Level to user object */
    /*============================================================================================*/
    function syncDOM () {
        // levels
        var i = levelButtons.length;
        while (i--) {
            if (i > user.highestLevelBeaten) {
                addClass(levelButtons[i], 'disabled');
            } else {
                rmvClass(levelButtons[i], 'disabled');
            }
            levelScores[i].innerHTML = (user.levels[i].score == 0) ? '&#8709;' : commas(user.levels[i].score);
        }
        // set completed levels display
        completedLevelsDisplay.innerHTML = user.highestLevelBeaten;
    }
}; // end game