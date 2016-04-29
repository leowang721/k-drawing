/**
 * @file 顶点着色器类，用来描述顶点特性（如位置、颜色等）
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import etpl from 'etpl';
import Shader from './Shader';

let engine = new etpl.Engine({
    variableOpen: '{{',
    variableClose: '}}'
});

// 使用 OpenGL ES 着色器语言（GLSL ES）来编写
const TPL_SOURCE = `
    attribute vec4 a_Position;

    <!-- if: {{hasTexture}} -->
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    <!-- else: -->
    attribute vec4 a_Color;
    varying vec4 v_Color;
    <!-- /if -->
    <!-- for: {{attribute}} as {{eachAttribute}} -->
    attribute {{eachAttribute.glType}} {{eachAttribute.name}};
    <!-- /for -->

    <!-- for: {{varying}} as {{eachVarying}} -->
    attribute {{eachVarying.glType}} {{eachVarying.glAName}};
    varying {{eachVarying.glType}} {{eachVarying.name}};
    <!-- /for -->

    uniform mat4 u_ModelMatrix;

    void main() {
        gl_Position = u_ModelMatrix * a_Position;
        <!-- for: {{attribute}} as {{eachAttribute}} -->
        {{eachAttribute.glName}} = {{eachAttribute.name}};
        <!-- /for -->
        <!-- if: {{hasTexture}} -->
        v_TexCoord = a_TexCoord;
        <!-- else: -->
        v_Color = a_Color;
        <!-- /if -->
        <!-- for: {{varying}} as {{eachVarying}} -->
        {{eachVarying.name}} = {{eachVarying.glAName}};
        <!-- /for -->
    }
`;

export default class VertexShader extends Shader {
    initialize() {
        this.sourceRenderer = engine.compile(TPL_SOURCE);
    }

    link(gl) {
        this.gl = gl;
        this.type = gl.VERTEX_SHADER;
        return this;
    }
}
