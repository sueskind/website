let positions;
let velocities;
let forces;

let count = 300;
let pointSize = 7;

let g = 500;
let d = 0.90;
let distanceLimit = 10;
let mouseFactor = 10;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);

    positions = [];
    velocities = [];
    forces = [];
    for (let i = 0; i < count; i++) {
        positions.push(createVector(random(10, width - 10), random(10, height - 10)));
        velocities.push(createVector(0, 0));
        forces.push(createVector(0, 0));
    }
}

function draw() {
    background(255);

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

        if (mouseIsPressed) {
            forces[i].add(calcForce(positions[i], createVector(mouseX, mouseY), mouseFactor, distanceLimit));
        }

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