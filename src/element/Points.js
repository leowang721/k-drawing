/**
 * @file 点精灵
 * 渲染使用 POINTS
 * 主要是给粒子效果使用的，而不是用作正方形
 * Element的作用就是按照 RENDER_TYPE 整理顶点信息: coord、color
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {util} from 'k-core';
import Rgba from '../helper/Rgba';
import Coordinate from '../helper/Coordinate';
import Vertex from '../helper/Vertex';
import {RENDER_TYPE} from '../config/type';
import verticesData from '../helper/verticesData';

export default class Points {

    /**
     * 渲染模式
     *
     * 可选值：POINTS
     *
     * @type {RENDER_TYPE}
     */
    mode = RENDER_TYPE.POINTS;

    type = 'points';

    /**
     * 顶点是有序的
     * @type {Array.<helper.Vertex>}
     */
    vertices = [];
    sizes = [];

    constructor(options = {}) {
        this.id = options.id || `points-${util.guid()}`;
        this.color = Rgba.from(options.color);
        this.size = options.size || 1;

        this.addVertices(options.vertices);
    }

    addVertices(vertices = []) {
        [].concat(vertices).forEach(vertex => {
            let toAdd = null;
            if (_.isArrayLike(vertex) || vertex instanceof Coordinate) {
                toAdd = Vertex.from({
                    coord: vertex,
                    color: this.color,
                    size: this.size
                });
                this.sizes.push(this.size);
            }
            else {
                toAdd = Vertex.from({
                    coord: vertex.coord,
                    color: vertex.color || this.color,
                    size: vertex.size || this.size
                });
                this.sizes.push(vertex.size || this.size);
            }
            this.vertices.push(toAdd);
            verticesData.add(toAdd);
        });
    }
}
