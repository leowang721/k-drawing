/**
 * @file 动画……，主入口
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import TimeLine from './TimeLine';
import Motion from './Motion';

export default class Animation extends EventTarget {
    timeline = new TimeLine();

    currentSpent = 0;

    constructor() {
        super();
        this.initBehavior();
    }

    initBehavior() {
        this.timeline.on('finish', this.stop);
    }

    createMotion(spentToStart) {
        let motion = new Motion({
            start: spentToStart,
            timeline: this.timeline
        });
        return motion;
    }

    play() {
        // use timeline to make the animation work
        // 并计算帧率
        let counter = 0;
        this.startTime = Date.now() - this.currentSpent;
        let start = Date.now();
        let tick = () => {
            let now = Date.now();
            this.currentSpent = now - this.startTime;
            if (this.currentSpent >= this.timeline.length) {
                this.timeline.finish();
                this.fire('finish');
                this.stop();
                return;
            }
            if (counter === 30) {
                // 帧率
                let fps = Math.round(counter * 1000 / (now - start));
                counter = 0;
                start = now;
                this.fire('fps', {fps});
            }
            counter++;
            this.tickId = requestAnimationFrame(tick);
            this.timeline.applyAt(this.currentSpent);
            this.fire('frame');
        };
        tick();
    }

    playAt(ms) {
        this.currentSpent = ms;
        this.play();
    }

    stop() {
        cancelAnimationFrame(this.tickId);
        this.currentSpent = 0;
    }

    replay() {
        this.currentSpent = 0;
        this.play();
    }

    pause() {
        cancelAnimationFrame(this.tickId);
    }

    resume() {
        this.play();
    }
}
