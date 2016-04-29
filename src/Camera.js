/**
 * @file 视角…… 从 camera 获取视图矩阵
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import {mat4} from './dep/gl-matrix-min';

export default class Camera extends EventTarget {
    matrix = mat4.identity(mat4.create());

    constructor(options = {}) {
        super();
        this.position = options.position || [0, 0, 0];
        this.up = options.up || [0, 1, 0];
    }

    lookAt(pos) {
        this.matrix = mat4.identity(mat4.create());
        this.matrix = mat4.lookAt(this.matrix, this.position, pos, this.up);
    }
}
