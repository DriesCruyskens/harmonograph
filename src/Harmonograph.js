import * as dat from 'dat-gui';
import * as paper from 'paper';
import { saveAs } from 'file-saver';
import { makeNoise3D } from "open-simplex-noise";

export default class Harmonograph {
    // https://en.wikipedia.org/wiki/Harmonograph
    constructor(canvas_id) {
        // harmonograph{_a1__160,_f1__3,_p1__0.277,_d1__0.001,_a2__160,_f2__5,_p2__1.94,_d2__0.001,_a3__160,_f3__3,_p3__0,_d3__0.003,_a4__160,_f4__2,_p4__6.283,_d4__0,_strokeWidth__0.5,_t_max__500,_t_incr__0.01,_smoothing__79
        this.params = {
            a1: 160,
            f1: 3,
            p1: 0.277,
            d1: 0.001,
            a2: 160,
            f2: 5,
            p2: 1.94,
            d2: 0.001,
            a3: 160,
            f3: 3,
            p3: 0,
            d3: 0.003,
            a4: 160,
            f4: 2,
            p4: 6.283,
            d4: 0.,
            seed: Math.random() * 20000,
            strokeWidth: .6,
            t_max: 500,
            t_incr: .01,
            smoothing: 100,
            xMultiplier: 30,
            yMultiplier: 30,
        }

        Number.prototype.map = function (in_min, in_max, out_min, out_max) {
            return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }

        this.gui = new dat.GUI();
        this.canvas = document.getElementById(canvas_id);
        paper.setup(this.canvas);

        this.noise3D = makeNoise3D(Date.now());

        this.center = paper.view.center;

        this.init_gui();
        this.reset();
    }

    randomize() {
        // doing it in a programmatic way for ease of use
        // param_name: [min, max, decimal places]
        let config = {
            a1: [160, 160, 0],
            f1: [0, 5, 0],
            p1: [0, 2 * Math.PI, 3],
            d1: [0, 0.005, 3],
            a2: [160, 160, 0],
            f2: [0, 5, 0],
            p2: [0, 2 * Math.PI, 3],
            d2: [0, 0.005, 3],
            a3: [160, 160, 0],
            f3: [0, 5, 0],
            p3: [0, 2 * Math.PI, 3],
            d3: [0, 0.005, 3],
            a4: [160, 160, 0],
            f4: [0, 5, 0],
            p4: [0, 2 * Math.PI, 3],
            d4: [0, 0.005, 3],
            seed: [0, 20000, 2],
            smoothing: [50, 150, 2],
            xMultiplier: [10, 50, 2],
            yMultiplier: [10, 50, 2],
        }
        
        for (const param in config) {
            // assign to v for ease of use
            const v = config[param]
            // choose random value between two numbers
            let randomValue = Math.random() * (v[1] - v[0]) + v[0]
            // round to certain decimal places (so that all params can go in filename)
            randomValue = parseFloat(randomValue.toFixed(v[2]))
            // assign to parameter object
            this.params[param] = randomValue
        }

        this.reset();
    }

    // This function visually updates the dat.gui sliders. Useful after randomize has been called
    // to see the values and tweak them further. Not doing this after every randomize because it is quite
    // computationally expensive.
    updateSliders() {
        // consolidate all controllers in a single variable for easy iteration
        // controllers are both on the gui object as in their folder object
        let controllers = this.gui.__controllers;
        for (const f in this.gui.__folders) {
            Array.prototype.push.apply(controllers, this.gui.__folders[f].__controllers);
        }

        // iterate all controllers and adjusts its value if it exists in this.parameters
        controllers.forEach(c => {
            if (this.params[c.property] != undefined) {
                c.setValue(this.params[c.property])
            }
        })
    }

    reset() {
        paper.project.currentStyle = {
            strokeColor: 'black',
            strokeWidth: this.params.strokeWidth,
            //fillColor: '#0000FF01'
        };
        
        paper.project.clear();
        this.draw();
        paper.view.draw();
    }

