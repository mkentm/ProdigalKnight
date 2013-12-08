var mapCanvas;
var mapContext;

var gameW = 800;
var gameH = 640;

var map =
    [
        [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1],
        [0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1],
        [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1],
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1],
        [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1],
        [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0],
        [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
        [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
    ];

/*===================================================================================================================*/
/*Загрузка */
/*===================================================================================================================*/
$(window).load(function () {
    initCanvas();
    initMap();
});

/*===================================================================================================================*/
/*Инициализация */
/*===================================================================================================================*/
function initCanvas() {
    mapCanvas = document.getElementById("map");
    mapContext = mapCanvas.getContext("2d");
    mapCanvas.width = gameW;
    mapCanvas.height = gameH;
    mapContext.fillStyle = "#5C3F25";
    mapContext.fillRect(0, 0, gameW, gameH);
}

function initMap() {
    var imageRoad = new Image();
    imageRoad.src = "images/road.png";
    imageRoad.onload = function () {
        var roads = [];
        var numRoads = -1;
        for (var height = 0; height < gameH / 32; height++) {
            for (var width = 0; width < gameW / 32; width++) {
                if (map[height][width] == 0) {
                    numRoads++;
                    roads[numRoads] = new drawImage(imageRoad, width * 32, height * 32);
                    roads[numRoads].render();
                }
            }
        }
    };

    var imageWall = new Image();
    imageWall.src = "images/brick.png";
    imageWall.onload = function () {
        var walls = [];
        var numWalls = -1;
        for (var height = 0; height < gameH / 32; height++) {
            for (var width = 0; width < gameW / 32; width++) {
                if (map[height][width] == 1) {
                    numWalls++;
                    walls[numWalls] = new drawImage(imageWall, width * 32, height * 32);
                    walls[numWalls].render();
                }
            }
        }
    };
}

function drawImage(image, x, y) {
    this.width = 32;
    this.height = 32;
    this.x = x;
    this.y = y;
    this.image = image;
    this.collision = false;
    this.render = function () {
        mapContext.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    };
};