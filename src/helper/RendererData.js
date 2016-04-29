/**
 * @file 供 gl 使用的一次渲染所需要的数据，这主要是给Scene使用的
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {VAR_TYPE} from '../config/type';
import VerticesData from './VerticesData';

export default class RendererData {
    /**
     * 顶点相关数据信息
     *
     * @type {VerticesData}
     */
    verticesData = new VerticesData();

    // 保存顶点的实例们
    verticesSet = [];

    // 顶点实际个数，这影响了那些要绑定buffer的数据
    toRenderCount = 0;

    /**
     * 非 Position、Color 的 attribute 类型变量的数据
     *
     * @type {Map}
     */
    attribute = new Map();

    /**
     * 非 Position、Color 的 uniform 类型变量的数据
     *
     * @type {Map}
     */
    uniform = new Map();

    /**
     * 非 Position、Color 的 varying 类型变量的数据
     *
     * @type {Map}
     */
    varying = new Map();

    addVertices(vertices) {
        vertices = [].concat(vertices);
        this.verticesSet = this.verticesSet.concat(vertices);
        this.toRenderCount = this.verticesSet.length;
        this.verticesData.addVertices(vertices);
    }

    /**
     * 添加一个attribute类型变量的渲染数据
     *
     * @param {Attribute} attr attr变量实例
     * @param {*} value 数据
     */
    addAttribute(attr, value) {
        this.addVariable('attribute', attr, value);
    }

    /**
     * 添加一个uniform类型变量的渲染数据
     *
     * @param {string} name 变量的名称
     * @param {*} value 数据
     */
    addUniform(name, value) {
        this.uniform.set(name, value);
    }

    /**
     * 添加一个varying类型变量的渲染数据
     *
     * @param {Varying} varying varying变量实例
     * @param {*} value 数据
     */
    addVarying(varying, value) {
        this.addVariable('varying', varying, value);
    }

    addVariable(type, variable, value) {
        switch (type) {
            case 'attribute':
            case 'varying':
                let name = variable.name;
                value = [].concat(value);
                let current = this[type].get(name) || {};

                let step = current.step;
                if (!step) {
                    switch (variable.glType) {
                        case VAR_TYPE.VEC4:
                            step = 4;
                            break;
                        case VAR_TYPE.VEC2:
                            step = 2;
                            break;
                        default:
                            step = 1;  // FLOAT
                    }
                }

                let oldValue = current.value || [];
                let diff = this.toRenderCount * step - oldValue.length - value.length;
                if (diff > 0) {
                    value = value.concat(_.times(diff, _.constant(value[value.length - 1])));
                }
                this[type].set(name, {
                    step: step,
                    name: name,
                    glType: variable.glType,
                    value: [...oldValue, ...value]
                });
                break;
        }
    }

    merge(other) {
        // 先合并 verticesData，同时处理 attribute 类型变量，以及 toRenderCount
        // 然后处理一下uniform、varying
        // 原本是要这样做的
        // 但是较懒，先牺牲空间了，使用verticesSet
        this.addVertices(other.verticesSet);

        other.attribute.forEach((attr, name) => {
            this.addAttribute(attr, attr.value);
        });
        other.uniform.forEach((value, name) => {
            this.addUniform(name, value);
        });
        other.varying.forEach((value, name) => {
            this.addVarying(name, value);
        });
    }

    dumpForRenderer() {
        return {
            toRenderCount: this.toRenderCount,
            verticesData: this.verticesData.dumpForRenderer(),
            attribute: new Map([...this.attribute].map(item => {
                item[1].value = new Float32Array(item[1].value);
                return item;
            })),
            uniform: new Map([...this.uniform].map(item => {
                item[1] = new Float32Array(item[1]);
                return item;
            })),
            varying: new Map([...this.varying].map(item => {
                item[1].value = new Float32Array(item[1].value);
                return item;
            }))
        };
    }

}
