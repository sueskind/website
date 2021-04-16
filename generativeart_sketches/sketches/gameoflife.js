var pixels;
var pixel_size;

var rows;
var cols;

var state;

var button_start;
var button_reset;
var slider_speed;
var slider_zoom;

var press_cooled;
var last_pressed;

var accent_color;

function setup() {
    createCanvas(windowWidth, windowHeight);
    noStroke();
    textSize(15);
    colorMode(HSB, 100, 100, 100);

    button_start = createButton("Start");
    button_start.position(20, 45);
    button_start.mousePressed(start);
    button_reset = createButton("Reset");
    button_reset.position(20, 75);
    button_reset.mousePressed(reset);
    slider_speed = createSlider(1, 60, 10);
    slider_speed.position(20, 105);
    slider_zoom = createSlider(20, 500, 200);
    slider_zoom.position(20, 135);
    button_reset = createButton("Do something cool!");
    button_reset.position(20, 165);
    button_reset.mousePressed(do_sth_cool);

    press_cooled = true;
    last_pressed = [-1, -1];
    pixel_size = 3;

    reset();
}

function reset() {
    frameRate(60);
    state = "drawing";
    accent_color = random() * 100;

    pixels = [];
    rows = Math.ceil(height / pixel_size);
    cols = Math.ceil(width / pixel_size);
    for (let i = 0; i < rows; i++) {
        pixels.push([])
        for (let j = 0; j < cols; j++) {
            pixels[i].push(0);
        }
    }
}

function start() {
    state = "running";
}

function draw() {
    background(0);
    fill(100);
    text("Speed", slider_speed.x * 2 + slider_speed.width, 120);
    text("Zoom", slider_zoom.x * 2 + slider_zoom.width, 150);
    if (state == "drawing") {
        fill(100);
        text("Draw, then press 'Start'.", 20, 35);
    } else {
        fill(frameCount * 20 % 80 + 20);
        text("Running...", 20, 35);
    }
    translate(width / 2, height / 2);
    scale(slider_zoom.value() / 20);
    translate(-width / 2, -height / 2);

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (pixels[i][j]) {
                let n = noise(i * 0.2, j * 0.2, millis() / 100);
                fill((accent_color + n * 20) % 100, 90, n * 30 + 60);
                rect(j * pixel_size, i * pixel_size, pixel_size, pixel_size);
            }
        }
    }
    if (state == "drawing") {
        let mX = (mouseX - width / 2) / (slider_zoom.value() / 20);
        let mY = (mouseY - height / 2) / (slider_zoom.value() / 20);
        if (mouseIsPressed && (mouseX > 220 || mouseY > 200) && (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)) {
            let x = Math.floor(cols / 2 + mX / pixel_size);
            let y = Math.floor(rows / 2 + mY / pixel_size);
            if (press_cooled || last_pressed[0] != x || last_pressed[1] != y) {
                if (pixels[y][x]) {
                    pixels[y][x] = 0;
                } else {
                    pixels[y][x] = 1;
                }
                last_pressed = [x, y];
            }
            press_cooled = false;
        } else {
            press_cooled = true;
        }
    } else if (state == "running") {
        frameRate(slider_speed.value());
        let new_pixels = [];
        for (let i = 0; i < rows; i++) {
            new_pixels.push([]);
            for (let j = 0; j < cols; j++) {
                let n = neighbours(i, j);
                if (pixels[i][j]) {
                    if (n == 2 || n == 3) {
                        new_pixels[i].push(1);
                    } else {
                        new_pixels[i].push(0);
                    }
                } else {
                    if (n == 3) {
                        new_pixels[i].push(1);
                    } else {
                        new_pixels[i].push(0);
                    }
                }
            }
        }
        pixels = new_pixels;
    }
}

function neighbours(i, j) {
    sum = 0;
    for (k = -1; k <= 1; k++) {
        for (l = -1; l <= 1; l++) {
            if (!(k == 0 && l == 0)) {
                sum += pixels[(i + rows + k) % rows][(j + cols + l) % cols];
            }
        }
    }
    return sum;
}

function random_field() {
    out = [];
    for (let i = 0; i < pixels.length - 2; i++) {
        out.push([]);
        for (let j = 0; j < pixels[0].length - 2; j++) {
            if (random() < 0.3) {
                out[i].push(1);
            } else {
                out[i].push(0);
            }
        }
    }
    return out;
}

function do_sth_cool() {
    function random_field() {
        out = [];
        for (let i = 0; i < pixels.length - 2; i++) {
            out.push([]);
            for (let j = 0; j < pixels[0].length - 2; j++) {
                if (random() < 0.3) {
                    out[i].push(1);
                } else {
                    out[i].push(0);
                }
            }
        }
        return out;
    }

    function solid() {
        out = [];
        for (let i = 0; i < pixels.length / 3; i++) {
            out.push([]);
            for (let j = 0; j < pixels[0].length / 3; j++) {
                out[i].push(1);
            }
        }
        return out;
    }

    function fromString(s) {
        let out = [[]];
        let line = 0;
        for (let i = 0; i < s.length; i++) {
            if (s.charAt(i) == '\n') {
                line++;
                out.push([]);
            } else {
                out[line].push(parseInt(s.charAt(i)));
            }
        }
        return out;
    }

    let presets = [
        random_field(),
        solid(),
        fromString("000000000000000000000000100000000000\n" +
            "000000000000000000000010100000000000\n" +
            "000000000000110000001100000000000011\n" +
            "000000000001000100001100000000000011\n" +
            "110000000010000010001100000000000000\n" +
            "110000000010001011000010100000000000\n" +
            "000000000010000010000000100000000000\n" +
            "000000000001000100000000000000000000\n" +
            "000000000000110000000000000000000000"),//Glider Gun
        fromString("1110111\n1000001\n1110111"),
        fromString("0100000\n0001000\n1100111"),//Acorn
        fromString("11111\n00000\n10001\n00000\n11111"),//Spaceship
        fromString("0110110\n0110110\n0010100\n1010101\n1010101\n1100011")//Tumbler
    ];
    reset();
    inject(presets[Math.floor(random() * presets.length)]);
}

function inject(array2d) {
    let new_x_mid = Math.floor(array2d[0].length / 2);
    let new_y_mid = Math.floor(array2d.length / 2);
    let x_mid = Math.floor(pixels[0].length / 2);
    let y_mid = Math.floor(pixels.length / 2);
    for (let i = 0; i < array2d.length; i++) {
        for (let j = 0; j < array2d[0].length; j++) {
            pixels[y_mid - new_y_mid + i][x_mid - new_x_mid + j] = array2d[i][j];
        }
    }
}
