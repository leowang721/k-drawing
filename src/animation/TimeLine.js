/**
 * @file 时间轴形式的动画设置……
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';

export default class Timeline extends EventTarget {
    clips = new Set();
    length = 0;

    addClip(clip) {
        this.clips.add(clip);
        this.length = Math.max(this.length, clip.start + clip.length);
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

    finish() {
        this.clips.forEach(clip => {
            clip.finish();
        });
        this.fire('finish');
    }

    clear() {
        this.length = 0;
        this.clips.clear();
    }
}
