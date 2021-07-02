let points;
let indices;
let mainPoint;

const count = 6;
const frames = 10;

let lineWidth = 0.5;
let mainCircleSize = 4;
let circleSize = 2;

const margin = 30;
let drawAreaWidth;
let drawAreaHeight;

let frameWidth;
let frameHeight;

let resetButton;


function setup() {
    createCanvas(windowWidth, windowHeight);
    noLoop();

    drawAreaWidth = width - 2 * margin;
    drawAreaHeight = height - 2 * margin;

    frameWidth = int(drawAreaWidth / frames);
    frameHeight = int(drawAreaHeight / frames);

    lineWidth /= min(frameWidth, frameHeight);
    mainCircleSize /= min(frameWidth, frameHeight);
    circleSize /= min(frameWidth, frameHeight);

    strokeWeight(lineWidth);
    fill(255);
    stroke(0);

    button_reset = createButton("Reset");
    button_reset.position(20, 20);
    button_reset.mousePressed(draw);

    mainPoint = {"x": 0.5, "y": 0.05};
}

function draw() {
    background(255);

    points = [];
    for (let i = 0; i < count / 2; i++) {
        let x = random() / 2;
        let y = random();
        points.push({"x": 0.5 + x, "y": y});
        points.push({"x": 0.5 - x, "y": y});
    }

    push();
    translate(margin, margin);
    //circle(0,0,30);
    scale(frameWidth, frameHeight);

    for (let r = 0; r < frames; r++) {
        for (let c = 0; c < frames; c++) {

            line(mainPoint.x, mainPoint.y, points[0].x, points[0].y);
            for (let i = 0; i < count - 1; i++) {
                line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            }

            circle(mainPoint.x, mainPoint.y, mainCircleSize);
            for (let i = 0; i < count; i++) {
                circle(points[i].x, points[i].y, circleSize);
            }

            points = shuffle(points);

            translate(1, 0);
        }
        translate(-frames, 1);
    }

    pop();
}