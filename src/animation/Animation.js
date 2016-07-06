/**
 * @file 动画……，主入口
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import TimeLine from './TimeLine';

export default class Animation extends EventTarget {
    timeline = new TimeLine();
    currentSpent = 0;
    motions = new Map();

    constructor() {
        super();
        this.initBehavior();
    }

    initBehavior() {}

    addMotion(motion) {
        this.motions.set(motion.id, motion);
        // 添加 clips
        this.timeline.addClips(motion.clips);
        motion.on('clear', e => {
            this.timeline.deleteClipsByMotion(e.motionId);
        });
        motion.on('add', e => {
            this.timeline.addClips(e.clip);
        });
    }

    removeMotion(motion) {
        this.timeline.deleteClipsByMotion(motion.id);
        this.motions.delete(motion.id);
    }

    play() {
        // 重置之前的影响
        this.timeline.reset();
        // use timeline to make the animation work
        // 并计算帧率
        let counter = 0;
        this.startTime = Date.now() - this.currentSpent;
        let start = Date.now();
        let tick = () => {
            let now = Date.now();
            this.currentSpent = now - this.startTime;
            if (this.currentSpent >= this.timeline.length) {
                this.stop();
                this.fire('finish');
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
        this.timeline.finish();
        cancelAnimationFrame(this.tickId);
        this.currentSpent = 0;
        this.fire('frame');
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
