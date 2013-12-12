var playerCanvas;
var playerContext;
var mapCanvas;
var mapContext;

var mapW;
var mapH;
var gameW;
var gameH;
var gameBackground;
var tileSize;

var savedData = null;
var lastUpdate = null;
var gameObjects = null;
var hero = null;
var collidables = [];
var scenery = [];
var bonuses = [];

var fps = 30;
var timerRatio = 1000 / fps;

/*===================================================================================================================*/
/*Загрузка */
/*===================================================================================================================*/
$(document).ready(function () {
    $.get("data/game.xml?ver=" + Date.now(), processLoadGameData);
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
function processLoadGameData(data) {
    savedData = data;
    initGame();
}

function initGame() {
    initGameBoard();
    setCanvasValues();
    initGameTiles();

    lastUpdate = Date.now();
    setInterval(gameLoop, 16);
}

function initGameBoard() {
    gameObjects = [];
    jQuery(savedData).find("Object").each(
        function () {
            var index = jQuery(this).attr("id");
            gameObjects[index] = new gameObject();
            gameObjects[index].id = index;
            gameObjects[index].width = parseInt(jQuery(this).attr("width"));
            gameObjects[index].height = parseInt(jQuery(this).attr("height"));
            gameObjects[index].imageSrc = jQuery(this).attr("src");
            gameObjects[index].type = jQuery(this).attr("type");
        }
    );

    jQuery(savedData).find("Grid").each(
        function () {
            tileSize = parseInt(jQuery(this).attr("tileSize"));
            mapW = parseInt(jQuery(this).attr("width"));
            mapH = parseInt(jQuery(this).attr("height"));
            gameW = mapW * tileSize;
            gameH = mapH * tileSize;
            gameBackground = jQuery(this).attr("background");
        }
    );
}

function gameObject() {
    this.width = null;
    this.height = null;
    this.imageSrc = null;
    this.type = null;
}

function setCanvasValues() {
    initCanvas();

    mapContext.save();
    playerContext.save();
}

function initCanvas() {
    mapCanvas = document.getElementById("mapCanvas");
    mapContext = mapCanvas.getContext("2d");
    mapCanvas.width = gameW;
    mapCanvas.height = gameH;
    mapContext.fillStyle = gameBackground;
    mapContext.fillRect(0, 0, gameW, gameH);

    playerCanvas = document.getElementById("playerCanvas");
    playerContext = playerCanvas.getContext("2d");
    playerCanvas.width = gameW;
    playerCanvas.height = gameH;
}

function initGameTiles() {
    var collidablesCount = 0;
    var sceneryCount = 0;
    var bonusesCount = 0;

    var i = 0;
    jQuery(savedData).find("GridRow").each(
        function () {
            var text = jQuery(this).text();

            if (i >= mapH) {
                i -= mapH;
            }

//            console.log("text = " + text);

            for (var j = 0; j < text.length; j++) {
                var objIndex = text[j];
//                console.log("index = " + objIndex);
//                console.log("gameObjects = ", gameObjects[objIndex]);
                if (gameObjects[objIndex].type == "nothing") {

                }
                if (gameObjects[objIndex].type == "collidable") {
                    drawImageObjects(collidables, collidablesCount, gameObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize);
                    collidablesCount++;
                }
                if (gameObjects[objIndex].type == "scenery") {
                    drawImageObjects(scenery, sceneryCount, gameObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize);
                    sceneryCount++;
                }

                if (gameObjects[objIndex].type == "bonus") {
                    drawImageObjects(bonuses, bonusesCount, gameObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize);
                    bonusesCount++;
                }
                if (gameObjects[objIndex].type == "player") {
                    hero = new heroObject();
                    hero.imageWidth = gameObjects[objIndex].width;
                    hero.imageHeight = gameObjects[objIndex].height;
                    hero.x = j * tileSize;
                    hero.y = i * tileSize;
                    hero.image = new Image();
                    hero.image.src = gameObjects[objIndex].imageSrc;
                    hero.image.onload = function () {
                        hero.render();
                    };
                }
            }
            i++;
        }
    );
}

function drawImage() {
    this.width = 32;
    this.height = 32;
    this.imageSizeWidth = 32;
    this.imageSizeHeight = 32;
    this.x = null;
    this.y = null;
    this.image = null;
    this.render = function () {
        mapContext.drawImage(this.image, 0, 0, this.imageSizeWidth, this.imageSizeHeight, this.x, this.y, this.width, this.height);
    };
}

function drawImageObjects(objects, objIndex, gameObject, x, y, tileSizeW, tileSizeH) {
    objects[objIndex] = new drawImage();
    objects[objIndex].imageSizeWidth = gameObject.width;
    objects[objIndex].imageSizeHeight = gameObject.height;
    objects[objIndex].width = tileSizeW;
    objects[objIndex].height = tileSizeH;
    objects[objIndex].x = x;
    objects[objIndex].y = y;
    objects[objIndex].image = new Image();
    objects[objIndex].image.src = gameObject.imageSrc;
    objects[objIndex].image.index = objIndex;
    $(objects[objIndex].image).load(function () {
        objects[this.index].render();
    });
}

function heroObject() {
    this.imageWidth = 32;
    this.imageHeight = 32;
    this.width = Math.floor(this.imageWidth * 0.8);
    this.height = Math.floor(this.imageHeight * 0.8);
    // Помещаем его в рандомное место на экране.
    this.x = null;
    this.y = null;
    // Массив для хранения информации о том, какие быстрые клавиши нажимаются
    this.keys = [];
    // Когда в последний раз мы рисовали героя на экране
    this.lastRender = Date.now();
    // Скорость переключения между спрайтами (в миллисекундах)
    this.animSpeed = 200;
    // Какие изображения мы используем для героя
    this.image = null;
    // Какой спрайт из изображения отобразим в данный момент
    this.whichSprite = 0;
    // На сколько пикселей мы хотим переместить героя каждый цикл
    this.moveSpeed = 4;

    this.render = function () {
        playerContext.drawImage(this.image, this.whichSprite, 0, this.imageWidth, this.imageHeight, this.x, this.y, this.width, this.height);
    };

    this.checkCollision = function (obj) {
        if ((this.x < (obj.x + obj.width - 1) && Math.floor(this.x + this.width - 1) > obj.x)
            && (this.y < (obj.y + obj.height - 1) && Math.floor(this.y + this.height - 1) > obj.y)) {
            return true;
        }
    };

    this.update = function (elapsed) {
        var prevX = this.x;
        var prevY = this.y;
        var now = Date.now();
        // Сколько времени прошло с тех пор, как мы в последний раз обновили спрайт
        var delta = now - this.lastRender;

        switch (this.keys[this.keys.length - 1]) {
            case 37:
                // move the hero left on the screen
                this.x -= this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != this.imageWidth * 2 && this.whichSprite != this.imageWidth * 3)) {
                    this.whichSprite = this.whichSprite == this.imageWidth * 2 ? this.imageWidth * 3 : this.imageWidth * 2;
                    this.lastRender = now;
                }
                break;
            case 38:
                // move the hero up on the screen
                this.y -= this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != this.imageWidth * 6 && this.whichSprite != this.imageWidth * 7)) {
                    this.whichSprite = this.whichSprite == this.imageWidth * 6 ? this.imageWidth * 7 : this.imageWidth * 6;
                    this.lastRender = now;
                }
                break;
            case 39:
                // move the hero right on the screen
                this.x += this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != this.imageWidth * 4 && this.whichSprite != this.imageWidth * 5)) {
                    this.whichSprite = this.whichSprite == this.imageWidth * 4 ? this.imageWidth * 5 : this.imageWidth * 4;
                    this.lastRender = now;
                }
                break;
            case 40:
                // move the hero down on the screen
                this.y += this.moveSpeed * elapsed;
                if (delta > this.animSpeed || (this.whichSprite != 0 && this.whichSprite != this.imageWidth)) {
                    this.whichSprite = this.whichSprite == 0 ? this.imageWidth : 0;
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

        for (var iter in collidables) {
            if (this.checkCollision(collidables[iter])) {
                this.x = prevX;
                this.y = prevY;
                break;
            }
        }

        for (var iter in bonuses) {
            if (this.checkCollision(bonuses[iter])) {
                mapContext.fillStyle = gameBackground;
                mapContext.fillRect(bonuses[iter].x, bonuses[iter].y, bonuses[iter].width, bonuses[iter].height);
//                bonuses.splice (bonuses[iter-1],1);
                break;
            }
        }
    };

};

function gameLoop() {
    var now = Date.now();
    var elapsed = now - lastUpdate;
    playerContext.clearRect(0, 0, gameW, gameH);
    hero.update(elapsed / timerRatio);
    hero.render();
    lastUpdate = now;
}