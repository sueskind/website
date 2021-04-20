function preload() {
}

var particles = [];
const particlesPerMP = 600;
const backColor = 9;
var particleCount;
const particleSize = 4;
const range = 65;
const maxVel = 0.08;
const maxAcc = 0.05;
const change = 0.04;
const margin = -30;
var noiseScale;
const colorRange = 60;
var colorOffset;
const framesToReset = 30 * 60;
const slideFore = 10;
const slideMid = 7;
const slideBack = -5;
const fade = 100;
const thickness = 0.5;
const probabilityToConnect = 0.5;
var mobile;
var currentAccX = 0;
var currentAccY = 0;
var smallFontSize = 20;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 100, 100, 100, 100);
    background(backColor);
    frameRate(30);
    textAlign(CENTER);
    ellipseMode(CENTER);
    particleCount = width * height / 1000000 * particlesPerMP;
    noiseScale = width * height / 25000000; //Bei 1000x500 => 0.02
    colorOffset = random(0, 100);

    mobile = mobilecheck();
    if (mobile) {
        smallFontSize = 16;
    }

    let primaryColor = hsvToHexString(colorOffset / 100, 0.9, 1);
    document.getElementById("j").style.color = primaryColor;
    document.getElementById("o").style.color = primaryColor;
    document.getElementById("n").style.color = primaryColor;
    document.getElementById("a").style.color = primaryColor;
    document.getElementById("s").style.color = primaryColor;

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    restructure();
}

function restructure() {
    let qt = new Quadtree(0, 0, height, width, 4);
    for (let p of particles) {
        qt.insert(p);
        p.neighbors = [];
    }
    for (let p of particles) {
        let nearPoints = [];
        qt.query(p.bubble, nearPoints);
        for (let near of nearPoints) {
            if (p != near && random() < probabilityToConnect &&
                !near.neighbors.includes(p)) {
                p.neighbors.push(near);
            }
        }
    }
}

var transX = 0.0;
var transY = 0.0;

function draw() {
    if (mobile) {
        transX = (-currentAccX * 150.0 + transX * 9) / 10;
        transY = (currentAccY * 150.0 + transY * 9) / 10;
    } else {
        transX = mouseX;
        transY = mouseY;
    }
    if (!mobile && frameCount % framesToReset == 0) {
        restructure();
    }
    fill(backColor, fade);
    rect(-10, -10, width + 10, height + 10);

    push();
    translate(map(transX, 0, width, -slideBack, slideBack),
        map(transY, 0, height, -slideBack, slideBack));
    for (let p of particles) {
        if (!mobile) {
            p.move();
        }
        p.show();
    }
    pop();

    textSize(32);
    fill(100);
    textStyle(BOLD);
    text("JONAS SÜSKIND", width / 2, height / 2);

    textSize(smallFontSize);
    textStyle(NORMAL);
    fill(90);
    text("computer science | photography | graphic design", width / 2, height / 2 + 20);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(10);
}


class Particle {
    constructor() {
        this.pos = createVector(random(margin, width - margin), random(margin, height - margin));
        this.vel = p5.Vector.random2D();
        this.vel.setMag(random(0, maxVel));
        this.acc = p5.Vector.random2D();
        this.acc.setMag(random(0, maxAcc));
        this.change = p5.Vector.random2D();
        this.change.setMag(change);
        this.bubble = new Circle(this.pos, range);
        this.neighbors = [];
    }

    show() {
        for (let n of this.neighbors) {
            strokeWeight(thickness);
            let noi = noise(this.pos.x * noiseScale,
                this.pos.y * noiseScale);
            stroke((noi * colorRange - colorRange / 2 + colorOffset) % 100,
                noi * 20 + 80, noi * 30 + 70);
            line(this.pos.x, this.pos.y, n.pos.x, n.pos.y);
        }
        fill(100);
        noStroke();
        ellipse(this.pos.x, this.pos.y, particleSize, particleSize);
    }

    move() {
        this.pos.add(this.vel);
        this.vel.add(this.acc);
        if (this.vel.mag() > maxVel) {
            this.vel.setMag(0.9 * maxVel);
        }
        this.acc.add(this.change);
        if (this.acc.mag() > maxAcc) {
            this.acc.setMag(0.9 * maxVel);
        }
        this.change = p5.Vector.random2D();
        this.change.setMag(change);
    }
}

class Quadtree {
    constructor(x, y, h, w, cap) {
        this.cap = cap;
        this.x = x;
        this.y = y;
        this.h = h;
        this.w = w;
        this.particles = [];
        this.divided = false;
    }

    contains(x, y) {
        return (x > this.x && x < this.x + this.w &&
            y > this.y && y < this.y + this.h);
    }

    insert(particle) {
        if (!this.contains(particle.pos.x, particle.pos.y)) {
            return;
        }

        if (this.particles.length < this.cap) {
            this.particles.push(particle);
        } else {
            if (!this.divided) {
                this.nw = new Quadtree(this.x, this.y, this.h / 2, this.w / 2, this.cap);
                this.ne = new Quadtree(this.x + this.w / 2, this.y, this.h / 2, this.w / 2, this.cap);
                this.sw = new Quadtree(this.x, this.y + this.h / 2, this.h / 2, this.w / 2, this.cap);
                this.se = new Quadtree(this.x + this.w / 2, this.y + this.h / 2, this.h / 2, this.w / 2, this.cap);
                this.divided = true;
            }
            this.nw.insert(particle);
            this.ne.insert(particle);
            this.sw.insert(particle);
            this.se.insert(particle);
        }
    }

    query(circle, arr) {
        if (circle.intersects(this.x, this.y, this.w, this.h)) {
            for (let p of this.particles) {
                if (circle.contains(p.pos)) {
                    arr.push(p);
                }
            }
            if (this.divided) {
                this.nw.query(circle, arr);
                this.ne.query(circle, arr);
                this.sw.query(circle, arr);
                this.se.query(circle, arr);
            }
        }
    }

    show() {
        strokeWeight(1);
        stroke(100);
        noFill();
        rect(this.x, this.y, this.w, this.h);
        if (this.divided) {
            this.nw.show();
            this.ne.show();
            this.sw.show();
            this.se.show();
        }
    }
}


class Circle {
    constructor(pos, r) {
        this.pos = pos;
        this.r = r;
    }

    intersects(x, y, w, h) {
        let deltaX = this.pos.x - this.max(x, this.min(this.pos.x, x + w));
        let deltaY = this.pos.y - this.max(y, this.min(this.pos.y, y + h));
        return (deltaX * deltaX + deltaY * deltaY) < (this.r * this.r);
    }

    contains(pos) {
        return this.pos.dist(pos) <= this.r;
    }

    min(a, b) {
        return a < b ? a : b;
    }

    max(a, b) {
        return a > b ? a : b;
    }
}

window.addEventListener('devicemotion', function (e) {
    currentAccX = parseFloat(e.accelerationIncludingGravity.x);
    currentAccY = parseFloat(e.accelerationIncludingGravity.y);
});

window.mobilecheck = function () {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};
