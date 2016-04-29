/**
 * @file A Simple Shape —— POINTS
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget, LifeStage, util} from 'k-core';
import RendererData from '../helper/RendererData';
import VariableSet from '../helper/VariableSet';
import Transform from '../helper/Transform';
import Coordinate from '../helper/Coordinate';
import TextureCoord from '../helper/TextureCoord';

export default class Shape extends EventTarget {

    /**
     * 供渲染使用的数据
     */
    rendererData = new RendererData();

    program = 'basic';

    vertices = [];

    transform = new Transform(this);
    position = null;

    variableSet = {
        vertex: new VariableSet(),
        fragment: new VariableSet()
    };

    constructor(options = {}) {
        super();

        this.lifeStage = new LifeStage({
            stages: ['NEW', 'INITED', 'LINKED', 'RENDERED', 'REPAINTED', 'UNLINKED', 'DISPOSED']
        });
        this.lifeStage.setHost(this);

        this.options = options;

        this.id = options.id || 'shape-' + util.guid();
        this.color = options.color;  // 颜色
        if (options.texture) {
            this.program += '-texture';
            this.texture = options.texture;
        }

        this.initialize();
        this.lifeStage.next();  // should be INITED
    }

    initialize() {
        this.initOptions();
        this.initVariables();
        this.initElements();
        this.calculatePosition();
        this.initBehavior();
    }

    initOptions() {}
    initVariables() {}
    initElements() {}
    initBehavior() {
        this.transform.on('change', () => {
            this.calculatePosition();
            this.rendererData.verticesData.setModelMatrix(this.transform.matrix);
        });
    }

    addAttribute(attr) {
        this.variableSet.vertex.add(attr);
    }
    addUniform(unif, where = 'fragment') {
        this.variableSet[where].add(unif);
    }
    addVarying(vary) {
        this.variableSet.vertex.add(vary);
        this.variableSet.fragment.add(vary);
    }

    // 增加顶点
    addVertices(vertices) {
        if (this.texture) {
            let currentIndex = this.vertices.length;
            [].concat(vertices).map((vertex, index) => {
                vertex.texture = [TextureCoord.from(this.texture.coords[currentIndex + index])];
            });
        }

        this.vertices = this.vertices.concat(vertices);
        this.rendererData.addVertices(vertices);
    }

    getRendererData() {
        return this.rendererData;
    }

    // 获取位置，中心位置
    getPosition() {
        return this.position || this.calculatePosition();
    }
    calculatePosition() {
        // 取中心位置
        let mx = 0;
        let my = 0;
        let mz = 0;
        let mmx = 2;
        let mmy = 2;
        let mmz = 2;
        this.vertices.forEach(v => {
            mx = Math.max(mx, v.coord.x);
            mmx = Math.min(mmx, v.coord.x);
            my = Math.max(my, v.coord.y);
            mmy = Math.min(mmy, v.coord.y);
            mz = Math.max(mz, v.coord.z);
            mmz = Math.min(mmz, v.coord.z);
        });
        this.position = new Coordinate((mx + mmx) / 2, (my + mmy) / 2, (mz + mmz) / 2);
    }
}
