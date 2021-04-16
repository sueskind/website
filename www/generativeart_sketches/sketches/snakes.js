var dirs;
var locs;

var slider_count;
var slider_thickness;
var slider_length;
var slider_angle;
var button_reset;

var color_offset;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 100, 100, 100);

    slider_count = createSlider(1, 400, 200);
    slider_count.position(20, 20);
    slider_thickness = createSlider(5, 200, 50);
    slider_thickness.position(20, 50);
    slider_length = createSlider(1, 20, 10);
    slider_length.position(20, 80);
    slider_angle = createSlider(0, 90, 40);
    slider_angle.position(20, 110);
    button_reset = createButton("Reset");
    button_reset.position(20, 140);
    button_reset.mousePressed(reset);

    textSize(15);
    fill(100);

    reset();
}

function reset() {
    background(0);
    dirs = [];
    locs = [];
    color_offset = random(0, 100);
}

function draw() {
    while (slider_count.value() < dirs.length) {
        dirs.pop();
        locs.pop();
    }
    while (slider_count.value() > dirs.length) {
        dirs.push(p5.Vector.random2D());
        locs.push(createVector(random(10, width - 10), random(10, height - 10)));
    }

    for (let i = 0; i < dirs.length; i++) {
        strokeWeight(slider_thickness.value() / 100);
        stroke((noise(locs[i].x / width * 10, locs[i].y / height * 10, frameCount / 100) * 100 + color_offset) % 100, random(50, 80), random(40, 90));
        line(locs[i].x, locs[i].y, locs[i].x + dirs[i].x, locs[i].y + dirs[i].y);
    }

    for (let i = 0; i < dirs.length; i++) {
        locs[i].add(dirs[i]);
        dirs[i].setMag(slider_length.value());
        dirs[i].rotate(radians(random(-slider_angle.value(), slider_angle.value())));
    }

    noStroke();
    text("Count", slider_count.x * 2 + slider_count.width, 35);
    text("Thickness", slider_thickness.x * 2 + slider_thickness.width, 65);
    text("Length", slider_length.x * 2 + slider_length.width, 95);
    text("MaxAngle", slider_angle.x * 2 + slider_angle.width, 125);
}
