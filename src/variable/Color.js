/**
 * @file 特殊 Attribute 之 Color
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {VAR_TYPE} from '../config/type';
import Varying from './Varying';

export default class Color extends Varying {

    static VAR_NAME = 'v_Color';
    static GL_NAME = 'gl_FragColor';
    static GL_A_NAME = 'a_Color';
    static GL_TYPE = VAR_TYPE.VEC4;

    constructor(options) {
        super(Object.assign({}, options, {
            glName: Color.GL_NAME,
            glType: Color.GL_TYPE,
            name: Color.VAR_NAME,
            glAName: Color.GL_A_NAME
        }));
    }
}
