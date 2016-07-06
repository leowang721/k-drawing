/**
 * @file 简单变换类：平移、旋转、缩放，获取最终的变换矩阵
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import {mat4} from '../dep/gl-matrix-min';

export default class WorldTransform extends EventTarget {
    matrix = mat4.identity(mat4.create());
    worldTransform = {
        length: 0,
        translate: [],
        rotate: [],
        scale: []
    };

    // 支持动画的变换，动画在每个clip期间，做替换性质的变换
    // 在此记录
    // key 为 clip id
    // value 为变换的参数 {translate, rotate, scale}
    modelTransform = new Map();

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
        this.worldTransform.translate.push([dx, dy, dz]);
        this.worldTransform.length++;
        return this;
    }

    /**
     * 旋转，在这里定义的旋转自身旋转，木有轴旋转的
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
        this.worldTransform.rotate.push([rad, axis]);
        this.worldTransform.length++;
        // mat4.rotate(this.matrix, this.matrix, rad, axis);
        return this;
    }
    rotateX(rad) {
        this.rotate(rad, [1, 0, 0]);
        // mat4.rotateX(this.matrix, this.matrix, rad);
        return this;
    }
    rotateY(rad) {
        this.rotate(rad, [0, 1, 0]);
        // mat4.rotateY(this.matrix, this.matrix, rad);
        return this;
    }
    rotateZ(rad) {
        this.rotate(rad, [0, 0, 1]);
        // mat4.rotateZ(this.matrix, this.matrix, rad);
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
        this.worldTransform.scale.push(v);
        this.worldTransform.length++;
        // mat4.scale(this.matrix, this.matrix, v);
        return this;
    }

    setModelTransform(clipId, args) {
        this.modelTransform.set(clipId, args);
        return this;
    }

    resetModelTransform(clipId) {
        this.modelTransform.delete(clipId);
        return this;
    }

    clearModelTransform() {
        this.modelTransform.clear();
        return this;
    }

    apply() {
        // 计算最终的模型矩阵
        let matrix = mat4.identity(mat4.create());
        let mts = [...this.modelTransform.values()];

        // 先旋转、再缩放、再平移，但是顺序实际上是倒序相乘的
        // 如果有model的，就带着
        this.worldTransform.translate.forEach(v => {
            mat4.translate(matrix, matrix, v);
        });
        mts.forEach(mt => {
            if (mt.translate.join('') === '000') {
                return;
            }
            mat4.translate(matrix, matrix, mt.translate);
        });
        this.worldTransform.scale.forEach(v => {
            mat4.scale(matrix, matrix, v);
        });
        mts.forEach(mt => {
            if (mt.scale.join('') === '111') {
                return;
            }
            mat4.scale(matrix, matrix, mt.scale);
        });
        this.worldTransform.rotate.forEach(v => {
            mat4.rotate(matrix, matrix, ...v);
        });
        mts.forEach(mt => {
            if (mt.rotate[0] === 0) {
                return;
            }
            mat4.rotate(matrix, matrix, ...mt.rotate);
        });

        this.matrix = matrix;

        this.fire('change');
    }
}
