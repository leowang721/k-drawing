/**
 * @file 渲染处理类
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {EventTarget, util} from 'k-core';
import {VAR_TYPE} from './config/type';
import Animation from './animation/Animation';
import {mat4} from './dep/gl-matrix-min';

export default class Renderer extends EventTarget {

    animation = new Animation();

    constructor(options = {}) {
        super();
        this.dom = document.getElementById(options.domId);
        if (!this.dom) {
            throw new Error('Invalid arguments for Renderer\'s constructor.');
        }

        this.initialize();
    }

    initialize() {
        this.initStructure();
        this.initContext();
        this.initBehavior();
    }

    initStructure() {
        let width = this.dom.offsetWidth;
        let height = this.dom.offsetHeight;
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('id', util.guid());
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.innerHTML = 'Please use the browser supporting "canvas"';
        this.dom.appendChild(this.canvas);

        let info = document.createElement('div');
        info.setAttribute('id', 'scene-info');
        info.style.position = 'absolute';
        info.style.top = '0px';
        info.style.left = '0px';
        this.infoDom = info;
        this.dom.appendChild(this.infoDom);
    }

    initContext() {
        let keywords = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];

        for (let i = 0; i < keywords.length; i++) {
            try {
                this.gl = this.canvas.getContext(keywords[i]);
            }
            catch (e) {
                break;
            }
            if (this.gl) {
                break;
            }
        }

        if (!this.gl) {
            throw new Error('Please use the browser supporting "webgl"');
        }

        // 设置视口
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    initBehavior() {
        this.animation.on('fps', e => {
            this.infoDom.innerHTML = `FPS: ${e.fps}`;
        });
        this.animation.on('frame', () => this.repaint());
        this.animation.on('finish', () => this.repaint());
    }

    render(scene) {
        let gl = this.gl;
        this.scene = scene;
        this.scene.width = this.width;
        this.scene.height = this.height;
        return scene.link(gl).then(() => {
            this.repaint();
        });
    }

    repaint() {
        let gl = this.gl;
        let scene = this.scene;

        this.renderBackground(scene);

        _.each(scene.shapes, (byProgramShapes, program) => {
            scene.useProgram(program).then(() => {
                _.each(byProgramShapes, (byModeShapes, mode) => {
                    _.each(byModeShapes, shape => {
                        let toRenderCount = this.initVboWith(shape);
                        gl.drawElements(gl[mode], toRenderCount, gl.UNSIGNED_BYTE, 0);
                        // context的刷新
                        gl.flush();
                    });
                });
            });
        });
    }

    initVboWith(shape) {
        let rendererData = shape.getRendererData().dumpForRenderer();
        // 初始化VBO
        // 先处理 verticesData
        // 顶点数据buffer
        this.createVBOForScene(rendererData, shape);
        // 顶点索引buffer
        this.createIBOForScene(rendererData);

        // 处理 uniform
        this.processUniform(rendererData, shape);

        return rendererData.toRenderCount;
    }

    createIBOForScene(rendererData) {
        let gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        let data = rendererData.verticesData;
        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.vertexIndices, gl.STATIC_DRAW);
    }

    createVBOForScene(rendererData, shape) {
        let gl = this.gl;
        let pos = null;

        // 要检查一下是否有未赋值的变量
        let toCheck = this.scene.variableSet.vertex.dumpToCheck();
        let program = this.scene.getProgram(shape.program);

        _.each(rendererData, (data, key) => {
            switch (key) {
                case 'verticesData':  // 处理VerticesData
                    // 创建缓冲区对象们
                    let vBuffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, data.vertexCoords, gl.STATIC_DRAW);
                    pos = gl.getAttribLocation(program, 'a_Position');
                    // let FSIZE = data.vertices.BYTES_PER_ELEMENT;
                    // gl.vertexAttribPointer(a_Position, data.step, gl.FLOAT, false, FSIZE * 3, 0)
                    // 当前顶点和颜色是分开的，所以先不用指定偏移
                    gl.enableVertexAttribArray(pos);
                    gl.vertexAttribPointer(pos, data.step.vertex, gl.FLOAT, false, 0, 0);

                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    if (data.textureCoords.size > 0) {
                        for (let [index, coords] of data.textureCoords) {
                            let tBuffer = gl.createBuffer();
                            gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
                            gl.bufferData(gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW);
                            pos = gl.getAttribLocation(program, 'a_TexCoord');
                            gl.enableVertexAttribArray(pos);
                            gl.vertexAttribPointer(pos, data.step.texture, gl.FLOAT, false, 0, 0);
                        }
                    }
                    else {
                        let colorBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, data.colors, gl.STATIC_DRAW);
                        pos = gl.getAttribLocation(program, 'a_Color');
                        if (pos > -1) {
                            gl.enableVertexAttribArray(pos);
                            gl.vertexAttribPointer(pos, data.step.color, gl.FLOAT, false, 0, 0);
                            gl.bindBuffer(gl.ARRAY_BUFFER, null);
                        }
                    }

                    toCheck.delete('a_Position');
                    toCheck.delete('v_Color');
                    break;
                case 'attribute':  // 额外的 attribute，变成对应的VBO
                case 'varying':
                    data.forEach((attrData, attrName) => {
                        let attrBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer);
                        gl.bufferData(gl.ARRAY_BUFFER, attrData.value, gl.STATIC_DRAW);
                        pos = gl.getAttribLocation(program, attrName.replace('v_', 'a_'));
                        gl.enableVertexAttribArray(pos);
                        gl.vertexAttribPointer(pos, attrData.step, gl.FLOAT, false, 0, 0);
                        gl.bindBuffer(gl.ARRAY_BUFFER, null);
                        toCheck.delete(attrName, 1);
                    });
                    break;
            }
        });

        // 检查
        if (toCheck.size) {
            // 说明有没处理的变量，生成默认值 1
            for (let key of toCheck.keys()) {
                let variable = this.scene.variableSet.vertex.get(key) || this.scene.variableSet.vertex.get(key);
                let type = variable.type;
                switch (type) {
                    case 'attribute':
                    case 'varying':
                        console.warn('有未设置的变量：' + key + '，自动添1。');
                        let attrBuffer = gl.createBuffer();
                        gl.bindBuffer(gl.ARRAY_BUFFER, attrBuffer);
                        gl.bufferData(
                            gl.ARRAY_BUFFER,
                            new Float32Array(_.times(rendererData.toRenderCount, _.constant(1.0))),
                            gl.STATIC_DRAW
                        );
                        pos = gl.getAttribLocation(program, key);
                        gl.enableVertexAttribArray(pos);
                        gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 0, 0);
                        gl.bindBuffer(gl.ARRAY_BUFFER, null);
                        break;
                }
            }
        }
    }

    processUniform(rendererData, shape) {
        let program = this.scene.getProgram(shape.program);

        // 视图模型矩阵
        let pos = this.gl.getUniformLocation(program, 'u_ViewModelMatrix');
        let projMatrix = this.scene.getProjectionMatrix();
        let viewModelMatrix = mat4.clone(projMatrix);
        mat4.multiply(viewModelMatrix, viewModelMatrix, this.scene.camera.matrix);
        mat4.multiply(viewModelMatrix, viewModelMatrix, rendererData.verticesData.modelMatrix);
        this.gl.uniformMatrix4fv(pos, false, viewModelMatrix);

        if (shape.texture) {
            pos = this.gl.getUniformLocation(program, 'u_Sampler');
            shape.texture.processWith(this.gl, this.scene);
            this.gl.uniform1i(pos, 0);
        }

        rendererData.uniform.forEach((value, unif) => {
            pos = this.gl.getUniformLocation(program, unif.name);
            switch (unif.glType) {
                case VAR_TYPE.FLOAT:
                    this.gl.uniform1f(pos, value);
                    break;
                case VAR_TYPE.VEC4:
                    this.gl.uniform4fv(pos, value);
                    break;
                case VAR_TYPE.MAT4:
                    this.gl.uniformMatrix4fv(pos, false, value);
                    break;
            }
        });
    }

    renderBackground(scene) {
        if (scene.backgroundColor) {
            // 指定背景色
            this.gl.clearColor(...scene.backgroundColor.toArray());
            // 使用背景色清空绘图区
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }
    }
}
