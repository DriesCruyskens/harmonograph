import * as dat from 'dat-gui';
import * as paper from 'paper';
import { saveAs } from 'file-saver';

export default class Harmonograph {

    constructor(canvas_id) {
        this.params = {
            strokeWidth: 1,
            t_max: 100,
            t_incr: .02,
            a1: 160,
            f1: 2.01,
            p1: 0,
            d1: 0.,
            a2: 160,
            f2: 3,
            p2: 7 * Math.PI/16,
            d2: 0.,
            a3: 160,
            f3: 3,
            p3: 0,
            d3: 0.0,
            a4: 160,
            f4: 2,
            p4: 0,
            d4: 0.,
        }

        Number.prototype.map = function (in_min, in_max, out_min, out_max) {
            return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }

        this.gui = new dat.GUI();
        this.canvas = document.getElementById(canvas_id);
        paper.setup(this.canvas);

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
        // https://en.wikipedia.org/wiki/Harmonograph

        let x, y
        let path = new paper.Path()
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

            x += this.center.x
            y += this.center.y
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

        this.gui.add(this.params, 't_incr', 0.01, 1).onChange((value) => {
            this.params.t_incr = value;
            this.reset();
        });

        let params = this.gui.addFolder('params');

        params.add(this.params, 'a1', 0., 500).onChange((value) => {
            this.params.a1 = value;
            this.reset();
        });
        
        params.add(this.params, 'f1', 0., 10.).onChange((value) => {
            this.params.f1 = value;
            this.reset();
        });

        params.add(this.params, 'p1', 0., 2 * Math.PI).onChange((value) => {
            this.params.p1 = value;
            this.reset();
        });

        params.add(this.params, 'd1', 0., 0.1).onChange((value) => {
            this.params.d1 = value;
            this.reset();
        });

        params.add(this.params, 'a2', 0., 500).onChange((value) => {
            this.params.a2 = value;
            this.reset();
        });
        
        params.add(this.params, 'f2', 0., 10.).onChange((value) => {
            this.params.f2 = value;
            this.reset();
        });

        params.add(this.params, 'p2', 0., 2 * Math.PI).onChange((value) => {
            this.params.p2 = value;
            this.reset();
        });

        params.add(this.params, 'd2', 0., 0.1).onChange((value) => {
            this.params.d2 = value;
            this.reset();
        });

        params.add(this.params, 'a3', 0., 500).onChange((value) => {
            this.params.a3 = value;
            this.reset();
        });
        
        params.add(this.params, 'f3', 0., 10.).onChange((value) => {
            this.params.f3 = value;
            this.reset();
        });

        params.add(this.params, 'p3', 0., 2 * Math.PI).onChange((value) => {
            this.params.p3 = value;
            this.reset();
        });

        params.add(this.params, 'd3', 0., 0.1).onChange((value) => {
            this.params.d3 = value;
            this.reset();
        });

        params.add(this.params, 'a4', 0., 500).onChange((value) => {
            this.params.a4 = value;
            this.reset();
        });
        
        params.add(this.params, 'f4', 0., 10.).onChange((value) => {
            this.params.f4 = value;
            this.reset();
        });

        params.add(this.params, 'p4', 0., 2 * Math.PI).onChange((value) => {
            this.params.p4 = value;
            this.reset();
        });

        params.add(this.params, 'd4', 0., 0.1).onChange((value) => {
            this.params.d4 = value;
            this.reset();
        });

        params.open()

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