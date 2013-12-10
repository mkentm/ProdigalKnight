var playerCanvas;
var playerContext;
var mapCanvas;
var mapContext;

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
    $.get("data/game.xml", processLoadGameData);
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
    var curItem;
    var iter = savedData.evaluate("GameData/Objects/Object", savedData, null, XPathResult.ANY_TYPE, null);
    gameObjects = [];
    for (var i = 0; ; i++) {
        curItem = (iter.length != null ? iter[i] : iter.iterateNext());
        if (!curItem) {
            break;
        } else {
            var index = curItem.attributes.getNamedItem("id").value;
            gameObjects[index] = new gameObject();
            gameObjects[index].width = parseInt(curItem.attributes.getNamedItem("width").value);
            gameObjects[index].height = parseInt(curItem.attributes.getNamedItem("height").value);
            gameObjects[index].imageSrc = curItem.attributes.getNamedItem("src").value;
            gameObjects[index].type = curItem.attributes.getNamedItem("type").value;
        }
    }

    iter = savedData.evaluate("GameData/Grid", savedData, null, XPathResult.ANY_TYPE, null);
    curItem = (iter.length != null ? iter[0] : iter.iterateNext());
    tileSize = parseInt(curItem.attributes.getNamedItem("tileSize").value);
    gameW = parseInt(curItem.attributes.getNamedItem("width").value) * tileSize;
    gameH = parseInt(curItem.attributes.getNamedItem("height").value) * tileSize;
    gameBackground = curItem.attributes.getNamedItem("background").value;
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
    playerCanvas.width = 800;
    playerCanvas.height = gameH;
}

function initGameTiles() {
    var iter = savedData.evaluate("GameData/Grid/GridRow", savedData, null, XPathResult.ANY_TYPE, null);

    var curItem;
    var collidableCount = 0;
    var sceneryCount = 0;
    var bonusesCount = 0;

    for (var i = 0; ; i++) {
        curItem = (iter.length != null ? iter[i] : iter.iterateNext());
        if (!curItem) {
            break;
        } else {
            var curRow = curItem.textContent;
            if (curRow === undefined)
                curRow = curItem.text;

            for (var j = 0; j < curRow.length; j++) {
                var objIndex = curRow[j];
                if (gameObjects[objIndex].type == "collidable") {
                    collidables[collidableCount] = new drawImage();
                    collidables[collidableCount].width = gameObjects[objIndex].width;
                    collidables[collidableCount].height = gameObjects[objIndex].height;
                    collidables[collidableCount].x = j * tileSize;
                    collidables[collidableCount].y = i * tileSize;
                    collidables[collidableCount].image = new Image();
                    collidables[collidableCount].image.src = gameObjects[objIndex].imageSrc;
                    collidables[collidableCount].image.index = collidableCount;
                    $(collidables[collidableCount].image).load(function () {
                        collidables[this.index].render();
                    });
                    collidableCount++;
                }
                if (gameObjects[objIndex].type == "scenery") {
                    scenery[sceneryCount] = new drawImage();
                    scenery[sceneryCount].width = gameObjects[objIndex].width;
                    scenery[sceneryCount].height = gameObjects[objIndex].height;
                    scenery[sceneryCount].x = j * tileSize;
                    scenery[sceneryCount].y = i * tileSize;
                    scenery[sceneryCount].image = new Image();
                    scenery[sceneryCount].image.src = gameObjects[objIndex].imageSrc;
                    scenery[sceneryCount].image.index = sceneryCount;
                    $(scenery[sceneryCount].image).load(function () {
                        scenery[this.index].render();
                    });
                    sceneryCount++;
                }
                if (gameObjects[objIndex].type == "bonus") {
                    bonuses[bonusesCount] = new drawImage();
                    bonuses[bonusesCount].width = gameObjects[objIndex].width;
                    bonuses[bonusesCount].height = gameObjects[objIndex].height;
                    bonuses[bonusesCount].x = j * tileSize;
                    bonuses[bonusesCount].y = i * tileSize;
                    bonuses[bonusesCount].image = new Image();
                    bonuses[bonusesCount].image.src = gameObjects[objIndex].imageSrc;
                    bonuses[bonusesCount].render();
//                    bonuses[bonusesCount].image.index = bonusesCount;
//                    $(bonuses[bonusesCount].image).load(function () {
//                        bonuses[this.index].render();
//                    });
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
        }
    }
}

function drawImage() {
    this.width = 32;
    this.height = 32;
    this.x = null;
    this.y = null;
    this.image = null;
    this.render = function () {
        mapContext.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    };
};

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