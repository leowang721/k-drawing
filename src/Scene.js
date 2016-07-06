/**
 * @file 场景类，一个集成的环境，用于配置webgl的图形等东西
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {EventTarget, Promise, util} from 'k-core';
import Position from './variable/Position';
import Transform from './helper/Transform';
import Animation from './animation/Animation';
import Shader from './Shader';
import shaderLib from './shader/library';
import Camera from './Camera';
import Light from './Light';
import Mash from './shape/Mash';

export default class Scene extends EventTarget {

    // 程序池，缓存方便重复使用
    // 当前是按照element来逐个渲染，因此有可能是会用到不同的program
    // key是 name
    // value是对象，包含program和shader
    programPool = {};
    currentProgramName = null;

    shapes = {};  // 形状们，每种形状对应着一个 shaderType
    shapeMap = new Map();

    currentCamera = null;  // 当前视点
    cameraMap = new Map();  // 视点们
    currentLight = null;  // 当前光照
    lightMap = new Map();  // 光照们

    transform = new Transform(this);
    animation = new Animation();  // 全局动画

    /**
     * 构造函数
     *
     * @param {Object} options = {} 配置参数
     * @param {string=} options.id id标识
     * @param {number=} options.width 场景宽度
     * @param {number=} options.height 场景高度
     * @param {number=} options.depth 场景深度
     */
    constructor(options = {}) {
        super();
        this.options = options;
        this.id = options.id || 'scene-' + util.guid();
        this.width = options.width;
        this.height = options.height;
        this.depth = options.depth;

        if (!this.width || !this.height || !this.depth) {
            throw new Error('必须指定宽、高和深度！');
        }

        let camera = options.camera || new Camera();
        this.addCameras(camera);
        this.useCamera(camera);

        if (options.light) {
            this.addLights(options.light);
            this.useLight(options.light);
        }

        if (options.mash) {
            let mashOpts = typeof options.mash === 'object' ? options.mash : {};
            this.addShapes(new Mash(Object.assign(mashOpts, {
                width: this.width,
                height: this.height,
                depth: this.depth
            })));
        }

        this.initialize();
    }

    initialize() {
        this.backgroundColor = this.options.backgroundColor;
        this.initBehavior();
    }

    initBehavior() {
        this.animation.on('fps', e => this.fire('animation:fps', e));
        this.animation.on('frame', e => this.fire('animation:frame', e));
        this.animation.on('finish', e => this.fire('animation:finish', e));
    }

    // 需要先链接gl，才能渲染，这个处理交由 renderer 执行
    link(gl) {
        this.gl = gl;

        return new Promise((resolve, reject) => {
            this.prepareShapes().then(resolve, reject);
        }).catch(e => {
            console.error(e);
        });
    }

    prepareShapes() {
        let shaderTypes = new Set();
        for (let shape of this.shapeMap.values()) {
            shaderTypes.add(shape.shaderType);
        }
        return Promise.all(
            [...shaderTypes].map(type => shaderLib.use(type))
        );
    }

    getProgramNameByShape(shape) {
        let programName = [shape.shaderType];
        if (this.getCurrentLight()) {
            programName.push('light');
        }
        if (shape.flag.texture) {
            programName.push('texture');
        }
        return programName.join('-');
    }

    getProgramByShape(shape) {
        return new Promise((resolve, reject) => {
            let name = this.getProgramNameByShape(shape);
            let program = (this.programPool[name] || {}).program;
            if (program) {
                resolve(program);
            }
            else {
                // 否则就新建一个
                let shader = (this.programPool[name] || {}).shader;
                if (!shader) {
                    shader = new Shader({
                        type: shape.shaderType,
                        name: name
                    });
                    if (this.getCurrentLight()) {
                        shader.enableLight();
                    }
                    if (shape.flag.texture) {
                        shader.enableTexture();
                    }
                    this.programPool[name] = {shader};
                }

                shader.getSource().then(source => {
                    // 判断先，是否已有了，有了就不再创建了
                    if (!this.programPool[name].program) {
                        let program = this.createProgram(source);
                        program.name = name;
                        this.programPool[name].program = program;
                    }
                    resolve(this.programPool[name].program);
                });
            }
        });
    }

    useProgram(program) {
        let gl = this.gl;
        if (this.currentProgramName !== program.name) {
            this.currentProgramName = program.name;
            gl.useProgram(program);
        }
    }

    getCurrentProgram() {
        return this.programPool[this.currentProgramName].program;
    }
    getCurrentShader() {
        return this.programPool[this.currentProgramName].shader;
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

    addShapes(shapes) {
        shapes = [].concat(shapes);
        shapes.forEach(shape => {
            let type = shape.type;
            this.shapes[type] = this.shapes[type] || [];
            this.shapes[type].push(shape);
            this.shapeMap.set(shape.id, shape);
            shape.on('change', () => {
                this.clearBufferredStatus();
            });
        });
        // 需要重新搞数据了
        this.clearBufferredStatus();
    }

    clearBufferredStatus() {
        _.each(this.programPool, p => {
            p.program.verticesDataBufferred = false;
            p.program.textureBufferred = false;
        });
    }

    getShape(shapeId) {
        return this.shapeMap.get(shapeId);
    }

    addCameras(cameras) {
        cameras = [].concat(cameras);
        cameras.forEach(camera => {
            if (!(camera instanceof Camera)) {
                throw new Error('Invalid argument when trying to add camera to scene.');
            }
            this.cameraMap.set(camera.id, camera);
        });
    }

    getCamera(id) {
        return this.cameraMap.get(id);
    }

    useCamera(id) {
        if (this.currentCamera && this.currentCamera.id === id) {
            return;
        }

        let old = this.currentCamera;
        if (old) {
            old.un('change', this.triggerCameraChange, this);
        }

        if (id instanceof Camera) {
            this.currentCamera = id;
        }
        else {
            this.currentCamera = this.getCamera(id);
        }

        if (!this.currentCamera) {
            throw new Error(`Failed to use camera(${id})  in scene(${this.id}).`);
        }

        this.currentCamera.setSceneRange({
            width: this.width,
            height: this.height,
            depth: this.depth
        });
        this.currentCamera.on('change', this.triggerCameraChange, this);
        return this.currentCamera;
    }

    triggerCameraChange() {
        this.fire('camera:change');
    }

    getCurrentCamera() {
        return this.currentCamera;
    }

    setCameraLookAt(pos) {
        if (pos) {
            this.currentCamera.lookAt(pos);
        }
    }
    setCameraPosition(pos) {
        if (pos) {
            this.currentCamera.setPosition(pos);
        }
    }

    addLights(lights) {
        lights = [].concat(lights);
        lights.forEach(light => {
            if (!(light instanceof Light)) {
                throw new Error('Invalid argument when trying to add light to scene.');
            }
            this.lightMap.set(light.id, light);
        });
    }

    getLight(id) {
        return this.lightMap.get(id);
    }

    useLight(id) {
        if (id instanceof Light) {
            this.currentLight = id;
        }
        else {
            this.currentLight = this.getLight(id);
        }

        if (!this.currentLight) {
            throw new Error(`Failed to use light(${id})  in scene(${this.id}).`);
        }

        this.fire('light:change');
        return this.currentLight;
    }

    getCurrentLight() {
        return this.currentLight;
    }
}
