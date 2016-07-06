/**
 * @file 着色器类，用于生成着色器程序……
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import etpl from 'etpl';
import {EventTarget, util} from 'k-core';
import VariableSet from './helper/VariableSet';
import shaderLib from './shader/library';

let renderer = {
    define: etpl.compile('#define ${key} ${content}'),
    precision: etpl.compile('precision ${precision} float;')
};

export default class Shader extends EventTarget {

    type = 'basic';  // shader类型，对应着不同的模板……

    _defined = new Map();
    _enabled = {};

    /**
     * float类型变量的默认精度配置，其他类型都是有默认精度的，当前没做修改支持而已
     * 默认精度：
     *     顶点着色器
     *         int -> highp
     *         float -> highp
     *         sampler2D -> lowp
     *         samplerCube -> lowp
     *     片元着色器
     *         int -> mediump
     *         float -> 无，就是这里指定的
     *         sampler2D -> lowp
     *         samplerCube -> lowp
     *
     * @type {string}
     */
    precision = 'mediump';  // highp | mediump | lowp

    source = {};

    variableSet = new VariableSet();

    constructor(options = {}) {
        super();
        this.id = options.id || 'shader-' + util.guid();
        this.options = options;
        this.initialize();
    }

    initialize() {
        this.initOptions();
    }

    initOptions() {
        _.defaults(this, _.pick(this.options, ['type', 'precision', 'name']));
    }

    enableLight() {
        this.define('ENABLE_LIGHT', 'true');
        this._enabled.light = true;
    }
    enableTexture() {
        this.define('ENABLE_TEXTURE', 'true');
        this._enabled.texture = true;
    }

    isEnabled(key) {
        return !!this._enabled[key];
    }

    define(key, content) {
        if (!this._defined.get(key)) {
            this._defined.set(key, content);
        }
    }

    getDefineSource() {
        let source = [];
        for (let [key, content] of this._defined) {
            source.push(renderer.define({key, content}));
        }
        return source.join('\n');
    }
    getPricisionSource() {
        return renderer.precision({precision: this.precision});
    }

    getSource() {
        return shaderLib.use(this.type).then(source => {
            let defineSource = this.getDefineSource();
            this.source = {
                vertex: [defineSource, source.vertex].join('\n'),
                fragment: [this.getPricisionSource(), defineSource, source.fragment].join('\n')
            };
            return this.source;
        });
    }

    addVariables(variableSet) {
        this.variableSet.merge(variableSet);
        return this;
    }
}
