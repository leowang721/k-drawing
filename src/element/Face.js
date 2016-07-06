/**
 * @file 面，obj的面至少由三个顶点组成，特殊的 Triangles
 * 但是依然是一个平面…… 所以要做一下判断
 * 渲染面使用 TRIANGLES
 * 如果点数超过三个，使用 TRIANGLE_STRIP，这时需注意第一个三角形的索引顺序，1,0,2,3 而不是 0,1,2,3
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {RENDER_TYPE} from '../config/type';
import Triangles from './Triangles';

export default class Face extends Triangles {

    type = 'face';

    constructor(options = {}) {
        super(options);

        if (this.vertices.length < 3) {
            throw new Error('顶点数量少于3个');
        }

        this.id = this.id.replace('triangles', 'face');
        this.mode = this.vertices.length === 3 ? RENDER_TYPE.TRIANGLES : RENDER_TYPE.TRIANGLE_STRIP;
        this.addVertices = () => {};
    }

    //
    // checkIfInSamePlane(a, b, c, d) {
    //     return mat4.determinant([
    //         a.x, a.y, a.z, 1,
    //         b.x, b.y, b.z, 1,
    //         c.x, c.y, c.z, 1,
    //         d.x, d.y, d.z, 1
    //     ]) === 0;
    // }
}
