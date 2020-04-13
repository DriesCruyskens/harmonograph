import * as dat from 'dat-gui';
import * as paper from 'paper';
import { saveAs } from 'file-saver';
import { makeNoise3D } from "open-simplex-noise";

export default class Harmonograph {
    // http://www.walkingrandomly.com/?p=151
    // https://en.wikipedia.org/wiki/Harmonograph 
    constructor(canvas_id) {
        this.params = {
            strokeWidth: 1,
            t_max: 500,
            t_incr: .01,
            a1: 160,
            f1: 1.00,
            p1: 1.870793683966252,
            d1: 0.0006616579162407246,
            a2: 160,
            f2: 4.,
            p2: 0.9700411694639827,
            d2: 0.00562409228804616,
            a3: 160,
            f3: 1.,
            p3: 1.247195,
            d3: 0.0,
            a4: 160,
            f4: 2.,
            p4: 5.,
            d4: 0.,
            smoothing: 60,
            xMultiplier: 15,
            yMultiplier: 15,
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
        this.reset()
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
            xOffset = this.noise3D(x/smoothing, y/smoothing, 0)
            yOffset = this.noise3D(x/smoothing, y/smoothing, 0)

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

        harmonograph.add(this.params, 'a1', 0., 500).onChange((value) => {
            this.params.a1 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f1', 0., 10.).onChange((value) => {
            this.params.f1 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p1', 0., 2 * Math.PI).onChange((value) => {
            this.params.p1 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd1', 0., 0.01).onChange((value) => {
            this.params.d1 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'a2', 0., 500).onChange((value) => {
            this.params.a2 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f2', 0., 10.).onChange((value) => {
            this.params.f2 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p2', 0., 2 * Math.PI).onChange((value) => {
            this.params.p2 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd2', 0., 0.01).onChange((value) => {
            this.params.d2 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'a3', 0., 500).onChange((value) => {
            this.params.a3 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f3', 0., 10.).onChange((value) => {
            this.params.f3 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p3', 0., 2 * Math.PI).onChange((value) => {
            this.params.p3 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd3', 0., 0.01).onChange((value) => {
            this.params.d3 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'a4', 0., 500).onChange((value) => {
            this.params.a4 = value;
            this.reset();
        });
        
        harmonograph.add(this.params, 'f4', 0., 10.).onChange((value) => {
            this.params.f4 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'p4', 0., 2 * Math.PI).onChange((value) => {
            this.params.p4 = value;
            this.reset();
        });

        harmonograph.add(this.params, 'd4', 0., 0.01).onChange((value) => {
            this.params.d4 = value;
            this.reset();
        });

        let noise = this.gui.addFolder('noise');

        noise.add(this.params, 'smoothing', 0, 150).onChange((value) => {
            this.params.smoothing = value;
            this.reset();
        });

        noise.add(this.params, 'xMultiplier', 0, 30).onChange((value) => {
            this.params.xMultiplier = value;
            this.reset();
        });

        noise.add(this.params, 'yMultiplier', 0, 30).onChange((value) => {
            this.params.yMultiplier = value;
            this.reset();
        });

        let style = this.gui.addFolder('style');

        style.add(this.params, 'strokeWidth', .5, 5).onChange((value) => {
            this.params.strokeWidth = value;
            this.reset();
        });

        this.gui.add(this, 'exportSVG').name('Export SVG');
    }

    exportSVG() {
        var svg = paper.project.exportSVG({asString: true});
        var blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
        saveAs(blob, 'harmonograph' + JSON.stringify(this.params) + '.svg');
    }
}