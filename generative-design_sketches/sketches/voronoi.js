let positions;
let velocities;
let forces;

let count = 100;
let pointSize = 7;

let g = 1;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);

    positions = [];
    velocities = [];
    forces = [];
    for (let i = 0; i < count; i++) {
        positions.push(createVector(random(0, width), random(0, height)));
        velocities.push(createVector(0, 0));
        forces.push(createVector(0, 0));
    }
}

function draw() {
    background(255);

    let temp, x, y;
    for (let i = 0; i < count; i++) {
        forces[i] = createVector(0, 0);

        for (let j = 0; j < count; j++) {
            if (i !== j) {
                temp = p5.Vector.sub(positions[i], positions[j]);
                temp.div(temp.magSq());
                forces[i].add(temp);
            }
        }

        forces[i].mult(g);
    }

    for (let i = 0; i < count; i++) {
        velocities[i].add(forces[i]);
        positions[i].add(velocities[i]);
    }

    noStroke();
    fill(0);
    for (let i = 0; i < count; i++) {
        circle(positions[i].x, positions[i].y, pointSize);
    }
}