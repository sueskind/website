
// canvas constants
const margin = -30; // space around canvas borders
const backgroundColor = 9; // greyscale
const slideBack = -30; // parallax effect strength
const fade = 100; // opacity of newly drawn background (the lower, the more fading)

// variables for particles
const particlesPerMP = 600; // particles per megapixel screen resolution
const particleSize = 4;
const maxVel = 0.08; // cap for velocity
const maxAcc = 0.05; // cap for acceleration
const change = 0.04; // change of acceleration
let particles = []; //array for holding references
let particleCount;

// variables for interaction of particles
const range = 65; // distance to have a chance to connect
const framesToReset = 60 * 60 * 2; // 2 minutes, after that particles choose new neighbours
const probabilityToConnect = 0.5;

// colored lines
const colorRange = 60; // range on color wheel (0-100)
let colorOffset; // offset on color wheel
let noiseScale; // noise scale for color randomness
const thickness = 0.5; // weight of the lines

// mobile tilting
let mobile;
let currentAccX = 0;
let currentAccY = 0;
let transX = 0.0;
let transY = 0.0;

// text
let titleSize = 56;
let subtitleSize = 26;
let lineSpace = 40;
const textColor = 100;

// typing settings
const waitTextFull = 50;
const waitTextEmpty = 50;
const typingTextSpeed = 5;
const removingTextSpeed = 2;

const title = "JONAS SÜSKIND";
const subtitles = [
    "programming", "coding", "computer science", "generative design", "generative art", "photography", "graphic design",
    "I use arch btw ..."
]
let currentSubtitle;
let subtitleProgress = 0;
let waitingProgress = 0;
let subtitleState = 0;

let titleFont;
let subtitleFont;

function preload() {
    titleFont = loadFont("fonts/OpenSans-Regular.ttf");
    subtitleFont = loadFont("fonts/SourceCodePro-Bold.ttf")
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(60);

    colorMode(HSB, 100, 100, 100, 100);
    background(backgroundColor);
    noiseScale = width * height / 25000000; // At 1000x500 => 0.02
    colorOffset = random(0, 100);

    textAlign(CENTER);
    mobile = mobilecheck();
    if (mobile) {
        titleSize = 32;
        subtitleSize = 20;
        lineSpace = 26
    }
    currentSubtitle = int(random(0, subtitles.length - 1)); // -1 so easter egg can't be first

    let primaryColor = hsvToHexString(colorOffset / 100, 0.9, 1);
    document.getElementById("j").style.color = primaryColor;
    document.getElementById("o").style.color = primaryColor;
    document.getElementById("n").style.color = primaryColor;
    document.getElementById("a").style.color = primaryColor;
    document.getElementById("s").style.color = primaryColor;

    ellipseMode(CENTER);
    particleCount = width * height / 1000000 * particlesPerMP;
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
            if (p !== near && random() < probabilityToConnect &&
                !near.neighbors.includes(p)) {
                p.neighbors.push(near);
            }
        }
    }
}

function draw() {
    if (mobile) {
        transX = (-currentAccX * 150.0 + transX * 9) / 10;
        transY = (currentAccY * 150.0 + transY * 9) / 10;
    } else {
        transX = mouseX;
        transY = mouseY;
    }
    if (!mobile && frameCount % framesToReset === 0) {
        restructure();
    }
    fill(backgroundColor, fade);
    rect(-10, -10, width + 10, height + 10);

    push();
    translate(map(transX, 0, width, -slideBack, slideBack), map(transY, 0, height, -slideBack, slideBack));
    for (let p of particles) {
        if (!mobile) {
            p.move();
        }
        p.show();
    }
    pop();

    writeText();
}

function writeText() {

    fill(textColor);

    // Title
    textFont(titleFont);
    textSize(titleSize);
    text(title, width / 2, height / 2);

    // Subtitle
    if (subtitleState === 0) { // typing

        subtitleProgress += frameCount % typingTextSpeed === 0;

        if (subtitleProgress > subtitles[currentSubtitle].length) {
            subtitleState = 1;
        }

    } else if (subtitleState === 1) { // waiting in full length

        waitingProgress++;

        if (waitingProgress > waitTextFull) {
            waitingProgress = 0;
            subtitleState = 2;
        }

    } else if (subtitleState === 2) { // removing

        subtitleProgress -= frameCount % removingTextSpeed === 0;

        if (subtitleProgress < 1) {
            subtitleState = 3;
        }

    } else if (subtitleState === 3) { // waiting in zero length

        waitingProgress++;

        if (waitingProgress > waitTextEmpty) {
            waitingProgress = 0;
            subtitleState = 0;

            // draw new subtitle from list, but avoid the current one
            let newSubtitle = int(random(0, subtitles.length - 1))
            newSubtitle += newSubtitle >= currentSubtitle;
            currentSubtitle = newSubtitle;
        }

    }

    textFont(subtitleFont);
    textSize(subtitleSize);
    text(subtitles[currentSubtitle].substring(0, subtitleProgress), width / 2, height / 2 + lineSpace);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(backgroundColor);
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
            let noi = noise(this.pos.x * noiseScale, this.pos.y * noiseScale);
            stroke((noi * colorRange - colorRange / 2 + colorOffset) % 100, noi * 20 + 80, noi * 30 + 70);
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
