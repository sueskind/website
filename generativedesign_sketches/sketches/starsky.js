var pos;
var vel;
var acc;

var count;
var radius = 3;
var g;
var acc_max;
var vel_max = 15;

var accent_color;

var slider_count;
var slider_g;
var slider_max_a;

function setup() {
    createCanvas(windowWidth, windowHeight);
    ellipseMode(RADIUS);
    colorMode(HSB, 100, 100, 100);
    noStroke();
    textSize(15);

    slider_count = createSlider(2, 26, 20);
    slider_count.position(20, 20);
    slider_g = createSlider(40, 200, 180);
    slider_g.position(20, 50);
    slider_max_a = createSlider(6, 50, 10);
    slider_max_a.position(20, 80);

    accent_color = random() * 100;

    pos = [];
    vel = [];
    acc = [];
}

function draw() {
    count = Math.floor((slider_count.value() / 2) ** 2 * 3);
    g = slider_g.value();
    acc_max = slider_max_a.value() / 10;

    while (count > pos.length) {
        pos.push(createVector(random(30, width - 30), random(30, height - 30)));
        vel.push(createVector(0, 0));
        acc.push(createVector(0, 0));
    }
    while (count < pos.length) {
        pos.pop();
        vel.pop();
        acc.pop();
    }

    background(0);
    fill(100);
    text("Count", slider_count.x * 2 + slider_count.width, 35);
    text("G-constant", slider_g.x * 2 + slider_g.width, 65);
    text("Max. acceleration", slider_max_a.x * 2 + slider_max_a.width, 95);

    for (let i = 0; i < count; i++) {
        fill((vel[i].mag() / vel_max * 60 + accent_color) % 100, 100, 100);
        ellipse(pos[i].x, pos[i].y, radius, radius);
    }
    if (mouseIsPressed && (mouseX > 290 || mouseY > 110)) {
        let mouse = createVector(mouseX, mouseY);
        for (let i = 0; i < count; i++) {
            let sub = p5.Vector.sub(mouse, pos[i]);
            if (sub.mag() > 1) {
                sub.setMag(g / sub.mag());
                if (sub.magSq() > acc_max ** 2) {
                    sub.setMag(acc_max);
                }
                acc[i] = sub;
            } else {
                acc[i] = createVector(0, 0);
            }
            vel[i].add(acc[i]);
            if (vel[i].mag() > vel_max) {
                vel[i].setMag(vel_max);
            }
        }
    } else {
        for (let i = 0; i < count; i++) {
            vel[i].mult(0.99);
        }
    }
    for (let i = 0; i < count; i++) {
        pos[i].add(vel[i]);
        if ((pos[i].x < radius && vel[i].x < 0) || (pos[i].x > width && vel[i].x > 0)) {
            vel[i].x = -vel[i].x;
        }
        if ((pos[i].y < radius && vel[i].y < 0) || (pos[i].y > height && vel[i].y > 0)) {
            vel[i].y = -vel[i].y;
        }
    }


}
