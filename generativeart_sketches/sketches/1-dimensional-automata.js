var pixels;
var count;

var slider_count;

function setup() {
    createCanvas(windowWidth, windowHeight);

    slider_count = createSlider(10, width, 30);
    slider_count.position(20, 20);

}

function reset() {
    count = slider_count.value();
    pixels = [get_start_state()];
}

function draw() {


}

function get_start_state() {
    let out = [];
    for (let i = 0; i < count; i++)
        if (i == Math.floor(count / 2))
            out.push(1);
        else
            out.push(0);
    return out;
}

function get_next_state(i) {

}
