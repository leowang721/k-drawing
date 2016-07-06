/**
 * @file 三角形，至少由三个点组成，支持多个
 *
 * 渲染模式：
 * 先假设有坐标位置 a, b, c, d 四个
 * TRIANGLES 默认，一系列单独的三角形，三角形为：(a,b, c) d被省略
 * TRIANGLES_STRIP  一系列模进使用顶点的三角形，三角形为：(a,b,c)、(b,c,d)
 * TRIANGLES_LOOP 一系列三角形，第一个点均为整体的第一个点，剩余模进，三角形为：(a,b,c)、(a,c,d)
 *
 * 作为基本元素，提供 rendererData 供渲染使用
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

export default class Triangles {

    type = 'triangles';

    /**
     * 渲染模式
     *
     * TRIANGLES | TRIANGLE_STRIP | TRIANGLE_FAN
     *
     * @type {RENDER_TYPE}
     */
    mode = RENDER_TYPE.TRIANGLES;

    /**
     * 顶点是有序的，实际上顶点序决定了渲染序，也就决定了三角形的正反面……
     * @type {Array.<helper.Vertex>}
     */
    vertices = [];

    constructor(options = {}) {
        this.id = options.id || `triangles-${util.guid()}`;
        this.color = Rgba.from(options.color || Rgba.WHITE);
        if (options.mode
            && [RENDER_TYPE.TRIANGLES, RENDER_TYPE.TRIANGLE_STRIP, RENDER_TYPE.TRIANGLE_FAN].includes(options.mode)
        ) {
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
                toAdd = Vertex.from(_.defaults(vertex, {color: this.color}));
            }
            this.vertices.push(toAdd);
            verticesData.add(toAdd);
        });
    }
}
