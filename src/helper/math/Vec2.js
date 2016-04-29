/**
 * @file 有两个值的向量
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {vec2} from '../../dep/gl-matrix-min';

export default class Vec2 {

    static equals(a, b) {
        return a._array.toString() === b._array.toString();
    }

    constructor(x = 0, y = 0, z = 0, w = 0) {
        this._array = vec2.fromValues(x, y, z, w);
    }

    get s() {
        return this._array[0];
    }
    set s(v) {
        this._array[0] = v;
    }
    get t() {
        return this._array[1];
    }
    set t(v) {
        this._array[1] = v;
    }

    getId() {
        return this._array.join('');
    }

    setValue(arr) {
        this._array = vec2.fromValues(arr);
    }

    getValue() {
        return [].concat(this._array);
    }

    clone() {
        return new Vec2(...this._array);
    }
}
