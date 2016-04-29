/**
 * @file attribute类型变量类
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {VAR_TYPE} from '../config/type';

/**
 * attribute变量是一种GLSL ES变量，被用来从外部向顶点着色器内传输数据，只有顶点着色器能够使用它
 */
export default class Varying {

    type = 'varying';

    constructor(options = {}) {
        /**
         * 变量名称
         *
         * @type {string}
         */
        this.name = options.name;

        if (!this.name || this.name.indexOf('v_') !== 0) {
            throw new Error('Varying变量的初始化错误，未指定name或name不以v_开头！');
        }

        /**
         * 该变量在 gl 中对应的类型，这将会影响到程序片段的生成和赋值处理
         *
         * @type {VAR_TYPE.*}
         */
        this.glType = options.glType || VAR_TYPE.VEC4;

        /**
         * 该变量在 gl 中对应的变量名，如果未传，或自动的将name的v_替换为gl_作为使用值
         *
         * @type {string}
         */
        this.glName = options.glName || this.name.replace('v_', 'gl_');

        /**
         * 对应的 attribute Name
         */
        this.glAName = options.glAName || this.glName.replace('gl_', 'a_');

        /**
         * 该变量的取值在“当前环境”中对应的属性名
         */
        this.value = options.value;
    }

    setValue(newValue) {
        this.value = newValue;
        return this;
    }

    // getProgramLine() {
    //     return {
    //         statement: `${this.type} ${this.glType} ${this.name};`,
    //         assignment: `${this.glName} = ${this.name};`
    //     };
    // }
    //
    // static applyTo(attribute, gl, program) {
    //     let position = gl.getAttribLocation(program, attribute.name);
    //     if (position < 0) {
    //         console.log(`Failed to get the storage location of ${attribute.name}`);
    //         return;
    //     }
    //
    //     switch (attribute.glType) {
    //         case VAR_TYPE.FLOAT:
    //             gl.vertexAttrib1f(position, attribute.value);
    //             break;
    //         case VAR_TYPE.VEC4:
    //             gl.vertexAttrib4fv(position, attribute.value.toArray());
    //             break;
    //     }
    // }
}
