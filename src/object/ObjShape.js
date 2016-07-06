/**
 * @file a shape from .obj file
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import BaseShape from '../shape/Base';

export default class ObjShape extends BaseShape {
    type = 'objShape';
    faces = [];
    color = [0.7, 0.7, 0.7];
    constructor(options = {}) {
        super(options);
    }

    initOptions() {}
    initVariables() {}
    initElements() {}
    initBehavior() {}
}
