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
    background(230);
    translate(width / 2, height / 2 - (frameCount % 5) * 50);
    stripe(6);

    fill(0, 0, 0, 0);
    strokeWeight(3);
    circle(25, 25 + (frameCount % 5) * 50, 50);
}

function stripe(num) {
    fill(230);
    strokeWeight(4);
    rect(0, 0, 50, 50 * num + 15);

    fill(0);
    strokeWeight(1);
    for (let i = 0; i < num; i++) {
        text(i, 25, i * 50 + 25);
    }
}
