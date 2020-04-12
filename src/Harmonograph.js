import * as dat from 'dat-gui';
import * as paper from 'paper';
import { saveAs } from 'file-saver';

export default class Harmonograph {

    constructor(canvas_id) {
        this.params = {
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
            //fillColor: '#0000FF01'
        };
        
        paper.project.clear();
        this.draw();
        paper.view.draw();
    }

    draw() {

    }

    init_gui() {
        this.gui.add(this, 'randomize').name('Randomize');

        /* let noise = this.gui.addFolder('noise');

        noise.add(this.params, 'seed', 0, 2000).onChange((value) => {
            this.params.seed = value;
            this.reset();
        }); */

        this.gui.add(this, 'exportSVG').name('Export SVG');
    }

    exportSVG() {
        var svg = paper.project.exportSVG({asString: true});
        var blob = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
        saveAs(blob, 'harmonograph' + JSON.stringify(this.params) + '.svg');
    }
}