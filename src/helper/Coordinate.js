/**
 * @file 坐标，三维坐标
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Vec4 from './math/Vec4';

export default class Coordinate extends Vec4 {
    constructor(x, y, z = 0) {
        super(x, y, z, 1);  // w 为1时，齐次坐标可以当做三维坐标来用
    }

    getValue() {
        return [this.x, this.y, this.z];
    }

    clone() {
        return new Coordinate(...this._array);
    }

    /**
     * gl的坐标的二维感知是从 -1 ~ 1，从左至右，从下至上
     * 这是个简单的转换方法，从浏览器屏幕的坐标转换为gl的坐标
     *
     * @param {Object | Array} coordinate 屏幕坐标值
     * @param {Object | Array} range 屏幕范围
     * @param {number} z z轴坐标
     *
     * @return {Coordinate} gl坐标系中的位置
     */
    static transformFromScreen(coordinate, range, z = 0) {
        let cx = coordinate.x;
        let cy = coordinate.y;
        let rw = range.width;
        let rh = range.height;
        if (Array.isArray(coordinate)) {
            [cx, cy] = coordinate;
        }
        if (Array.isArray(range)) {
            [rw, rh] = range;
        }
        let x = (cx - rw / 2) / (rw / 2);
        let y = (rh / 2 - cy) / (rh / 2);
        return new Coordinate(x, y, z);
    }

    static from(target) {
        if (target instanceof Coordinate || !target) {
            return target;
        }
        if (target.x !== undefined) {
            return new Coordinate(target.x, target.y, target.z);
        }
        return new Coordinate(...target);
    }
}
