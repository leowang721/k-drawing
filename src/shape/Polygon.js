/**
 * @file 形状 —— 多边形
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Shape from './Shape';
import Vertex from '../element/Vertex';

export default class Polygon extends Shape {
    type = 'Polygon';
    mode = 'TRIANGLE_FAN';

    constructor(options = {}) {
        super(options);
    }

    initOptions() {
        this.points = [].concat(this.options.points || []);
    }

    initElements() {
        this.points.forEach(point => {
            this.addVertices(Vertex.from({
                coord: point,
                color: this.color
            }));
        });
    }
}
