var canvas;
var context;

var gameW = 800;
var gameH = 640;

var hero = null;
var lastUpdate = null;

var fps = 30;
var timerRatio = 1000 / fps;

/*===================================================================================================================*/
/*Загрузка */
/*===================================================================================================================*/
$(window).load(function () {
    canvas = document.getElementById("movement");
    context = canvas.getContext("2d");
    canvas.width = gameW;
    canvas.height = gameH;
    context.fillStyle = "#5C3F25";
    context.fillRect(0, 0, gameW, gameH);

    hero = new heroObject();
    hero.image.src = "images/mageSprite.png";
    hero.image.onload = function () {
        hero.render();
    };

    lastUpdate = Date.now();
    setInterval(gameLoop, 1);
});

$(document).keydown(function (event) {
    if (36 < event.keyCode && event.keyCode < 41) {
        // block the default browser action for the arrow keys
        event.preventDefault();
        var curKey = $.inArray(event.keyCode, hero.keys);
        if (curKey == -1)
            hero.keys.push(event.keyCode);
    }
});

$(document).keyup(function (event) {
    if (36 < event.keyCode && event.keyCode < 41) {
        // block the default browser action for the arrow keys
        event.preventDefault();
        var curKey = $.inArray(event.keyCode, hero.keys);
        if (curKey > -1)
            hero.keys.splice(curKey, 1);
    }
});

/*===================================================================================================================*/
/*Инициализация */
/*===================================================================================================================*/
function heroObject() {
    this.width = 32;
    this.height = 32;
    // Помещаем его в рандомное место на экране.
    this.x = this.width * Math.floor(Math.random() * (gameW / this.width));
    this.y = this.height * Math.floor(Math.random() * (gameH / this.height));
    // Массив для хранения информации о том, какие быстрые клавиши нажимаются
    this.keys = [];
    // Когда в последний раз мы рисовали героя на экране
    this.lastRender = Date.now();
    // Скорость переключения между спрайтами (в миллисекундах)
    this.animSpeed = 200;
    // Какие изображения мы используем для героя
    this.image = new Image();
    // Какой спрайт из изображения отобразим в данный момент
    this.whichSprite = 0;
    // На сколько пикселей мы хотим переместить героя каждый цикл
    this.moveSpeed = 4;

    this.render = function () {
        context.drawImage(this.image, this.whichSprite, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    };

    this.update = function (elapsed) {
        var now = Date.now();
        // Сколько времени прошло с тех пор, как мы в последний раз обновили спрайт
        var delta = now - this.lastRender;

        switch (this.keys[this.keys.length - 1]) {
            case 37:
                // move the hero left on the screen
                this.x -= this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != this.width * 2 && this.whichSprite != this.width * 3)) {
                    this.whichSprite = this.whichSprite == this.width * 2 ? this.width * 3 : this.width * 2;
                    this.lastRender = now;
                }
                break;
            case 38:
                // move the hero up on the screen
                this.y -= this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != this.width * 6 && this.whichSprite != this.width * 7)) {
                    this.whichSprite = this.whichSprite == this.width * 6 ? this.width * 7 : this.width * 6;
                    this.lastRender = now;
                }
                break;
            case 39:
                // move the hero right on the screen
                this.x += this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != this.width * 4 && this.whichSprite != this.width * 5)) {
                    this.whichSprite = this.whichSprite == this.width * 4 ? this.width * 5 : this.width * 4;
                    this.lastRender = now;
                }
                break;
            case 40:
                // move the hero down on the screen
                this.y += this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != 0 && this.whichSprite != this.width)) {
                    this.whichSprite = this.whichSprite == 0 ? this.width : 0;
                    this.lastRender = now;
                }
                break;
        }

        if (this.x < 0) {
            this.x += this.moveSpeed * elapsed;
        }
        if (this.x + this.width >= gameW) {
            this.x -= this.moveSpeed * elapsed;
        }
        if (this.y < 0) {
            this.y += this.moveSpeed * elapsed;
        }
        if (this.y + this.height >= gameH) {
            this.y -= this.moveSpeed * elapsed;
        }
    };
};

function gameLoop() {
    var now = Date.now();
    var elapsed = now - lastUpdate;
    context.fillStyle = "#5C3F25";
    context.fillRect(0, 0, gameW, gameH);
    hero.update(elapsed / timerRatio);
    hero.render();
    lastUpdate = now;
}