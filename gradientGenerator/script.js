let c = document.getElementById("myCanvas");
let ctx = c.getContext("2d");

let red_s = document.getElementById("red_slider");
let green_s = document.getElementById("green_slider");
let blue_s = document.getElementById("blue_slider");

let red_v = 255;
let green_v = 255;
let blue_v = 255;

red_s.oninput = function () {
    red_v = red_s.value;
    red_s.style.background = rgbToHex(red_s.value, 0, 0);
}

green_s.oninput = function () {
    green_v = green_s.value;
    green_s.style.background = rgbToHex(0, green_s.value, 0);
}

blue_s.oninput = function () {
    blue_v = blue_s.value;
    blue_s.style.background = rgbToHex(0, 0, blue_s.value);
}

let width = c.width;
let height = c.height;

let size = 5;

let mousex;
let mousey;

let x = 750;
let y = 750;

const layer_sizes = [2, 6, 3]
let input_values;
let n;
let group = []


function mapValue(val, low, high, range_low, range_high) {
    let inc = (range_high - range_low) / (high - low)
    return range_low + ((val - low) * inc)
}

function setup() {
    ctx.canvas.width = window.innerWidth - 100;
    width = c.width
}

function run() {
    group = [];
    n = new Net(layer_sizes);
    update();
    draw();
    updateHeaderColor();
}


function updateHeaderColor() {
    let header = document.getElementById("header");
    let credits = document.getElementById("credits");

    let txt1 = header.textContent;
    let newText1 = "";
    let txt2 = credits.textContent;
    let newText2 = "";

    for (let i = 0; i < txt1.length; i++) {
        newText1 += txt1.charAt(i).fontcolor(getPixel(i));
    }
    for (let i = 0; i < txt2.length; i++) {
        newText2 += txt2.charAt(i).fontcolor(getPixel(i));
    }

    header.innerHTML = newText1;
    credits.innerHTML = newText2;
}

function getPixel(i) {
    let data = ctx.getImageData(i * (width / 45) + 2, 1, 3, 3).data;
    console.log(data[0], data[1], data[2]);
    return rgbToHex(data[0], data[1], data[2]);
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


function update() {

    for (let x = 1; x < width - 1; x += size) {
        for (let y = 1; y < height - 1; y += size) {

            dx = mapValue(x, 0, width, 0, 1);
            dy = mapValue(y, 0, height, 0, 1)

            input_values = [dx / 100, dy / 100]

            n.pushForward(input_values)

            group.push(new Particle(x, y, n.outputs()[0], n.outputs()[1], n.outputs()[2]))
        }
    }

    let minH = Infinity;
    let maxH = -Infinity;
    let minI = Infinity;
    let maxI = -Infinity;
    let minJ = Infinity;
    let maxJ = -Infinity;


    for (let g of group) {
        if (g.h < minH) {
            minH = g.h;
        }
        if (g.h > maxH) {
            maxH = g.h;
        }

        if (g.i < minI) {
            minI = g.i;
        }
        if (g.i > maxI) {
            maxI = g.i;
        }

        if (g.j < minJ) {
            minJ = g.j;
        }
        if (g.j > maxJ) {
            maxJ = g.j;
        }
    }


    for (let g of group) {
        g.h = mapValue(g.h, minH, maxH, 0, red_v);
        g.i = mapValue(g.i, minI, maxI, 0, green_v);
        g.j = mapValue(g.j, minJ, maxJ, 0, blue_v);
    }

}


function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let g of group) {
        g.draw();
    }
}


class Particle {

    constructor(x, y, h, i, j) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.i = i;
        this.j = j;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = 'rgb(' + this.h + ', ' + this.i + ', ' + this.j + ')';
        ctx.rect(this.x, this.y, size, size);
        ctx.fill();
    }
}


class Node {
    constructor(value) {
        this.value = value;
    }
}

class WNode {

    constructor(value, prev_, next_) {
        this.value = 0;
        this.prev = prev_;
        this.next = next_;
    }

    setValueRandom() {
        this.value = (Math.random() * 2) - 1;
    }
    passForwardValue() {
        if (this.prev != null) {
            this.next.value += this.prev.value * this.value;
        }

    }
}

class Layer {
    constructor(size) {
        this.size = size;
        this.nodes = [];
        for (let g = 0; g < this.size; g++) {
            this.nodes.push(new Node(0));
        }

    }

    printLayers() {
        console.log('\nLayer');
        for (let n of this.nodes) {
            console.log(n.value);
        }
        console.log();
    }
    setNodeValues_list(nVals) {
        for (let n = 0; n < this.size; n++) {
            this.nodes[n].value = nVals[n];
        }
    }

}

class WLayer {
    constructor(prev_layer, next_layer) {
        this.prev_layer = prev_layer;
        this.next_layer = next_layer;

        this.weights = [];

        for (let pNode of this.prev_layer.nodes) {
            for (let nNode of this.next_layer.nodes) {
                this.weights.push(new WNode(0, pNode, nNode));
            }
        }

        for (let s of this.weights) {
            s.setValueRandom();
        }


    }
    printLayers() {
        console.log('\nWeight Layer');
        for (let w of this.weights) {
            console.log(w.value);
        }
        console.log();
    }
}

class Net {
    constructor(layer_sizes) {
        this.layer_sizes = layer_sizes;
        this.layers = [];
        for (let i = 0; i < this.layer_sizes.length; i++) {
            this.layers.push(new Layer(this.layer_sizes[i]))
        }

        this.weighted_layers = []
        this.createWeightLayers()
    }


    createWeightLayers() {
        this.weighted_layers = [];
        for (let l = 0; l < this.layers.length - 1; l++) {
            this.weighted_layers.push(new WLayer(this.layers[l], this.layers[l + 1]));
        }
    }

    setInputValues(arr) {
        this.layers[0].setNodeValues_list(arr);
    }

    pushForward(arr) {

        this.resetLayers();

        this.setInputValues(arr);

        let count = 0;
        for (let w of this.weighted_layers) {

            for (let wN of w.weights) {
                wN.passForwardValue();
            }

            for (let n of this.layers[count].nodes) {
                n = this.sig(n);
            }
            count++;

        }

    }

    outputs() {
        let return_arr = []
        for (let n of this.layers[this.layers.length - 1].nodes) {
            return_arr.push(n.value)
        }

        return return_arr
    }

    resetLayers() {

        for (let l of this.layers) {
            for (let n of l.nodes) {
                n.value = 0
            }
        }

    }

    merge(partner) {
        resetLayers();
        for (let wL = 0; wL < this.weighted_layers.length; wL++) {
            for (let sW = 0; sW < this.weighted_layers[wL].weights.length; sW++) {

                let rand = Math.random()
                if (rand > .5) {
                    this.weighted_layers[wL].weights[sW].value = partner.weighted_layers[wL].weights[sW].value
                }

            }
        }
    }

    sig(n) {
        return 1 / (1 + Math.pow(Math.E, -n))
    }

    printLayers() {
        for (let i = 0; i < this.weighted_layers.length; i++) {
            this.layers[i].printLayers()
            this.weighted_layers[i].printLayers()
        }
        this.layers[this.layers.length - 1].printLayers()
    }
}
