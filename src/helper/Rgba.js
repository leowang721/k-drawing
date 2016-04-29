/**
 * @file 颜色类
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import Vec4 from './math/Vec4';
import color from '../config/color';

export default class Rgba extends Vec4 {

    constructor(r, g, b, alpha = 1) {
        super(r, g, b, alpha);
    }

    get r() {
        return this._array[0];
    }
    set r(v) {
        this._array[0] = v;
    }
    get g() {
        return this._array[1];
    }
    set g(v) {
        this._array[1] = v;
    }
    get b() {
        return this._array[2];
    }
    set b(v) {
        this._array[2] = v;
    }
    get alpha() {
        return this._array[3];
    }
    set alpha(v) {
        this._array[3] = v;
    }

    clone() {
        return new Rgba(...this._array);
    }

    static from(target) {
        if (target instanceof Rgba || !target) {
            return target;
        }
        if (Rgba.r !== undefined) {
            return new Rgba(target.r, target.g, target.b, target.alpha);
        }
        return new Rgba(...target);
    }
}

_.each(color, (value, name) => {
    Rgba[name] = new Rgba(...value);
});
