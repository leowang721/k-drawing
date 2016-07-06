/**
 * @file 时间轴形式的动画设置……
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';

export default class Timeline extends EventTarget {
    clips = [];
    length = 0;
    clipSpread = new Map();

    addClips(clips) {
        clips = [].concat(clips);
        clips.forEach(clip => {
            // 不能在同一时间对相同的target多次处理
            // 因此要先计算冲突，不能添加冲突的 clip
            let currentSpread = this.clipSpread.get(clip.target);
            if (currentSpread) {
                // 有相同的已设置了
                currentSpread.forEach(eachSpread => {
                    if ((clip.start > eachSpread.start && clip.start < eachSpread.finish)
                        || (
                            clip.start + clip.length > eachSpread.start
                            && clip.start + clip.length < eachSpread.finish
                        )
                    ) {
                        throw new Error(`错误的 clip 添加，时间上有冲突！clip is ${clip.id} from motion ${clip.from}`);
                    }
                });
            }

            this.clips.push(clip);
            let spread = this.clipSpread.get(clip.target) || [];
            spread.push({
                start: clip.start,
                finish: clip.start + clip.length
            });
            this.clipSpread.set(clip.target, spread);
            this.length = Math.max(this.length, clip.start + clip.length);
        });
    }

    deleteClipsByMotion(motionId) {
        for (let i = this.clips.length - 1; i >= 0; i--) {
            if (this.clips[i].motionId === motionId) {
                this.clips.splice(i, 1);
            }
        }
        this.calculateLength();
    }

    clear() {
        this.clips.length = 0;
        this.length = 0;
    }

    calculateLength() {
        this.clips.forEach(clip => {
            this.length = Math.max(this.length, clip.start + clip.length);
        });
    }

    applyAt(ms) {
        if (ms >= this.length) {
            this.finish();
            return;
        }
        this.clips.forEach(clip => {
            clip.applyAt(ms);
        });
        this.fire('apply');
    }

    reset() {
        this.clips.forEach(clip => {
            clip.reset();
        });
    }

    finish() {
        this.clips.forEach(clip => {
            clip.finish();
        });
        this.fire('finish');
    }
}
