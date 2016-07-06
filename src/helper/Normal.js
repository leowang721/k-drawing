/**
 * @file 法线数据，矢量
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {vec3} from '../dep/gl-matrix-min';
import Vec3 from './math/Vec3';

export default class Normal extends Vec3 {
    constructor(x, y, z) {
        super(x, y, z);
    }

    getValue() {
        return [this.x, this.y, this.z];
    }

    setValue(arr) {
        super.setValue(arr);
        this.normalize();
    }

    normalize() {
        vec3.normalize(this._array, this._array);
    }

    equals(other) {
        if (_.isArrayLike(other)) {
            return this.x === other[0] && this.y === other[1] && this.z === other[2];
        }
        else if (_.isObject(other)) {
            return this.x === other.x && this.y === other.y && this.z === other.z;
        }
        return false;
    }

    clone() {
        return new Normal(...this._array);
    }

    static from(target) {
        if (target instanceof Normal || !target) {
            return target;
        }
        if (target.x !== undefined) {
            return new Normal(target.x, target.y, target.z);
        }
        return new Normal(...target);
    }
}
