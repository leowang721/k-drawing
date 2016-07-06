/**
 * @file gl 渲染用顶点相关数据
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import Vertex from './Vertex';

class VerticesData {
    /** 顶点相关 **/
    indexMap = new Map();  // 保存顶点的索引信息
    vertexReference = new Map();
    data = [];
    normals = [];

    offset = Vertex.offset;

    step = Vertex.step;

    add(vertices) {
        if (!vertices) {
            return;
        }
        [].concat(vertices).forEach((v, index) => {
            let vid = v.getId();
            let refs = this.vertexReference.get(vid);
            if (refs !== undefined) {
                this.vertexReference.set(vid, refs + 1);
            }
            else {
                this.indexMap.set(vid, this.data.length / Vertex.step);
                this.vertexReference.set(vid, 1);
                this.data.push(...v.getValue());
            }
        });
    }

    getIndicesByVertices(vertices) {
        if (!vertices) {
            return;
        }
        let indices = [];
        [].concat(vertices).forEach(v => {
            let vid = v.getId();
            let index = this.indexMap.get(vid);
            if (index === undefined) {
                this.add(v);
                index = this.indexMap.get(vid);
            }
            indices.push(index);
        });

        return indices;
    }

    dump() {
        let result = {
            data: new Float32Array(this.data),
            step: this.step,
            offset: _.clone(this.offset)
        };

        return result;
    }
}

export default new VerticesData();
