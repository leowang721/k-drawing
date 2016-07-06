/**
 * @file 渲染处理类
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {EventTarget, util} from 'k-core';
import {mat4} from './dep/gl-matrix-min';
import verticesData from './helper/verticesData';
import Coordinate from './helper/Coordinate';
import Rgba from './helper/Rgba';
import {VAR_TYPE} from './config/type';

export default class Renderer extends EventTarget {

    /**
     * 构造函数
     *
     * @param {Object} options = {} 参数
     * @param {string=} options.id id标识
     * @param {string} options.domId 要渲染到的dom的id
     * @param {boolean=} options.autoRefresh 是否启用自动刷新，后续可以手动启动的
     */
    constructor(options = {}) {
        super();
        this.dom = document.getElementById(options.domId);
        if (!this.dom) {
            throw new Error('Invalid arguments for Renderer\'s constructor.');
        }

        this.options = options;

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

    initBehavior() {}

    initSceneBehavior() {
        this.scene.on('camera:change', () => this.repaint());
        this.scene.on('animation:fps', e => {
            this.infoDom.innerHTML = `FPS: ${e.fps}`;
        });
        this.scene.on('animation:frame', () => this.repaint());
        this.scene.on('animation:finish', () => this.repaint());
    }

    render(scene) {
        let gl = this.gl;
        this.gl.enable(this.gl.DEPTH_TEST);  // 开启隐藏面消除
        this.gl.enable(gl.POLYGON_OFFSET_FILL);  // 开启多边形偏移，防止相同z的图形叠加
        this.scene = scene;
        this.scene.width = this.width;
        this.scene.height = this.height;

        this.initSceneBehavior();

        return scene.link(gl).then(() => {
            this.repaint();
            if (this.options.autoRefresh) {
                this.autoRefresh(true);
            }
        });
    }

    autoRefresh(enabled) {
        if (enabled) {
            let counter = 0;
            this.startTime = Date.now() - this.currentSpent;
            let start = Date.now();
            let tick = () => {
                let now = Date.now();
                this.currentSpent = now - this.startTime;
                if (counter === 30) {
                    // 帧率
                    let fps = Math.round(counter * 1000 / (now - start));
                    counter = 0;
                    start = now;
                    this.infoDom.innerHTML = `FPS: ${fps}`;
                }
                counter++;
                this.tickId = requestAnimationFrame(tick);
                this.refresh();
            };
            tick();
        }
        else {
            cancelAnimationFrame(this.tickId);
        }
    }

    repaint() {
        let gl = this.gl;
        let scene = this.scene;
        this.renderBackground(scene);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // 颜色 & 深度缓冲区清除

        _.each(scene.shapes, (byTypeShapes, type) => {
            _.each(byTypeShapes, shape => {
                scene.getProgramByShape(shape).then(program => {
                    let renderData = shape.getRenderData();
                    if (program !== this.lastProgram) {
                        scene.useProgram(program);
                        this.lastProgram = program;
                        scene.clearBufferredStatus();
                    }
                    if (!program.verticesDataBufferred) {
                        // 处理并传输vertices数据
                        this.processVerticesBuffer(verticesData.dump(), shape);
                        program.verticesDataBufferred = true;
                    }

                    if (shape.flag.texture && !program.textureBufferred) {
                        // textures的图片处理
                        this.processTexture(shape.material);
                        program.textureBufferred = true;
                    }

                    // attribute数据
                    _.each(renderData.attribute, (eachAttr, key) => {
                        this.processAttributeBuffer(key, eachAttr.data, eachAttr.step);
                    });
                    // uniform
                    _.each(renderData.uniform, (eachUni, key) => {
                        this.processUniformData(eachUni);
                    });
                    this.processGlobalUniform(shape.getModelMatrix());
                    // varying数据
                    _.each(renderData.varying, (eachVary, key) => {
                        this.processAttributeBuffer(key.replace('v_', 'a_'), eachVary.data, eachVary.step);
                    });

                    _.each(renderData.indices, (byModeIndices, mode) => {
                        // 处理索引
                        this.processIBOForScene(byModeIndices);

                        gl.drawElements(gl[mode], byModeIndices.length, gl.UNSIGNED_SHORT, 0);
                        // gl.drawArrays(gl[eachOM.mode], 0, eachOM.indexes.length);
                        // 指定驾到每个顶点绘制后z值的偏移量，偏移量是 m * factor + r * units计算
                        // m是顶点所在表面相对于观察者视线的角度，r表示硬件能够区分两个z值之差的最小值
                        // factor和units依次是两个参数
                        this.gl.polygonOffset(1.0, 1.0);
                        gl.flush();
                    });
                });
            });
        });
    }

    refresh() {
        this.repaint();
    }

    renderBackground(scene) {
        if (scene.backgroundColor) {
            // 指定背景色
            this.gl.clearColor(...scene.backgroundColor.toArray());
        }
    }

    buffer = {};

    processVerticesBuffer(vdata, shape) {
        let buffer = this.buffer[this.scene.currentProgramName + '/' + 'vertices'] || this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vdata.data, this.gl.STATIC_DRAW);
        this.buffer[this.scene.currentProgramName + '/' + 'vertices'] = buffer;

        // 数据指定
        let FSIZE = vdata.data.BYTES_PER_ELEMENT;
        // 处理 coord、size 和 color
        let program = this.scene.getCurrentProgram();
        let pos = this.gl.getAttribLocation(program, 'a_Position');
        this.gl.vertexAttribPointer(
            pos, Coordinate.step, this.gl.FLOAT, false,
            FSIZE * vdata.step, FSIZE * vdata.offset.coord
        );
        this.gl.enableVertexAttribArray(pos);
        pos = this.gl.getAttribLocation(program, 'a_PointSize');
        this.gl.vertexAttribPointer(
            pos, Coordinate.step, this.gl.FLOAT, false,
            FSIZE * vdata.step, FSIZE * vdata.offset.size
        );
        this.gl.enableVertexAttribArray(pos);
        pos = this.gl.getAttribLocation(program, 'a_Color');
        this.gl.vertexAttribPointer(
            pos, Rgba.step, this.gl.FLOAT, false,
            FSIZE * vdata.step, FSIZE * vdata.offset.color
        );
        this.gl.enableVertexAttribArray(pos);


        if (this.scene.currentLight) {  // 那么应该有法线
            let npos = this.gl.getAttribLocation(program, 'a_Normal');
            this.gl.vertexAttribPointer(
                npos, 3, this.gl.FLOAT, false,
                FSIZE * vdata.step, FSIZE * vdata.offset.normal
            );
            this.gl.enableVertexAttribArray(npos);
        }
        if (shape.flag.texture) {
            let tpos = this.gl.getAttribLocation(program, 'a_TexCoord');
            this.gl.vertexAttribPointer(
                tpos, 2, this.gl.FLOAT, false,
                FSIZE * vdata.step, FSIZE * vdata.offset.texture
            );
            this.gl.enableVertexAttribArray(tpos);
        }
    }

    processIBOForScene(vertexIndices) {
        let gl = this.gl;
        let indexBuffer = this.buffer.index || gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, vertexIndices, gl.STATIC_DRAW);
        this.buffer.index = indexBuffer;
    }

    processGlobalUniform(modelMatrix) {
        let program = this.scene.getCurrentProgram();
        let shader = this.scene.getCurrentShader();

        // 视图模型矩阵
        let pos = this.gl.getUniformLocation(program, 'u_MVPMatrix');
        let mvpMatrix = this.scene.getCurrentCamera().getMatrix();
        mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);
        this.gl.uniformMatrix4fv(pos, false, mvpMatrix);

        // 暂时先不处理纹理了，重新搞这个
        // if (element.texture) {
        //     pos = this.gl.getUniformLocation(program, 'u_Sampler');
        //     element.texture.processWith(this.gl, this.scene);
        //     this.gl.uniform1i(pos, 0);
        // }

        if (shader.isEnabled('light')) {
            let light = this.scene.getCurrentLight();
            // 设置光源颜色
            pos = this.gl.getUniformLocation(program, 'u_LightColor');
            this.gl.uniform3f(pos, ...light.color);
            pos = this.gl.getUniformLocation(program, 'u_LightDirection');
            this.gl.uniform3f(pos, ...light.direction);
            pos = this.gl.getUniformLocation(program, 'u_AmbientLightColor');
            this.gl.uniform3f(pos, ...light.ambientColor);
            pos = this.gl.getUniformLocation(program, 'u_NormalMatrix');
            let normalMatrix = mat4.clone(modelMatrix);
            mat4.invert(normalMatrix, normalMatrix);
            mat4.transpose(normalMatrix, normalMatrix);
            this.gl.uniformMatrix4fv(pos, false, normalMatrix);
        }
    }

    processAttributeBuffer(key, buf, step) {
        let gl = this.gl;
        let program  = this.scene.getCurrentProgram();
        let buffer = this.buffer[this.scene.currentProgramName + '/' + key] || gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
        let pos = gl.getAttribLocation(program, key);
        // let FSIZE = data.vertices.BYTES_PER_ELEMENT;
        // gl.vertexAttribPointer(a_Position, data.step, gl.FLOAT, false, FSIZE * 3, 0)
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, step, gl.FLOAT, false, 0, 0);
    }

    processUniformData(uniform) {
        let program  = this.scene.getCurrentProgram();
        let pos = this.gl.getUniformLocation(program, uniform.name);
        switch (uniform.glType) {
            case VAR_TYPE.BOOL:
                this.gl.uniform1i(pos, uniform.data);
                break;
            case VAR_TYPE.FLOAT:
                this.gl.uniform1f(pos, uniform.data);
                break;
            case VAR_TYPE.VEC4:
                this.gl.uniform4fv(pos, uniform.uniform);
                break;
            case VAR_TYPE.MAT4:
                this.gl.uniformMatrix4fv(pos, false, uniform.data);
                break;
        }
    }

    processTexture(material) {
        if (!material || !material.textures.size) {
            return;
        }
        for (let eachT of material.textures.values()) {
            eachT.processWith(this.gl, this.scene.getCurrentProgram());
        }
    }
}
