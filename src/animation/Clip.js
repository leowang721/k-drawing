/**
 * @file 一个动画片段 Animation clip 同一个Clip最多支持三种动作，且每种最多一个
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget, util} from 'k-core';
import {expoEaseOut} from './util/easing';

export default class Clip extends EventTarget {

    constructor(options = {}) {
        super();
        this.id = options.id || ('clip-' + util.guid());
        this.start = options.start || 0;
        this.length = options.length || 0;  // 0表示立刻执行完
        this.target = options.target;  // Shape
        this.motionId = options.motionId;
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
        if (pos) {
            this.destination.translate = {
                dx: pos[0] - this.target.position.x,
                dy: pos[1] - this.target.position.y,
                dz: pos[2] - this.target.position.z
            };
        }
        return this;
    }
    translate(dx = 0, dy = 0, dz = 0) {
        this.destination.translate = {
            dx, dy, dz
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
            x: ratios[0] - 1,
            y: ratios[1] - 1,
            z: ratios[2] - 1
        };
        return this;
    }

    applyAt(ms) {
        if (ms < this.start || this._finished) {
            return;
        }
        let passed = ms - this.start;
        if (passed >= this.length) {
            this.finish();
            return;
        }

        let ratio = passed / this.length;
        // 计算这个时刻的模型矩阵
        let translate = [
            expoEaseOut(passed, 0, this.destination.translate.dx, this.length),
            expoEaseOut(passed, 0, this.destination.translate.dy, this.length),
            expoEaseOut(passed, 0, this.destination.translate.dz, this.length)
        ];
        let scale = [
            expoEaseOut(passed, 0, this.destination.scale.x, this.length) + 1,
            expoEaseOut(passed, 0, this.destination.scale.y, this.length) + 1,
            expoEaseOut(passed, 0, this.destination.scale.z, this.length) + 1
        ];
        let rotate = [
            expoEaseOut(passed, 0, this.destination.rotate.rad, this.length),
            this.destination.rotate.around
        ];

        this.target.transform.setModelTransform(this.id, {translate, scale, rotate}).apply();
    }

    reset() {
        this._finished = false;
        this.target.transform.clearModelTransform();
    }

    finish() {
        let translate = [
            this.destination.translate.dx,
            this.destination.translate.dy,
            this.destination.translate.dz
        ];
        let scale = [
            this.destination.scale.x + 1,
            this.destination.scale.y + 1,
            this.destination.scale.z + 1
        ];
        let rotate = [this.destination.rotate.rad, this.destination.rotate.around];

        this.target.transform.setModelTransform(this.id, {translate, scale, rotate}).apply();

        this._finished = true;
    }

}
