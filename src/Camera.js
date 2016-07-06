/**
 * @file 视角
 *
 * camera提供两个矩阵：视点矩阵 以及 可视空间的投影矩阵
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget, util} from 'k-core';
import {mat4} from './dep/gl-matrix-min';
import Transform from './helper/Transform';

export default class Camera extends EventTarget {
    viewMatrix = mat4.identity(mat4.create());
    projectionMatrix = mat4.identity(mat4.create());
    matrix = mat4.identity(mat4.create());
    transform = new Transform();

    constructor(options = {}) {
        super();
        this.id = options.id || 'scene-' + util.guid();
        // 下3定义了 ViewMatrix
        this.position = options.position || [0, 0, 7];
        this.up = options.up || [0, 1, 0];
        this.looking = options.looking || [0, 0, 0];
        this.lookAt(this.looking);

        // 下面的在为 ProjectionMatrix 做准备
        this.near = options.near || 0;
        this.far = options.far;
        this.projection = options.projection || 'orthographic';  // perspective || orthographic
        this.projectionSettings = options.projectionSettings || {};
    }

    // 看某个点，改变 viewMatrix
    lookAt(looking) {
        this.looking = looking;
        mat4.lookAt(this.viewMatrix, this.position, looking, this.up);
        this.fire('change');
    }

    // 设置位置，导致 viewMatrix 的改变
    // 也会导致 projectionMatrix 的改变
    setPosition(pos) {
        this.position = pos;
        this.lookAt(this.looking);
    }

    setNear(v) {
        this.near = v;
        this.calculateProjectionMatrix();
    }
    setFar(v) {
        this.far = v;
        this.calculateProjectionMatrix();
    }

    // 修改可视空间信息，改变 projectionMatrix
    setProjection(projection, projectionSettings = {}) {
        this.projection = projection;  // perspective || orthographic
        this.projectionSettings = projectionSettings;
        this.calculateProjectionMatrix();
    }

    // 这个方法由scene在 useCamara 时自动调用
    // 可能会导致 projectionMatrix 的改变
    setSceneRange(range) {
        this.sceneRange = range;
        this.far = this.far || (this.sceneRange.depth / 2 + this.position[2]);
        this.calculateProjectionMatrix();
    }

    getMatrix() {
        let matrix = mat4.create();
        mat4.multiply(matrix, this.projectionMatrix, this.viewMatrix);
        mat4.multiply(matrix, matrix, this.transform.matrix);
        return matrix;
    }

    /**
     * 获取投影矩阵
     * 注意这里使用的值：near、far是相对距离值，相对于视点的距离，都取正数……
     * 而且要注意的这是视点坐标系的距离，
     * 对于webgl的坐标系来说，只有视点位置与看向位置与z轴平行时，才是z轴上的距离
     * 这个换算同样适用于 left、right、top、bottom
     * 视线方向如果不跟z轴重合，这时候就有点鬼了…… 算出来的数不是真的坐标值
     */
    calculateProjectionMatrix() {
        let currentSetting = this.projectionSettings;
        let near = currentSetting.near === undefined
            ? this.near
            : currentSetting.near;
        let far = currentSetting.far === undefined
            ? this.far
            : currentSetting.far;
        let matrix = mat4.identity(mat4.create());
        switch (this.projection) {
            case 'perspective':
                let fovy = (currentSetting.fovy || 30) * (Math.PI / 180);  // 转为弧度
                let aspect = currentSetting.aspect || (this.sceneRange.width / this.sceneRange.height);
                mat4.perspective(matrix, fovy, aspect, near, far);
                break;
            case 'orthographic':
                let left = currentSetting.left === undefined ? (-this.sceneRange.width / 2) : currentSetting.left;
                let right = currentSetting.right === undefined ? (this.sceneRange.width / 2) : currentSetting.right;
                let bottom = currentSetting.bottom === undefined
                    ? (-this.sceneRange.height / 2) : currentSetting.bottom;
                let top = currentSetting.top === undefined ? (this.sceneRange.height / 2) : currentSetting.top;
                mat4.ortho(matrix, left, right, bottom, top, near, far);
                break;
        }
        this.fire('change');
        this.projectionMatrix = matrix;
    }
}
