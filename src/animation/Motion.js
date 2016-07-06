/**
 * @file 一个简单动作动画，提供的方法以设置动作为主
 * 一系列顺序执行的简单动作集，支持并发
 *
 * let motion = new Motion({
 *     target: aCube
 * });
 *
 * motion.animate(triangles)  // 同一个Clip最多支持三种动作，且每种最多一个
 *     .begin().spent(1000).moveTo([100, 200]).scale(1.5).rotate(180, [1, 0, 0])
 *     .then().spent(2000).rotate(7200, [1, 0, 0])
 *     .then().spent(1000).moveTo([0, 0])
 *     .end();
 * 之后就加到Animation里
 * animation.addMotion(motion);
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget, util} from 'k-core';
import Clip from './Clip';

export default class Motion extends EventTarget {
    clips = [];
    length = 0;
    constructor(options = {}) {
        super();
        this.id = options.id || ('motion-' + util.guid());
        this.target = options.target;
    }

    // 清空所有的 clips
    clear() {
        this.clips.length = 0;
        this.length = 0;
        this.fire('clear', {
            motionId: this.id
        });
    }

    // 标记动作开始，这个是持续添加clip性质的
    begin() {
        this.toSet = new Clip({
            start: this.length,
            target: this.target,
            motionId: this.id
        });
        return this;
    }
    // 动作结束
    end() {
        if (this.toSet) {
            this.clips.push(this.toSet);
            this.length += this.toSet.length;
            this.fire('add', {
                clip: this.toSet
            });
        }
    }
    // 一个新的 Clip 的开始，旧的入队列
    then() {
        if (this.toSet) {
            this.clips.push(this.toSet);
            this.length += this.toSet.length;
            this.fire('add', {
                clip: this.toSet
            });
        }
        this.toSet = new Clip({
            start: this.length,
            target: this.target,
            motionId: this.id
        });
        return this;
    }

    wait(ms) {
        this.length += ms;
        return this;
    }

    // 标记花多少ms
    spent(ms) {
        this.toSet.length = ms;
        return this;
    }

    moveTo(pos) {
        this.toSet.moveTo(pos);
        return this;
    }
    translate(dx, dy, dz) {
        this.toSet.translate(dx, dy, dz);
        return this;
    }
    rotate(deg, around) {
        this.toSet.rotate(Math.PI * deg / 180.0, around);
        return this;
    }
    rotateX(deg) {
        return this.rotate(deg, [1, 0, 0]);
    }
    rotateY(deg) {
        return this.rotate(deg, [0, 1, 0]);
    }
    rotateZ(deg) {
        return this.rotate(deg, [0, 0, 1]);
    }
    scale(ratio) {
        this.toSet.scale(ratio);
        return this;
    }
}