    draw() {
        let path = new paper.Path()

        let x, y, xOffset, yOffset
        const smoothing = this.params.smoothing // easier to use

        for (let t = 0; t < this.params.t_max; t += this.params.t_incr) {

            x = this.params.a1 * 
                Math.sin(t * this.params.f1 + this.params.p1) * 
                Math.exp(-this.params.d1*t) +
                this.params.a2 * 
                Math.sin(t * this.params.f2 + this.params.p2) * 
                Math.exp(-this.params.d2*t)
            y = this.params.a3 * 
                Math.sin(t * this.params.f3 + this.params.p3) * 
                Math.exp(-this.params.d3*t) +
                this.params.a4 * 
                Math.sin(t * this.params.f4 + this.params.p4) * 
                Math.exp(-this.params.d4*t)

            // Move to center. Scaling is already done through the a parameter (amplitude)
            x += this.center.x
            y += this.center.y

            // Offset both axis, this gives a more pleasing result than only vertically or horizontally.
            xOffset = this.noise3D(x/smoothing, y/smoothing, this.params.seed)
            yOffset = this.noise3D(x/smoothing, y/smoothing, this.params.seed)

            // Map is pretty unnecessary but I can parameterize them later for more interesting results.
            xOffset = xOffset.map(-1, 1, 0, 1)
            yOffset = yOffset.map(-1, 1, 0, 1)

            // Multiply the noise based offset and add to x,y value.
            x += xOffset * this.params.xMultiplier
            y += yOffset * this.params.yMultiplier

            path.add([x, y])
        }
        path.smooth()
    }

    init_gui() {
        this.gui.add(this, 'randomize').name('Randomize');

        this.gui.add(this.params, 't_max', 0, 1000).onChange((value) => {
            this.params.t_max = value;
            this.reset();
        });

        this.gui.add(this.params, 't_incr', 0.001, 0.04).onChange((value) => {
            this.params.t_incr = value;
            this.reset();
        });

        let harmonograph = this.gui.addFolder('harmonograph');

        harmonograph.add(this.params, 'a1', 0., 500).step(1).onChange((value) => {
            this.params.a1 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f1', 0., 10.).step(1).onChange((value) => {
            this.params.f1 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p1', 0., 2 * Math.PI).step(0.001).onChange((value) => {
            this.params.p1 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd1', 0., 0.01).step(0.001).onChange((value) => {
            this.params.d1 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'a2', 0., 500).step(1).onChange((value) => {
            this.params.a2 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f2', 0., 10.).step(1).onChange((value) => {
            this.params.f2 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p2', 0., 2 * Math.PI).step(0.001).onChange((value) => {
            this.params.p2 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd2', 0., 0.01).step(0.001).onChange((value) => {
            this.params.d2 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'a3', 0., 500).step(1).onChange((value) => {
            this.params.a3 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f3', 0., 10.).step(1).onChange((value) => {
            this.params.f3 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p3', 0., 2 * Math.PI).step(0.001).onChange((value) => {
            this.params.p3 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd3', 0., 0.01).step(0.001).onChange((value) => {
            this.params.d3 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'a4', 0., 500).step(1).onChange((value) => {
            this.params.a4 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f4', 0., 10.).step(1).onChange((value) => {
            this.params.f4 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p4', 0., 2 * Math.PI).step(0.001).onChange((value) => {
            this.params.p4 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd4', 0., 0.01).step(0.001).onChange((value) => {
            this.params.d4 = value;
            this.reset();
        });

        let noise = this.gui.addFolder('noise');

        noise.add(this.params, 'seed', 0, 20000).step(0.01).onChange((value) => {
            this.params.seed = value;
            this.reset();
        });

        noise.add(this.params, 'smoothing', 0, 150).step(0.01).onChange((value) => {
            this.params.smoothing = value;
            this.reset();
        });

        noise.add(this.params, 'xMultiplier', 0, 30).step(0.01).onChange((value) => {
            this.params.xMultiplier = value;
            this.reset();
        });

        noise.add(this.params, 'yMultiplier', 0, 30).step(0.01).onChange((value) => {
            this.params.yMultiplier = value;
            this.reset();
        });

        let style = this.gui.addFolder('style');

        style.add(this.params, 'strokeWidth', .5, 5).onChange((value) => {
            this.params.strokeWidth = value;
            this.reset();
        });

        this.gui.add(this, 'updateSliders').name('update sliders');
        this.gui.add(this, 'exportSVG').name('Export SVG');
    }

    exportSVG() {
        var svg = paper.project.exportSVG({asString: true});
        var blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
        saveAs(blob, 'harmonograph' + JSON.stringify(this.params) + '.svg');
    }
}