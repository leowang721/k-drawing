/**
 * @file 一个简单动作动画，提供的方法以设置动作为主
 * 一系列顺序执行的简单动作集，支持并发
 *
 * motion.animate(triangles)
 *     .begin()
 *     .spent(1000).moveTo([100, 200]).scale(1.5)  // 同一个Clip最多支持三种动作，且每种最多一个
 *     .then().spent(2000).rotate(7200, [1, 0, 0])
 *     .then().spent(1000).moveTo([0, 0])
 *     .end();
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import Clip from './Clip';
import RendererData from '../helper/RendererData';
import TimeLine from './TimeLine';

export default class Motion extends EventTarget {

    toSet = null;
    currentRendererData = null;

    constructor(options = {}) {
        super();
        this.start = options.start;
        this.currentSpent = options.start || 0;
        this.timeline = options.timeline || new TimeLine();
    }

    // 指定要执行的对象
    animate(target) {
        if (!(target instanceof RendererData)) {
            target = target.getRendererData();
        }
        this.currentRendererData = target;
        return this;
    }

    // 标记动作开始，会清空之前的配置的
    begin() {
        this.toSet = null;
        this.timeline.clear();
        return this;
    }
    // 动作结束
    end() {
        if (this.toSet) {
            this.timeline.addClip(this.toSet);
            this.currentSpent += this.toSet.length;
            this.toSet = null;
        }
    }

    // 标记花多少ms
    spent(ms) {
        this.toSet = new Clip({
            start: this.currentSpent,
            length: ms,
            target: this.currentRendererData
        });  // 调用spent即产生一个新的片段
        return this;
    }

    // 一个新的 Clip 的开始，旧的入队列
    then() {
        if (this.toSet) {
            this.timeline.addClip(this.toSet);
            this.currentSpent += this.toSet.length;
            this.toSet = null;
        }
        return this;
    }

    moveTo(pos) {
        this.toSet.moveTo(pos);
        return this;
    }
    moveBy(diff) {
        this.toSet.moveBy(diff);
        return this;
    }
    rotate(deg, around) {
        this.toSet.rotate(Math.PI * deg / 180.0, around);
        return this;
    }
    scale(ratio) {
        this.toSet.scale(ratio);
        return this;
    }
}
