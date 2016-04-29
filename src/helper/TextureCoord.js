/**
 * @file 纹理坐标
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Vec2 from './math/Vec2';

export default class TextureCoord extends Vec2 {
    constructor(s, t, index = 0) {
        super(s, t);
        // 共有8个纹理单元，因此最好指定一下
        this.index = index;
    }

    getId() {
        return [this.s, this.t, this.index].join('');
    }

    getValue() {
        return [this.s, this.t];
    }

    clone() {
        return new TextureCoord(...this._array);
    }

    static equals(a, b) {
        return a._array.toString() === b._array.toString() && a.index === b.index;
    }

    static from(target) {
        if (target instanceof TextureCoord || !target) {
            return target;
        }
        if (target.x !== undefined) {
            return new TextureCoord(target.x, target.y, target.z);
        }
        return new TextureCoord(...target);
    }

    /**
     * 纹理坐标系统的二维感知是从 0 ~ 1，从左至右，从下至上
     * 这是个简单的转换方法，从图片的坐标转换为gl的坐标
     * 图片的坐标取值方式，同浏览器坐标
     *
     * @param {Object | Array} coordinate 屏幕坐标值
     * @param {Object} range 屏幕范围
     * @param {number} index 纹理单元索引
     *
     * @return {TextureCoord} gl坐标系中的位置
     */
    static transformFromImage(coordinate, range, index) {
        let rw = range.width;
        let rh = range.height;
        if (Array.isArray(range)) {
            [rw, rh] = range;
        }
        let x = (Array.isArray(coordinate) ? coordinate[0] : coordinate.x) / rw;
        let y = (rh - (Array.isArray(coordinate) ? coordinate[1] : coordinate.y)) / rh;
        return new TextureCoord(x, y, index);
    }
}
