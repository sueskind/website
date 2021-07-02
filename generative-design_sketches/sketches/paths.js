let points;
let indices;
let mainPoint;

let pointCount;
let frameSize;
let frameCountX;
let frameCountY;

let marginLeft;
let marginTop;

let lineWidth = 1;
let mainCircleSize = 7;
let circleSize = 4;

let refreshButton;
let sizeSlider;
let pointCountSlider;


function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();

    textSize(15);
    stroke(0);

    refreshButton = createButton("Refresh");
    refreshButton.position(20, 20);
    refreshButton.mousePressed(draw);

    sizeSlider = createSlider(30, 200, 110);
    sizeSlider.position(20, 50);
    sizeSlider.input(draw);

    pointCountSlider = createSlider(2, 12, 6);
    pointCountSlider.position(20, 80);
    pointCountSlider.input(draw);

    mainPoint = {"x": 0.5, "y": 0.05};
}

function initCalc() {
    frameSize = sizeSlider.value();
    pointCount = pointCountSlider.value();

    frameCountX = int(width / frameSize);
    frameCountY = int(height / frameSize);

    marginLeft = (width - frameCountX * frameSize) / 2;
    marginTop = (height - frameCountY * frameSize) / 2;

    strokeWeight(lineWidth / frameSize);
}

function draw() {
    initCalc();

    background(255);
    fill(255);

    points = [];
    for (let i = 0; i < pointCount / 2; i++) {
        let x = random() / 2;
        let y = random();
        points.push({"x": 0.5 + x, "y": y});
        points.push({"x": 0.5 - x, "y": y});
    }

    translate(marginLeft, marginTop);
    scale(frameSize);

    for (let r = 0; r < frameCountY; r++) {
        for (let c = 0; c < frameCountX; c++) {

            line(mainPoint.x, mainPoint.y, points[0].x, points[0].y);
            for (let i = 0; i < pointCount - 1; i++) {
                line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            }

            circle(mainPoint.x, mainPoint.y, mainCircleSize / frameSize);
            for (let i = 0; i < pointCount; i++) {
                circle(points[i].x, points[i].y, circleSize / frameSize);
            }

            points = shuffle(points);

            translate(1, 0);
        }
        translate(-frameCountX, 1);
    }

    resetMatrix();

    rect(190, 50, 50, 20);
    rect(190, 80, 60, 20);

    fill(0);

    text("Size", 200, 65);
    text("Count", 200, 95);
}