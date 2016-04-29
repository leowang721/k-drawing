/**
 * @file 片元着色器，进行逐片元处理过程如光照，WebGL术语，可以理解为像素
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
    precision mediump float;
    <!-- if: {{hasTexture}} -->
    uniform sampler2D u_Sampler;
    varying vec2 v_TexCoord;
    <!-- else: -->
    varying vec4 v_Color;
    <!-- /if -->
    <!-- for: {{uniform}} as {{eachUniform}} -->
    uniform {{eachUniform.glType}} {{eachUniform.name}};
    <!-- /for -->
    <!-- for: {{varying}} as {{eachVarying}} -->
    varying {{eachVarying.glType}} {{eachVarying.name}};
    <!-- /for -->
    void main() {
        <!-- if: {{hasTexture}} -->
        gl_FragColor = texture2D(u_Sampler, v_TexCoord);
        <!-- else: -->
        gl_FragColor = v_Color;
        <!-- /if -->
        <!-- for: {{uniform}} as {{eachUniform}} -->
        {{eachUniform.glName}} = {{eachUniform.name}};
        <!-- /for -->
        <!-- for: {{varying}} as {{eachVarying}} -->
        {{eachVarying.glName}} = {{eachVarying.name}};
        <!-- /for -->
    }
`;

export default class VertexShader extends Shader {
    initialize() {
        this.sourceRenderer = engine.compile(TPL_SOURCE);
    }

    link(gl) {
        this.gl = gl;
        this.type = gl.FRAGMENT_SHADER;
        return this;
    }
}
