/**
 * @file 一个动画片段 Animation clip 同一个Clip最多支持三种动作，且每种最多一个
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import {mat4} from '../dep/gl-matrix-min';

export default class Clip extends EventTarget {

    constructor(options = {}) {
        super();
        this.start = options.start || 0;
        this.length = options.length || 0;  // 0表示立刻执行
        this.target = options.target;  // RendererData
        this.destination = {
            translate: {
                dx: 0,
                dy: 0,
                dz: 0
            },
            scale: {  // 为了方便计算才设置为0的……
                x: 0,
                y: 0,
                z: 0
            },
            rotate: {
                rad: 0,
                around: [0, 0, 1]
            }
        };
    }

    moveTo(pos) {
        this.destination.translate = {
            dx: pos.x - this.target.position.x,
            dy: pos.y - this.target.position.y,
            dz: pos.z - this.target.position.z
        };
        return this;
    }
    moveBy(diff) {
        this.destination.translate = {
            dx: diff.x,
            dy: diff.y,
            dz: diff.z
        };
    }
    rotate(rad, around) {
        this.destination.rotate = {
            rad,
            around
        };
        return this;
    }
    scale(ratios) {
        this.destination.scale = {  // 为了方便计算，减了1
            x: ratios.x - 1,
            y: ratios.y - 1,
            z: ratios.z - 1
        };
        return this;
    }

    applyAt(ms) {
        if (ms < this.start) {
            return;
        }
        let passed = ms - this.start;
        if (passed >= this.length) {
            this.finish();
        }

        let ratio = passed / this.length;
        // 计算这个时刻的模型矩阵
        let translate = {
            dx: this.destination.translate.dx * ratio,
            dy: this.destination.translate.dy * ratio,
            dz: this.destination.translate.dz * ratio
        };
        let scale = {
            x: this.destination.scale.x * ratio + 1,
            y: this.destination.scale.y * ratio + 1,
            z: this.destination.scale.z * ratio + 1
        };
        let rotate = {
            rad: this.destination.rotate.rad * ratio,
            around: this.destination.rotate.around
        };
        let matrix = mat4.identity(mat4.create());

        mat4.scale(matrix, matrix, [scale.x, scale.y, scale.z]);
        mat4.rotate(matrix, matrix, rotate.rad, rotate.around);
        mat4.translate(matrix, matrix, [translate.dx, translate.dy, translate.dz]);

        // 设置给target
        this.target.verticesData.setModelMatrix(matrix);
    }

    finish() {
        let translate = this.destination.translate;
        let scale = {
            x: this.destination.scale.x + 1,
            y: this.destination.scale.y + 1,
            z: this.destination.scale.z + 1
        };
        let rotate = this.destination.rotate;
        let matrix = mat4.identity(mat4.create());

        if (scale.x !== 0 && scale.y !== 0 && scale.z !== 0) {
            mat4.scale(matrix, matrix, [scale.x, scale.y, scale.z]);
        }
        if (rotate.rad / Math.PI % 2 !== 0) {
            mat4.rotate(matrix, matrix, rotate.rad, rotate.around);
        }
        if (translate.dx !== 0 && translate.dy !== 0 && translate.dz !== 0) {
            mat4.translate(matrix, matrix, [translate.dx, translate.dy, translate.dz]);
        }

        // 设置给target
        this.target.verticesData.setModelMatrix(matrix);
    }

}
