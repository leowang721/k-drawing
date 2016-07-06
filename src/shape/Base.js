/**
 * @file A Simple Base Shape Class
 * Shape 可以使用基础 Element 来组成，例如 Points, Lines, Triangles, faces 等
 * 在 Shape 中指定材质、纹理、光照等信息
 * 一个 Shape 对应着 一个 shader，因此不能混入不同的 shader
 * 复杂图形，最好使用多个 Shape 组成，形成树状结构
 * parentShape 的作用是，为当前 Shape 指定旋转原点，并且在 parentShape 发生转换时，子节点同时跟随
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {util} from 'k-core';
import VariableSet from '../helper/VariableSet';
import Transform from '../helper/Transform';
import {vec3, vec4, mat4} from '../dep/gl-matrix-min';
import Coordinate from '../helper/Coordinate';
import verticesData from '../helper/verticesData';
import {RENDER_TYPE} from '../config/type';
import Node from './Node';

export default class Base extends Node {

    type = 'shape';
    shaderType = 'basic';  // 类型，它决定了使用的 shader
    flag = {
        light: false,  // 使用灯光
        texture: false  // 使用纹理
    };

    elements = new Map();
    byModeElements = new Map();
    transform = new Transform(this);  // 从这里直接获取 modelMatrix 就行了

    /**
     * 构造函数
     *
     * @param {Object} options = {} 配置
     * @param {string=} options.id id标识
     * @param {helper.Rgba} options.color 颜色值，默认色，如果指定了顶点颜色，会覆盖此值
     * @param {helper.Coordinate=} options.position 世界坐标系的位置
     * @param {Object} flag 开关标记
     */
    constructor(options = {}) {
        super(options);

        this.options = options;

        this.id = options.id || (this.type + '-' + util.guid());
        this.color = options.color;  // 颜色
        this.material = options.material;

        Object.assign(this.flag, options.flag);

        // 这个position实际上是世界坐标系的位置，本地坐标系实际上是 (0, 0, 0)
        this.setPosition(Coordinate.from(options.position || [0, 0, 0]));

        this.initialize();
    }

    initialize() {
        this.initOptions();
        this.initVariables();
        this.initElements();
        this.initBehavior();
    }

    initOptions() {}
    initVariables() {}
    initElements() {}
    initBehavior() {
        this.on('change', () => {
            this.renderData = null;
        });
    }

    setPosition(v) {
        this.position = Coordinate.from(v);
        this.transformToWorldCoord();
    }

    // 获取位置，中心位置
    getPosition() {
        let pos = [...this.position.getValue(), 1];
        vec4.transformMat4(pos, pos, this.transform.matrix);
        return vec3.fromValues(...pos);
    }

    transformToWorldCoord() {
        this.transform.clear();
        // 转换为世界坐标系的位置
        if (!this.position.equals([0, 0, 0])) {  // 不是原点位置
            // 就移动一下
            this.transform.translate(...this.position.getValue()).apply();
        }
    }

    addElements(elements) {
        [].concat(elements).forEach(el => {
            if (!el || this.elements.get(el.id)) {
                return;
            }
            this.elements.set(el.id, el);
            // by mode id map
            let mode = el.mode;
            let arr = this.byModeElements.get(mode) || new Set();
            arr.add(el.id);
            this.byModeElements.set(mode, arr);
        });
        this.fire('change');
    }

    getRenderData() {
        if (this.renderData) {
            return this.renderData;
        }

        let result = {
            indices: {}
        };

        // 更新 variablSet 的数据
        this.updateVariableSetData();

        let variableSetData = this.variableSet.dump();

        _.extend(result, variableSetData);

        for (let [mode, eIds] of this.byModeElements) {
            result.indices[mode] = [];
            eIds.forEach((eid, index) => {
                let el = this.elements.get(eid);
                let toPush = [...verticesData.getIndicesByVertices(el.vertices)];
                switch (mode) {
                    case RENDER_TYPE.TRIANGLE_STRIP:
                        // 注意了，不能是 0,1,2,3 应该是 1,0,2,3
                        // 不然就会缺一块了
                        if (el.type === 'face' && toPush.length > 3) {
                            let t = toPush[0];
                            toPush[0] = toPush[1];
                            toPush[1] = t;
                        }
                        // // 貌似 web2.0 才支持 GL_PRIMITIVE_RESTART_FIXED_INDEX 的开启
                        // if (result.indices[mode].length > 0) {
                        //     result.indices[mode].push(65535);
                        // }
                        // 先使用退化三角形吧
                        if (result.indices[mode].length > 0) {
                            result.indices[mode].push(result.indices[mode][result.indices[mode].length - 1]);
                            result.indices[mode].push(toPush[0]);
                        }
                        break;
                    default:
                        break;
                }
                result.indices[mode] = result.indices[mode].concat(toPush);
            });
        }

        result.indices = _.mapValues(result.indices, i => new Uint16Array(i));
        this.renderData = result;
        return result;
    }

    variableSet = new VariableSet();
    addAttribute(name, extra) {
        this.variableSet.add(_.assign({}, extra, {name: name, type: 'attribute'}));
    }
    addUniform(name, extra) {
        this.variableSet.add(_.assign({}, extra, {name: name, type: 'uniform'}));
    }
    addVarying(name, extra) {
        this.variableSet.add(_.assign({}, extra, {name: name, type: 'varying'}));
    }
    // 更新 variableSet 的数据
    updateVariableSetData() {}

    getModelMatrix() {
        let matrix = mat4.clone(this.transform.matrix);
        // 仅受 parent 影响
        if (this.parent) {
            mat4.multiply(matrix, this.parent.getModelMatrix(), matrix);
        }
        return matrix;
    }
}
