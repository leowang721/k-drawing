/**
 * @file 线，线至少由两个点组成
 * 渲染使用 LINES | LINE_STRIP | LINE_LOOP
 *
 * 作为基本元素，提供一些功能：（还没搞）
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {util} from 'k-core';
import Rgba from '../helper/Rgba';
import Vertex from '../helper/Vertex';
import {RENDER_TYPE} from '../config/type';
import verticesData from '../helper/verticesData';
import Coordinate from '../helper/Coordinate';

export default class Lines {

    /**
     * 渲染模式
     *
     * 可选值：LINES | LINE_STRIP | LINE_LOOP
     *
     * @type {RENDER_TYPE}
     */
    mode = RENDER_TYPE.LINES;

    type = 'lines';

    /**
     * 顶点是有序的，实际上顶点序决定了渲染序，也就决定了线的方向……
     * @type {Array.<helper.Vertex>}
     */
    vertices = [];

    constructor(options = {}) {
        this.id = options.id || `lines-${util.guid()}`;
        this.color = Rgba.from(options.color || Rgba.WHITE);
        if (options.mode && [RENDER_TYPE.LINES, RENDER_TYPE.LINE_STRIP, RENDER_TYPE.LINE_LOOP].includes(options.mode)) {
            this.mode = options.mode;
        }

        this.addVertices(options.vertices);
    }

    addVertices(vertices = []) {
        [].concat(vertices).forEach(vertex => {
            let toAdd = null;
            if (_.isArrayLike(vertex) || vertex instanceof Coordinate) {
                toAdd = Vertex.from({
                    coord: vertex,
                    color: this.color
                });
            }
            else {
                toAdd = Vertex.from({
                    coord: vertex.coord,
                    color: vertex.color || this.color
                });
            }
            this.vertices.push(toAdd);
            verticesData.add(toAdd);
        });
    }
}
