let points;
let indices;
let origin;

const count = 6;
const frames = 10;
let frameWidth;
let frameHeight;


function setup() {
    createCanvas(400, 400);

    background(255);
    fill(255);
    strokeWeight(3);
    noLoop();

    frameWidth = int(width / frames);
    frameHeight = int(height / frames);

    origin = {"x": width / 2, "y": 20};

    points = [];
    for (let i = 0; i < count / 2; i++) {
        let x = random() * width / 2;
        let y = random() * height;
        points.push({"x": width / 2 + x, "y": y});
        points.push({"x": width / 2 - x, "y": y});
    }

}

function draw() {
    scale(1.0 / frames);

    for (let r = 0; r < frames; r++) {
        for (let c = 0; c < frames; c++) {

            line(origin.x, origin.y, points[0].x, points[0].y);
            for (let i = 0; i < count - 1; i++) {
                line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
            }

            circle(origin.x, origin.y, 20);
            for (let i = 0; i < count; i++) {
                circle(points[i].x, points[i].y, 15);
            }

            points = shuffle(points);

            translate(frameWidth * frames, 0);
        }
        translate(-frameWidth * frames * frames, frameHeight * frames);
    }


}