let positions;
let velocities;
let forces;

let count = 400;
let pointSize = 7;

let g = 10;
let d = 0.95;

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

    let temp, x, y;
    for (let i = 0; i < count; i++) {
        forces[i] = createVector(0, 0);

        for (let j = 0; j < count; j++) {
            if (i !== j) {
                temp = p5.Vector.sub(positions[i], positions[j]);
                temp.div(temp.mag() ** 3);
                forces[i].add(temp);
            }
        }

        x = positions[i].x;
        y = positions[i].y;

        // left
        temp = p5.Vector.sub(positions[i], createVector(0, y));
        temp.div(temp.mag() ** 3);
        forces[i].add(temp);

        // right
        temp = p5.Vector.sub(positions[i], createVector(width, y));
        temp.div(temp.mag() ** 3);
        forces[i].add(temp);

        // top
        temp = p5.Vector.sub(positions[i], createVector(x, 0));
        temp.div(temp.mag() ** 3);
        forces[i].add(temp);

        // bottom
        temp = p5.Vector.sub(positions[i], createVector(x, height));
        temp.div(temp.mag() ** 3);
        forces[i].add(temp);


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