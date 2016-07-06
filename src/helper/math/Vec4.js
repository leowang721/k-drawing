/**
 * @file 有四个值的向量
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {vec4} from '../../dep/gl-matrix-min';

export default class Vec4 {

    step = 4;

    static equals(a, b) {
        return a._array.toString() === b._array.toString();
    }

    constructor(x, y, z = 0, w = 1) {
        this.setValue([x, y, z, w]);
    }

    get x() {
        return this._array[0];
    }
    set x(v) {
        this._array[0] = v;
    }
    get y() {
        return this._array[1];
    }
    set y(v) {
        this._array[1] = v;
    }
    get z() {
        return this._array[2];
    }
    set z(v) {
        this._array[2] = v;
    }
    get w() {
        return this._array[3];
    }
    set w(v) {
        this._array[3] = v;
    }

    getId() {
        return this._array.join('');
    }

    setValue(arr) {
        this._array = vec4.fromValues(...arr);
    }

    getValue() {
        return [...this._array];
    }

    clone() {
        return new Vec4(...this._array);
    }
}
