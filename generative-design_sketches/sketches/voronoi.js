let positions;
let velocities;
let forces;

let count = 0;
let pointSize = 7;

let g = 500;
let d = 0.90;
let distanceLimit = 10;
let mouseFactor = 10;

let lastFrame = 0;
let cooldown = 5;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);

    positions = [];
    velocities = [];
    forces = [];
}

function draw() {
    background(255);

    if (mouseIsPressed && lastFrame + cooldown < frameCount) {
        positions.push(createVector(mouseX + random(-3, 3), mouseY + random(-3, 3)));
        velocities.push(createVector(0, 0));
        forces.push(createVector(0, 0));
        count += 1;
        lastFrame = frameCount;
    }

    let x, y;
    for (let i = 0; i < count; i++) {
        forces[i] = createVector(0, 0);

        for (let j = 0; j < count; j++) {
            if (i !== j) {
                forces[i].add(calcForce(positions[i], positions[j], 1, distanceLimit));
            }
        }

        x = positions[i].x;
        y = positions[i].y;

        // left
        forces[i].add(calcForce(positions[i], createVector(0, y), 1, distanceLimit));

        // right
        forces[i].add(calcForce(positions[i], createVector(width, y), 1, distanceLimit));

        // top
        forces[i].add(calcForce(positions[i], createVector(x, 0), 1, distanceLimit));

        // bottom
        forces[i].add(calcForce(positions[i], createVector(x, height), 1, distanceLimit));

        forces[i].mult(g);
        forces[i].limit(g);
    }

    let next;
    for (let i = 0; i < count; i++) {
        velocities[i].add(forces[i]);
        velocities[i].setMag(d * velocities[i].mag())

        next = p5.Vector.add(positions[i], velocities[i]);
        if (next.x <= 0 || next.x >= width) {
            velocities[i].mult(createVector(-1, 1));
        }
        if (next.y <= 0 || next.y >= height) {
            velocities[i].mult(createVector(1, -1));
        }
        positions[i].add(velocities[i]);
    }

    noStroke();
    fill(0);
    for (let i = 0; i < count; i++) {
        circle(positions[i].x, positions[i].y, pointSize);
    }
}

function calcForce(thisPosition, otherPosition, factor, minLimit) {
    let temp = p5.Vector.sub(thisPosition, otherPosition);
    if (temp.mag() < minLimit) {
        temp.setMag(minLimit);
    }
    temp.div(temp.mag() ** 3);
    temp.mult(factor);
    return temp;
}