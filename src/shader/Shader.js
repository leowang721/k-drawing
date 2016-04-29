/**
 * @file 着色器基类
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {EventTarget} from 'k-core';
import VariableSet from './helper/VariableSet';

export default class Shader extends EventTarget {

    variableSet = new VariableSet();

    constructor() {
        super();
        this.initialize();
    }

    initialize() {}

    addVariables(variableSet) {
        this.variableSet.merge(variableSet);
        return this;
    }

    getSource() {
        let data = this.variableSet.dump();
        data.hasTexture = !!this.variableSet.get('v_TexCoord');
        // 去除 vertex 里面的 position 和 变换矩阵相关信息，这是固定写死的
        let toFilter = {
            a_Position: 1,
            u_ModelMatrix: 1,
            v_Color: 1,
            u_Sampler: 1,
            v_TexCoord: 1
        };

        this.source = this.sourceRenderer(_.mapValues(
            data,
            value => {
                return Array.isArray(value) ? value.filter(eachVal => !toFilter[eachVal.name]) : value;
            }
        ));
        return this.source;
    }

    link(gl) {
        this.gl = gl;
        return this;
    }

    compile() {
        if (!this.gl) {
            throw new Error('You should compile with a gl first.');
        }
        let gl = this.gl;

        let shader = gl.createShader(this.type);
        gl.shaderSource(shader, this.getSource());
        gl.compileShader(shader);

        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            let error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }
        this.instance = shader;
        return this;
    }

    getInstance() {
        if (!this.instance) {
            throw new Error('You should compile with a gl first.');
        }
        return this.instance;
    }
}
