/**
 * @file uniform类型变量类
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {VAR_TYPE} from '../config/type';

/**
 * uniform变量是一种GLSL ES变量，被用来从外部向片元着色器传输一些不变的、统一的数据
 */
export default class Uniform {

    type = 'uniform';

    constructor(options = {}) {
        /**
         * 变量名称
         *
         * @type {string}
         */
        this.name = options.name;

        if (!this.name || this.name.indexOf('u_') !== 0) {
            throw new Error('Uniform变量的初始化错误，未指定name或name不以u_开头！');
        }

        /**
         * 该变量在 gl 中对应的类型，这将会影响到程序片段的生成和赋值处理
         *
         * @type {VAR_TYPE.*}
         */
        this.glType = options.glType || VAR_TYPE.VEC4;

        /**
         * 该变量在 gl 中对应的变量名，如果未传，或自动的将name的a_替换为gl_作为使用值
         *
         * @type {string}
         */
        this.glName = options.glName || this.name.replace('u_', 'gl_');

        /**
         * 要被传输的实际数据值
         *
         * @type {VAR_TYPE.*}
         */
        this.value = options.value;
    }

    setValue(newValue) {
        this.value = newValue;
        return this;
    }

    getExecution() {
        return {
            name: this.name,
            type: this.type,
            glName: this.glName,
            glType: this.glType,
            value: this.value
        };
    }

    // getProgramLine() {
    //     return {
    //         statement: `${this.type} ${this.glType} ${this.name};`,
    //         assignment: `${this.glName} = ${this.name};`
    //     };
    // }

    applyTo(gl, program, value) {
        let position = gl.getUniformLocation(program, this.name);
        if (position < 0) {
            console.log(`Failed to get the storage location of ${this.name}`);
            return;
        }

        switch (this.glType) {
            case VAR_TYPE.FLOAT:
                gl.uniform1f(position, value);
                break;
            case VAR_TYPE.VEC4:
                gl.uniform4fv(position, value.toArray());
                break;
        }
    }
}
