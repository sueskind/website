var count;
var frames_per_step;
var own_frame_count;

var slider_count;
var slider_speed;

var punkte;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 100, 100, 100);
    stroke(100);
    strokeWeight(1);
    textSize(15);
    fill(100);

    slider_count = createSlider(5, 300, 150);
    slider_count.position(20, 20);
    slider_speed = createSlider(1, 200, 40);
    slider_speed.position(20, 50);

    reset();
}

function reset() {
    own_frame_count = 0;
    count = slider_count.value();
    translate(width / 2, height / 2);
    var radius = windowHeight / 2 - 20;

    punkte = [];
    for (let i = 0; i < count; i++) {
        punkte.push([radius * cos(i * TWO_PI / count), radius * sin(i * TWO_PI / count)]);
    }
    translate(-width / 2, -height / 2);
}

function draw() {
    if (slider_count.value() != count) {
        count = slider_count.value();
        reset();
    } else {
        own_frame_count += slider_speed.value() / 2000;
        background(0);
        translate(width / 2, height / 2);
        for (let i = 0; i < count; i++) {
            stroke(i / count * 100, 100, 100);
            line(punkte[i % count][0], punkte[i % count][1],
                punkte[Math.floor((i * own_frame_count) % count)][0],
                punkte[Math.floor((i * own_frame_count) % count)][1]);
        }
        translate(-width / 2, -height / 2);
    }
    noStroke();
    text("Count", slider_count.x * 2 + slider_count.width, 35);
    text("Speed", slider_speed.x * 2 + slider_speed.width, 65);
}
