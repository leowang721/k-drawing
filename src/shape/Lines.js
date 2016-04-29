/**
 * @file 形状：线，一共有三种类型，根据 option 的 mode 来对应
 * 先假设有坐标位置 a, b, c, d 四个
 * LINES 默认，一系列单独的线段，线段为：(a,b)、(c,d)
 * LINES_STRIP  一系列连接的线段，线段为：(a,b)、(b,c)、(c,d)
 * LINES_LOOP 一系列连接并形成回路的线段，线段为：(a,b)、(b,c)、(c,d)、(d,a)
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Shape from './Shape';
import Vertex from '../element/Vertex';

export default class Lines extends Shape {

    type = 'LINES';

    static MODE = {
        STRIP: 'LINE_STRIP',
        LOOP: 'LINE_LOOP',
        DEFAULT: 'LINES'
    };

    constructor(options = {}) {
        super(options);
    }

    initOptions() {
        this.mode = this.options.mode || Lines.MODE.DEFAULT;
        this.lines = [].concat(this.options.lines || []);
    }

    initElements() {
        if (this.lines.length > 0) {
            this.addLines(this.lines);
        }
    }

    addLines(lines = []) {

        [].concat(lines).forEach(line => {
            switch (this.mode) {
                case Lines.MODE.STRIP:
                case Lines.MODE.LOOP:
                    // 这两种模式，只要加点就行了
                    let endPoint = Vertex.from({
                        coord: line.to,
                        color: line.color || this.color
                    });
                    this.addVertices(endPoint);
                    break;
                default:
                    let fromPoint = Vertex.from({
                        coord: line.from,
                        color: line.color || this.color
                    });
                    let toPoint = Vertex.from({
                        coord: line.to,
                        color: line.color || this.color
                    });
                    this.addVertices([fromPoint, toPoint]);
                    break;
            }
        });

        this.calculatePosition();
    }
}
