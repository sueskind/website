let spaceSmall = 10;
let spaceBig = 30;
let barWidth = 50;
let circleRadius = 25;

let numberFont;

function preload() {
    numberFont = loadFont("../fonts/SourceCodePro-Bold.ttf");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    stroke(0);
    textFont(numberFont);
    textSize(32);
    textAlign(CENTER, CENTER);
    frameRate(1);
}

function draw() {
    translate(width / 2, height / 2);
    background(230);

    stripe(-(spaceSmall * 1.5 + barWidth * 3 + spaceBig), 3, frameCount % 3);
    stripe(-(spaceSmall / 2 + barWidth * 2 + spaceBig), 10, frameCount % 10);
    stripe(-(spaceSmall / 2 + barWidth), 6, frameCount % 6);
    stripe(spaceSmall / 2, 10, frameCount % 10);
    stripe(spaceSmall / 2 + barWidth + spaceBig, 6, frameCount % 6);
    stripe(spaceSmall * 1.5 + barWidth * 2 + spaceBig, 10, frameCount % 10);

    fill(0, 0, 0, 0);
    strokeWeight(3);

    circle(-(spaceSmall * 1.5 + spaceBig + barWidth * 2 + circleRadius), 25, 50);
    circle(-(spaceSmall / 2 + spaceBig + barWidth + circleRadius), 25, 50);
    circle(-(spaceSmall / 2 + circleRadius), 25, 50);
    circle(spaceSmall / 2 + circleRadius, 25, 50);
    circle(spaceSmall / 2 + spaceBig + barWidth + circleRadius, 25, 50);
    circle(spaceSmall * 1.5 + spaceBig + barWidth * 2 + circleRadius, 25, 50);
}

function stripe(x, length, num) {
    push();

    translate(x, -6);

    translate(0, -(num % length) * 50);
    fill(230);
    strokeWeight(4);
    rect(0, 0, 50, 50 * length + 15);

    fill(0);
    strokeWeight(1);
    for (let i = 0; i < length; i++) {
        text(i, 25, i * 50 + 25);
    }

    pop();
}
