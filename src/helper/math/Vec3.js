/**
 * @file 有三个值的向量
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {vec3} from '../../dep/gl-matrix-min';

export default class Vec3 {

    step = 3;

    static equals(a, b) {
        return a._array.toString() === b._array.toString();
    }

    constructor(x, y, z) {
        this.setValue([x, y, z]);
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

    getId() {
        return this._array.join('');
    }

    setValue(arr) {
        this._array = vec3.fromValues(...arr);
    }

    getValue() {
        return [...this._array];
    }

    clone() {
        return new Vec3(...this._array);
    }

    equals(another) {
        if (!another) {
            return false;
        }
        if (_.isArrayLike(another)) {
            return this.x === another[0] && this.y === another[1] && this.z === another[2];
        }
        return this.x === another.x && this.y === another.y && this.z === another.z;
    }
}
