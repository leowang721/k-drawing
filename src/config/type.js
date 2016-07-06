/**
 * @file type 常量的配置
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';

export const KEY = {
    BUFFER: {
        COLOR: 'COLOR_BUFFER_BIT',  // 颜色缓存
        DEPTH: 'DEPTH_BUFFER_BIT',  // 深度缓冲区
        STENCIL: 'STENCIL_BUFFER_BIT'  // 模板缓冲区
    },
    SHADER: {
        VERTEX: 'VERTEX_SHADER',
        FRAGMENT: 'FRAGMENT_SHADER'
    }
};

/**
 * 基础渲染类型定义共7种，是WebGL直接绘制的方式……
 * 也是 drawArrays和drasyElements 使用的 gl[类型] 取值
 *
 * @type {Object}
 */
export const RENDER_TYPE = {
    POINTS: 'POINTS',  // 点
    LINES: 'LINES',  // 线段
    LINE_STRIP: 'LINE_STRIP',  // 线条 一系列连接的线段
    LINE_LOOP: 'LINE_LOOP',  // 回路 一系列连接的线段，最后一个点会连回起点
    TRIANGLES: 'TRIANGLES',  // 三角形
    TRIANGLE_STRIP: 'TRIANGLE_STRIP',  // 一系列条带状的三角形，以模进的方式绘制三角形
    TRIANGLE_FAN: 'TRIANGLE_FAN'  // 三角扇，一系列三角形组成的类似于扇形的图形，第一个点不变，后续的点模进
};

export const VAR_TYPE = {
    BOOL: 'bool',
    VEC2: 'vec2',
    VEC4: 'vec4',
    FLOAT: 'float',
    MAT4: 'mat4',
    SAMPLER_2D: 'sampler2D'
};

function getRealValue(gl, mapping) {
    let result = {};
    for (let key in mapping) {
        if (mapping.hasOwnProperty(key)) {
            let value = mapping[key];
            if (_.isObject(value)) {
                result[key] = getRealValue(gl, value);
            }
            else {
                result[key] = gl[value];
            }
        }
    }
    return result;
}

export default {
    adjustWith(gl) {
        return getRealValue(gl, KEY);
    }
};
