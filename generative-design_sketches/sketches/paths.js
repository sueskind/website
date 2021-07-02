let points;
let indices;
let mainPoint;

const pointCount = 6;
const frameSize = 110;
let frameCountX;
let frameCountY;

let marginLeft;
let marginTop;

let lineWidth = 1;
let mainCircleSize = 7;
let circleSize = 4;

let refreshButton;


function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();

    frameCountX = int(width / frameSize);
    frameCountY = int(height / frameSize);

    marginLeft = (width - frameCountX * frameSize) / 2;
    marginTop = (height - frameCountY * frameSize) / 2;

    lineWidth /= frameSize;
    mainCircleSize /= frameSize;
    circleSize /= frameSize;

    strokeWeight(lineWidth);
    fill(255);
    stroke(0);

    button_reset = createButton("Refresh");
    button_reset.position(20, 20);
    button_reset.mousePressed(draw);

    mainPoint = {"x": 0.5, "y": 0.05};
}

function draw() {
    background(255);

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

            circle(mainPoint.x, mainPoint.y, mainCircleSize);
            for (let i = 0; i < pointCount; i++) {
                circle(points[i].x, points[i].y, circleSize);
            }

            points = shuffle(points);

            translate(1, 0);
        }
        translate(-frameCountX, 1);
    }

    resetMatrix();
}