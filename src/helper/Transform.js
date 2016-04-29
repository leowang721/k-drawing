/**
 * @file 简单变换类：平移、旋转、缩放，获取最终的变换矩阵
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import {mat4} from '../dep/gl-matrix-min';

export default class Transform extends EventTarget {
    matrix = mat4.identity(mat4.create());

    constructor(host) {
        super();
        this.host = host;
    }

    /**
     * 平移
     *
     * 矩阵为：
     * | x' |   | 1 0 0 dx | | x |
     * | y' | = | 0 1 0 dy | | y |
     * | z' |   | 0 0 1 dz | | z |
     * | 1  |   | 0 0 0 1  | | 1 |
     *
     * @param {number} dx = 0 x轴移动距离
     * @param {number} dy = 0 y轴移动距离
     * @param {number} dz = 0 z轴移动距离
     *
     * @return {Transform} 供链式调用
     */
    translate(dx = 0, dy = 0, dz = 0) {
        mat4.translate(this.matrix, this.matrix, [dx, dy, dz]);
        return this;
    }

    /**
     * 旋转
     * 有三种处理方式：矩阵旋转、欧拉旋转以及四元数(quaternion)
     *
     * 绕x轴逆时针旋转了a角度的矩阵为：
     * | x' |   |  1  0    0    0 | | x |
     * | y' | = |  0 cosa -sina 0 | | y |
     * | z' |   |  0 sina cosa  0 | | z |
     * | 1  |   |  0  0    0    1 | | 1 |
     *
     * 绕y轴逆时针旋转了b角度的矩阵为：
     * | x' |   | cosb 0 -sinb 0 | | x |
     * | y' | = |  0   0  0    0 | | y |
     * | z' |   | sinb 0 cosc  1 | | z |
     * | 1  |   |  0   0  0    1 | | 1 |
     *
     * 绕z轴逆时针旋转了c角度的矩阵为：
     * | x' |   | cosc -sinc 0 0 | | x |
     * | y' | = | sinc cosc  0 0 | | y |
     * | z' |   |  0    0    1 0 | | z |
     * | 1  |   |  0    0    0 1 | | 1 |
     *
     * @param {number} rad 角度
     * @param {Vec3} axis 轴向量
     *
     * @return {Transform} 供链式调用
     */
    rotate(rad, axis) {
        mat4.rotate(this.matrix, this.matrix, rad, axis);
        return this;
    }
    rotateX(rad) {
        mat4.rotateX(this.matrix, this.matrix, rad);
        return this;
    }
    rotateY(rad) {
        mat4.rotateY(this.matrix, this.matrix, rad);
        return this;
    }
    rotateZ(rad) {
        mat4.rotateZ(this.matrix, this.matrix, rad);
        return this;
    }

    rotateSelf(rad, axis) {
        let pos = this.host.getPosition().getValue();
        this.translate(...pos);
        this.rotate(rad, axis);
        this.translate(...pos.map(a => -a));
        return this;
    }

    /**
     * 缩放
     *
     * 矩阵为：
     * | x' |   | sx 0  0  0 | | x |
     * | y' | = | 0  sy 0  0 | | y |
     * | z' |   | 0  0  sz 0 | | z |
     * | 1  |   | 0  0  0  1 | | 1 |
     *
     * @param {Vec3} v the vec3 to scale the matrix by
     *
     * @return {Transform} 供链式调用
     */
    scale(v) {
        mat4.scale(this.matrix, this.matrix, v);
        return this;
    }

    apply() {
        this.fire('change');
    }
}
