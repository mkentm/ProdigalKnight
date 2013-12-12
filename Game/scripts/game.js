var idPlayerCanvas;
var playerCanvas;
var playerContext;
var idPeopleCanvas;
var peopleCanvas;
var peopleContext;
var idSpiritCanvas;
var spiritCanvas;
var spiritContext;

var mapW;
var mapH;
var gameW;
var gameH;
var gameBackgroundPeople;
var gameBackgroundSpirit;
var tileSize;

var savedData = null;
var lastUpdate = null;
var gamePeopleObjects = null;
var gameSpiritObjects = null;
var hero = null;

var collidablesPeople = [];
var collidablesSpirit = [];
var teleportPeople = [];
var teleportSpirit = [];
var sceneryPeople = [];
var scenerySpirit = [];
var bonusesPeople = [];
var bonusesSpirit = [];
var isPeopleMap = true;

var isCountdown;
var isTeleport;
var teleportEndTick;
var teleportEndTickMax;

var abilityToMove;

var fps = 30;
var timerRatio = 1000 / fps;

var dt;
var oldTime;

/*===================================================================================================================*/
/*Загрузка */
/*===================================================================================================================*/
$(document).ready(function () {
    hideMaps();
    idPeopleCanvas = get("peopleCanvas");
    idSpiritCanvas = get("spiritCanvas");
    idPlayerCanvas = get("playerCanvas");
    $(idPeopleCanvas).stop().fadeTo(0, 1, function () {
        $.get("data/game.xml?ver=" + Date.now(), processLoadGameData);
    });
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
function hideMaps() {
    $(document.querySelectorAll('.map')).fadeTo(0, 0, function () {
        $(this).hide();
    });
}

function get(a) {
    return document.getElementById(a);
}

function processLoadGameData(data) {
    savedData = data;
    initGame();
}

function initGame() {
    initData();
    initGameBoard();
    initCanvas();
    initGameTiles();

    lastUpdate = Date.now();
    setInterval(gameLoop, 16);
}

function initData() {
    isPeopleMap = true;
    isCountdown = false;
    isTeleport = false;
    abilityToMove = true;

    // delta
    dt = 0;
    oldTime = Date.now();
    teleportEndTick = 0;
    teleportEndTickMax = 20;//150;
}

function initGameBoard() {
    gamePeopleObjects = [];
    gameSpiritObjects = [];
    jQuery(savedData).find("ObjectPeople").each(
        function () {
            var index = jQuery(this).attr("id");
            gamePeopleObjects[index] = new gameObject();
            gamePeopleObjects[index].id = index;
            gamePeopleObjects[index].width = parseInt(jQuery(this).attr("width"));
            gamePeopleObjects[index].height = parseInt(jQuery(this).attr("height"));
            gamePeopleObjects[index].imageSrc = jQuery(this).attr("src");
            gamePeopleObjects[index].type = jQuery(this).attr("type");
            if (gamePeopleObjects[index].type.toString() == "teleport") {
                gamePeopleObjects[index].width1 = parseInt(jQuery(this).attr("width1"));
                gamePeopleObjects[index].height1 = parseInt(jQuery(this).attr("height1"));
                gamePeopleObjects[index].imageSrc1 = jQuery(this).attr("src1");
            }
        }
    );

    jQuery(savedData).find("ObjectSpirit").each(
        function () {
            var index = jQuery(this).attr("id");
            gameSpiritObjects[index] = new gameObject();
            gameSpiritObjects[index].id = index;
            gameSpiritObjects[index].width = parseInt(jQuery(this).attr("width"));
            gameSpiritObjects[index].height = parseInt(jQuery(this).attr("height"));
            gameSpiritObjects[index].imageSrc = jQuery(this).attr("src");
            gameSpiritObjects[index].type = jQuery(this).attr("type");
        }
    );

    jQuery(savedData).find("Grid").each(
        function () {
            tileSize = parseInt(jQuery(this).attr("tileSize"));
            mapW = parseInt(jQuery(this).attr("width"));
            mapH = parseInt(jQuery(this).attr("height"));
            gameW = mapW * tileSize;
            gameH = mapH * tileSize;
            gameBackgroundPeople = jQuery(this).attr("backgroundPeople");
            gameBackgroundSpirit = jQuery(this).attr("backgroundSpirit");
        }
    );
}

function gameObject() {
    this.id = null;
    this.width = null;
    this.height = null;
    this.imageSrc = null;
    this.width1 = null;
    this.height1 = null;
    this.imageSrc1 = null;
    this.type = null;
}

function initCanvas() {
    peopleCanvas = getCanvas(idPeopleCanvas, gameW, gameH);
    peopleContext = getContext(peopleCanvas, gameW, gameH, gameBackgroundPeople);
    peopleContext.save();

    spiritCanvas = getCanvas(idSpiritCanvas, gameW, gameH);
    spiritContext = getContext(spiritCanvas, gameW, gameH, gameBackgroundSpirit);
    spiritContext.save();

    playerCanvas = getCanvas(idPlayerCanvas, gameW, gameH);
    playerContext = playerCanvas.getContext("2d");
    playerContext.save();
}

function getCanvas(id, width, height) {
    id.width = width;
    id.height = height;
    return id;
}

function getContext(canvas, width, height, background) {
    var context = canvas.getContext("2d");
    if (background) {
        context.fillStyle = background;
        context.fillRect(0, 0, width, height);
    }
    context.save();
    return context;
}

function initGameTiles() {
    var collidablePeopleCount = 0;
    var collidableSpiritCount = 0;
    var teleportPeopleCount = 0;
    var teleportSpiritCount = 0;
    var sceneryPeopleCount = 0;
    var scenerySpiritCount = 0;
    var bonusesPeopleCount = 0;
    var bonusesSpiritCount = 0;

    var i = 0;
    jQuery(savedData).find("GridRow").each(
        function () {
            var index = jQuery(this).attr("id");
            var text = jQuery(this).text();

            if (i >= mapH) {
                i -= mapH;
            }

            for (var j = 0; j < text.length; j++) {
                var objIndex = text[j];
                if (index == "people") {
                    if (gamePeopleObjects[objIndex].type.toString() == "nothing") {

                    }
                    if (gamePeopleObjects[objIndex].type.toString() == "collidable") {
                        drawImageObjects(collidablesPeople, collidablePeopleCount, gamePeopleObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, true);
                        collidablePeopleCount++;
                    }
                    if (gamePeopleObjects[objIndex].type.toString() == "teleport") {
                        drawImageObjects(teleportPeople, teleportPeopleCount, gamePeopleObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, true);
                        teleportPeopleCount++;
                    }
                    if (gamePeopleObjects[objIndex].type.toString() == "scenery") {
                        drawImageObjects(sceneryPeople, sceneryPeopleCount, gamePeopleObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, true);
                        sceneryPeopleCount++;
                    }
                    if (gamePeopleObjects[objIndex].type.toString() == "bonus") {
                        drawImageObjects(bonusesPeople, bonusesPeopleCount, gamePeopleObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, true);
                        bonusesPeopleCount++;
                    }
                    if (gamePeopleObjects[objIndex].type.toString() == "player") {
                        hero = new heroObject();
                        hero.imageWidth = gamePeopleObjects[objIndex].width;
                        hero.imageHeight = gamePeopleObjects[objIndex].height;
                        hero.x = j * tileSize;
                        hero.y = i * tileSize;
                        hero.image = new Image();
                        hero.image.src = gamePeopleObjects[objIndex].imageSrc;
                        hero.image.onload = function () {
                            hero.render();
                        };
                    }
                } else {
                    if (gameSpiritObjects[objIndex].type.toString() == "nothing") {

                    }
                    if (gameSpiritObjects[objIndex].type.toString() == "collidable") {
                        drawImageObjects(collidablesSpirit, collidableSpiritCount, gameSpiritObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, false);
                        collidableSpiritCount++;
                    }
                    if (gameSpiritObjects[objIndex].type.toString() == "teleport") {
                        drawImageObjects(teleportSpirit, teleportSpiritCount, gameSpiritObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, false);
                        teleportSpiritCount++;
                    }
                    if (gameSpiritObjects[objIndex].type.toString() == "scenery") {
                        drawImageObjects(scenerySpirit, scenerySpiritCount, gameSpiritObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, false);
                        scenerySpiritCount++;
                    }
                    if (gameSpiritObjects[objIndex].type.toString() == "bonus") {
                        drawImageObjects(bonusesSpirit, bonusesSpiritCount, gameSpiritObjects[objIndex], j * tileSize, i * tileSize, tileSize, tileSize, false);
                        bonusesSpiritCount++;
                    }
                }
            }
            i++;
        }
    );
}

function drawImageObjects(objects, objIndex, gameObject, x, y, tileSizeW, tileSizeH, isMapPeople) {
    objects[objIndex] = new drawImageMap();
    objects[objIndex].id = gameObject.id;
    objects[objIndex].isMapPeople = isMapPeople;
    objects[objIndex].imageSizeWidth = gameObject.width;
    objects[objIndex].imageSizeHeight = gameObject.height;
    objects[objIndex].imageSizeWidth1 = gameObject.width1;
    objects[objIndex].imageSizeHeight1 = gameObject.height1;
    objects[objIndex].width = tileSizeW;
    objects[objIndex].height = tileSizeH;
    objects[objIndex].x = x;
    objects[objIndex].y = y;
    objects[objIndex].image = new Image();
    objects[objIndex].image.src = gameObject.imageSrc;
    objects[objIndex].image.index = objIndex;
    objects[objIndex].image1 = new Image();
    objects[objIndex].image1.src = gameObject.imageSrc1;
    objects[objIndex].image1.index = objIndex;
    $(objects[objIndex].image).load(function () {
        objects[this.index].render();
    });
}

function drawImageMap() {
    this.id = null;
    this.isMapPeople = null;
    this.width = 32;
    this.height = 32;
    this.imageSizeWidth = 32;
    this.imageSizeHeight = 32;
    this.imageSizeWidth1 = 32;
    this.imageSizeHeight1 = 32;
    this.x = null;
    this.y = null;
    this.image = null;
    this.image1 = null;
    this.render = function () {
        if (this.isMapPeople) {
            peopleContext.drawImage(this.image, 0, 0, this.imageSizeWidth, this.imageSizeHeight, this.x, this.y, this.width, this.height);
        } else {
            spiritContext.drawImage(this.image, 0, 0, this.imageSizeWidth, this.imageSizeHeight, this.x, this.y, this.width, this.height);
        }
    };
}

function heroObject() {
    this.imageWidth = 32;
    this.imageHeight = 32;
    this.width = Math.floor(this.imageWidth * 0.8);
    this.height = Math.floor(this.imageHeight * 0.8);
    this.x = null;
    this.y = null;
    this.portX = null;
    this.portY = null;
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
        updateDelta();

        if (abilityToMove) {
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
        }

        if (isCountdown) {
            if (teleportEndTick <= 0) {
                isCountdown = !isCountdown;
                abilityToMove = !abilityToMove;
            } else {
                teleportEndTick -= dt;
            }
        }

        if (isTeleport) {
            if (teleportEndTick >= teleportEndTickMax) {
                isCountdown = !isCountdown;
                isPeopleMap = !isPeopleMap;
                isTeleport = !isTeleport;
                hideMaps();
                if (isPeopleMap) {
                    $(idPeopleCanvas).stop().fadeTo(0, 1, port(this));
                } else {
                    $(idSpiritCanvas).stop().fadeTo(0, 1, port(this));
                }
            } else {
                teleportEndTick += dt;
            }
        }

        isPeopleMap ?
            check(this, collidablesPeople, teleportPeople, sceneryPeople, bonusesPeople, prevX, prevY, peopleContext, gameBackgroundPeople) :
            check(this, collidablesSpirit, teleportSpirit, scenerySpirit, bonusesSpirit, prevX, prevY, spiritContext, gameBackgroundSpirit);
    };
}

function check(player, collidables, teleport, scenery, bonuses, prevX, prevY, context, background) {
    var iter;
    for (iter in collidables) {
        if (this.checkCollision(player, collidables[iter])) {
            player.x = prevX;
            player.y = prevY;
            break;
        }
    }

    for (iter in teleport) {
        if (this.checkBonus(player, teleport[iter])) {
            abilityToMove = false;
            isTeleport = true;
        }
    }

    for (iter in bonuses) {
        if (this.checkCollision(player, bonuses[iter])) {
            context.fillStyle = background;
            context.fillRect(bonuses[iter].x, bonuses[iter].y, bonuses[iter].width, bonuses[iter].height);
            delete bonuses[iter];
            break;
        }
    }
}

function checkCollision(player, obj) {
    if ((player.x < (obj.x + obj.width - 1) && Math.floor(player.x + player.width - 1) > obj.x)
        && (player.y < (obj.y + obj.height - 1) && Math.floor(player.y + player.height - 1) > obj.y)) {
        return true;
    }
}

function checkBonus(player, obj) {
    if ((obj.x - 2) <= player.x && ((player.x + player.width) <= (obj.x + obj.width + 2))
        && (obj.y - 2) <= player.y && ((player.y + player.height) <= (obj.y + obj.height + 2))) {
        return true;
    }
}

function port(player) {
    if (isPeopleMap) {
        player.x = player.portX;
        player.y = player.portY;
        for (var iter in teleportPeople) {
            if (checkBonus(player, teleportPeople[iter])) {
                peopleContext.fillRect(teleportPeople[iter].x, teleportPeople[iter].y, teleportPeople[iter].width, teleportPeople[iter].height);
                peopleContext.drawImage(teleportPeople[iter].image1, 0, 0, teleportPeople[iter].imageSizeWidth1, teleportPeople[iter].imageSizeHeight1,
                    teleportPeople[iter].x, teleportPeople[iter].y, teleportPeople[iter].width, teleportPeople[iter].height);
                delete teleportPeople[iter];
            }
        }
    } else {
        player.portX = player.x;
        player.portY = player.y;
    }
}

function updateDelta() {
    var newTime = Date.now();
    dt = (newTime - oldTime) / 16;
    dt = (dt > 10) ? 10 : dt;
    oldTime = newTime;
}

function gameLoop() {
    var now = Date.now();
    var elapsed = now - lastUpdate;
    playerContext.clearRect(0, 0, gameW, gameH);
    hero.update(elapsed / timerRatio);
    hero.render();
    lastUpdate = now;
}