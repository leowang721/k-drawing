/**
 * @file 场景类，一个集成的环境，用于配置webgl的图形等东西
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget, Promise, util} from 'k-core';
import {mat4} from './dep/gl-matrix-min';
import Position from './variable/Position';
import VariableSet from './helper/VariableSet';
import Transform from './helper/Transform';
import shaderLib from './shader/library';
import Camera from './Camera';

export default class Scene extends EventTarget {

    shader = {};
    shapeMap = new Map();

    programPool = {};

    transform = new Transform(this);

    constructor(options = {}) {
        super();
        this.name = options.name || 'scene-' + util.guid();
        this.options = options;
        this.shapes = {};

        this.width = options.width || 1;
        this.height = options.height || 1;
        this.near = options.near || 0;
        this.far = options.far || 0.5;

        this.projection = options.projection || 'orthographic';  // perspective || orthographic

        this.setCamera(options.camera || new Camera());
        this.initialize();
    }

    initialize() {
        this.backgroundColor = this.options.backgroundColor;
        this.initVariableSet();
        this.initBehavior();
    }

    initBehavior() {}

    getProjectionMatrix() {
        if (!this.projectionMatrix) {
            let currentSetting = this.options.projectionSettings || {};
            let near = currentSetting.near || this.near;
            let far = currentSetting.far || this.far;
            let matrix = mat4.identity(mat4.create());
            switch (this.projection) {
                case 'perspective':
                    let fovy = currentSetting.fovy || 30;
                    let aspect = this.width / this.height;
                    mat4.perspective(matrix, fovy, aspect, near, far);
                    break;
                case 'orthographic':
                    let left = currentSetting.left === undefined ? -this.width / 2 : currentSetting.left;
                    let right = currentSetting.right === undefined ? this.width / 2 : currentSetting.right;
                    let bottom = currentSetting.bottom === undefined ? -this.height / 2 : currentSetting.bottom;
                    let top = currentSetting.top === undefined ? this.height / 2 : currentSetting.top;
                    mat4.frustum(matrix, left, right, bottom, top, near, far);
                    break;
            }
            this.projectionMatrix = matrix;
        }
        return this.projectionMatrix;
    }

    add(shapes) {
        shapes = [].concat(shapes);
        shapes.forEach(shape => {
            // by program group
            let program = shape.program;
            this.shapes[program] = this.shapes[program] || {};

            let mode = shape.mode;
            this.shapes[program][mode] = this.shapes[program][mode] || [];
            this.shapes[program][mode].push(shape);
            this.variableSet.vertex.merge(shape.variableSet.vertex);
            this.variableSet.fragment.merge(shape.variableSet.fragment);
            this.shapeMap.set(shape.id, shape);
        });
    }

    get(shapeId) {
        return this.shapeMap.get(shapeId);
    }

    setCamera(camera, lookAt = [0, 0, 0]) {
        this.camera = camera;
        this.camera.lookAt(lookAt);
    }

    initVariableSet() {
        this.variableSet = {
            vertex: new VariableSet(),
            fragment: new VariableSet()
        };
    }

    link(gl) {
        this.gl = gl;

        return new Promise((resolve, reject) => {
            this.prepareShapes().then(resolve, reject);
        }).catch(e => {
            console.error(e);
        });
    }

    prepareShapes() {
        let shaderNames = new Set();
        let textures = new Map();
        for (let shape of this.shapeMap.values()) {
            shaderNames.add(shape.program);
            shape.texture && textures.set(shape.texture.url, shape.texture);
        }
        return Promise.all(
            [...shaderNames].map(name => shaderLib.use(name)).concat([...textures.values()].map(t => t.load()))
        );
    }

    getProgram(name) {
        return this.programPool[name];
    }

    useProgram(name) {
        let gl = this.gl;
        if (this.programPool[name]) {
            gl.useProgram(this.programPool[name]);
            return Promise.resolve();
        }
        return shaderLib.use(name).then(source => {
            this.programPool[name] = this.createProgram(source);
            gl.useProgram(this.programPool[name]);
        });
    }

    createProgram(source) {
        let gl = this.gl;
        let program = gl.createProgram();

        gl.attachShader(program, this.createShader(source.vertex, gl.VERTEX_SHADER));
        gl.attachShader(program, this.createShader(source.fragment, gl.FRAGMENT_SHADER));

        // 去除 waring
        // [.CommandBufferContext]PERFORMANCE WARNING: Attribute 0 is disabled. This has signficant performance penalty
        gl.bindAttribLocation(program, 0, Position.VAR_NAME);

        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            let info = gl.getProgramInfoLog(program);
            throw new Error('Could not compile WebGL program. \n\n' + info);
        }

        return program;
    }

    createShader(source, type) {
        let gl = this.gl;
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            let error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
