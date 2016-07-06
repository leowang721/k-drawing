/**
 * @file 形状：线，一共有三种类型，根据 line 的 mode 来对应
 * 先假设有坐标位置 a, b, c, d 四个
 * LINES 默认，一系列单独的线段，线段为：(a,b)、(c,d)
 * LINES_STRIP  一系列连接的线段，线段为：(a,b)、(b,c)、(c,d)
 * LINES_LOOP 一系列连接并形成回路的线段，线段为：(a,b)、(b,c)、(c,d)、(d,a)
 *
 * 因为本身渲染模式就支持，所以这里特殊支持一下，跟 Triangles 一样
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Base from './Base';
import LinesElement from '../element/Lines';

export default class Lines extends Base {

    type = 'lines';

    constructor(options = {}) {
        super(options);
    }

    initElements() {
        this.lines = new LinesElement({
            color: this.color,
            vertices: this.options.vertices,
            mode: this.options.mode
        });
        this.addElements(this.lines);
        // 清理此API
        this.addElements = () => {};
    }

    /**
     * 添加点
     *
     * @param {Array.<Vertex> | Array.<Array.<number>> | Vertex | Array.<number>} vertices 点信息
     */
    addVertices(vertices = []) {
        this.lines.addVertices(vertices);
        this.fire('change');
    }
}
