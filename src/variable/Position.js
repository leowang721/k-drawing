/**
 * @file 特殊 Attribute 之 Position
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {VAR_TYPE} from '../config/type';
import Attribute from './Attribute';

export default class Position extends Attribute {

    static VAR_NAME = 'a_Position';
    static GL_NAME = 'gl_Position';
    static GL_TYPE = VAR_TYPE.VEC4;

    constructor(options) {
        super(Object.assign({}, options, {
            glName: Position.GL_NAME,
            glType: Position.GL_TYPE,
            name: Position.VAR_NAME
        }));
    }
}
