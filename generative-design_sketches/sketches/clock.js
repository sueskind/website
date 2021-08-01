let spaceSmall = 10;
let spaceBig = 30;
let barWidth = 50;
let circleRadius = 25;
let borderRadius = 20;

let majorFontSize = 36;
let fontSize = 28;

let backgroundColor = 230;
let colorSaturation = 30;
let colorRange = 30;
let colorStart;

let numberFont;

function preload() {
    numberFont = loadFont("../fonts/SourceCodePro-Bold.ttf");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);

    stroke(0);
    colorMode(HSB, 100);

    textFont(numberFont);
    textSize(fontSize);
    textAlign(CENTER, CENTER);

    colorStart = random(0, 100);
}

function draw() {
    translate(width / 2, height / 2);
    background(backgroundColor);

    let time = ((hour() * 60 + minute()) * 60 + second()) * 1000 + new Date().getMilliseconds();

    stripe(-(spaceSmall * 1.5 + barWidth * 3 + spaceBig), 3, Math.floor(hour() / 10), (time / 1000 / 60 / 60 / 10 % 3) / 3);
    stripe(-(spaceSmall / 2 + barWidth * 2 + spaceBig), 10, hour() % 10, (time / 1000 / 60 / 60 % 10) / 10);
    stripe(-(spaceSmall / 2 + barWidth), 6, Math.floor(minute() / 10), (time / 1000 / 60 / 10 % 6) / 6);
    stripe(spaceSmall / 2, 10, minute() % 10, (time / 1000 / 60 % 10) / 10);
    stripe(spaceSmall / 2 + barWidth + spaceBig, 6, Math.floor(second() / 10), (time / 1000 / 10 % 6) / 6);
    stripe(spaceSmall * 1.5 + barWidth * 2 + spaceBig, 10, second() % 10, (time / 1000 % 10) / 10);

    fill(0, 0, 0, 0);
    strokeWeight(3);

    circle(-(spaceSmall * 1.5 + spaceBig + barWidth * 2 + circleRadius), 25, 50);
    circle(-(spaceSmall / 2 + spaceBig + barWidth + circleRadius), 25, 50);
    circle(-(spaceSmall / 2 + circleRadius), 25, 50);
    circle(spaceSmall / 2 + circleRadius, 25, 50);
    circle(spaceSmall / 2 + spaceBig + barWidth + circleRadius, 25, 50);
    circle(spaceSmall * 1.5 + spaceBig + barWidth * 2 + circleRadius, 25, 50);
}

function stripe(x, length, num, progress) {
    push();

    translate(x, -6);

    translate(0, -(num % length) * barWidth);

    let hue = (progress * colorRange + colorStart) % 100;
    fill(hue, colorSaturation, 100);
    strokeWeight(4);
    rect(0, 0, barWidth, barWidth * length + 15, borderRadius);

    fill(0);
    strokeWeight(1);
    for (let i = 0; i < length; i++) {
        if (i === num) {
            textSize(majorFontSize);
        }
        text(i, barWidth / 2, (i + 0.5) * barWidth);
        if (i === num) {
            textSize(fontSize);
        }
    }

    pop();
}
