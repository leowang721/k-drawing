/**
 * @file 形状：三角形，一共有三种类型，根据 option 的 mode 来对应
 * 先假设有坐标位置 a, b, c, d 四个
 * TRIANGLES 默认，一系列单独的三角形，三角形为：(a,b, c) d被省略
 * TRIANGLES_STRIP  一系列模进使用顶点的三角形，三角形为：(a,b,c)、(b,c,d)
 * TRIANGLES_LOOP 一系列三角形，第一个点均为整体的第一个点，剩余模进，三角形为：(a,b,c)、(a,c,d)
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Shape from './Shape';
import Vertex from '../element/Vertex';

export default class Triangles extends Shape {

    type = 'TRIANGLES';

    static MODE = {
        STRIP: 'TRIANGLE_STRIP',
        FAN: 'TRIANGLE_FAN',
        DEFAULT: 'TRIANGLES'
    };

    constructor(options = {}) {
        super(options);
    }

    initOptions() {
        this.mode = this.options.mode || Triangles.MODE.DEFAULT;
        this.triangles = [].concat(this.options.triangles || []);
    }

    initElements() {
        if (this.triangles.length > 0) {
            this.addTriangles(this.triangles);
        }
    }

    addTriangles(triangles = []) {

        triangles = [].concat(triangles);

        if (!this.position && triangles.length > 0) {
            this.position = triangles[0].a;
        }

        triangles.forEach(triangle => {
            switch (this.mode) {
                case Triangles.MODE.STRIP:
                case Triangles.MODE.LOOP:
                    // 这两种模式，只要加点就行了
                    let endPoint = Vertex.from({
                        coord: triangle.c,
                        color: triangle.color || this.color
                    });
                    this.addVertices(endPoint);
                    break;
                default:
                    let aPoint = Vertex.from({
                        coord: triangle.a,
                        color: triangle.color || this.color
                    });
                    let bPoint = Vertex.from({
                        coord: triangle.b,
                        color: triangle.color || this.color
                    });
                    let cPoint = Vertex.from({
                        coord: triangle.c,
                        color: triangle.color || this.color
                    });
                    this.addVertices([aPoint, bPoint, cPoint]);
                    break;
            }
        });
        this.calculatePosition();
    }
}
