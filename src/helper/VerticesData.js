/**
 * @file gl 渲染用顶点相关数据类
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {mat4} from '../dep/gl-matrix-min';

export default class VerticesData {

    /** 顶点相关 **/

    // 顶点坐标数据
    vertexCoords  = [];
    // 顶点索引数据
    vertexIndices = [];
    // 模型矩阵
    modelMatrix = mat4.identity(mat4.create());

    /** 颜色相关 **/

    // 顶点颜色数据
    colors = [];
    // 纹理坐标数据信息
    textureCoords = new Map();

    // 步进距离，即顶点坐标数据每份的个数
    step = {
        vertex: 3,
        color: 4,
        texture: 2
    };

    // 记录所有的顶点对应的索引数据，以其id为key，避免重复
    indexMap = new Map();

    constructor() {}

    /**
     * 添加顶点，只能加，不能减，减没啥意义
     * vertices记录坐标数据，如果坐标数据相同但是颜色不同的顶点被添加，会push一份相同的坐标数据进去
     * 这是因为顶点着色器进行逐顶点的计算，如果想指定不同的表面颜色（有共同点），需要定义成不同的颜色
     * 所以必须要把相同坐标的顶点分开处理，看成新的顶点去跟颜色对应
     *
     * @param {Array.<element.Vertex> | element.Vertex} vertices 顶点
     */
    addVertices(vertices = []) {
        vertices = [].concat(vertices);
        vertices.forEach(vertex => {
            // 只记录3D坐标
            let coord = vertex.coord.getValue();
            let id = vertex.getId();  // 使用 id 作为标志，意味着允许重复坐标的顶点，但是其颜色或纹理坐标不同
            let index = this.indexMap[id];
            if (index === undefined) {  // 没有加过，才添加，否则就有重复点了
                // 处理顶点坐标数据
                this.vertexCoords.push(...coord);
                // 记录索引数据
                index = {
                    value: this.vertexCoords.length / this.step.vertex - 1,
                    quote: 0
                };
                // 增加这条索引的map记录
                this.indexMap[id] = index;

                // 引用+1
                index.quote++;
                // 增加新的一条索引
                this.vertexIndices.push(index.value);
                // 增加新的颜色索引
                this.colors.push(...vertex.color.getValue());
                // 纹理
                if (vertex.texture.length > 0) {
                    // 可能有多幅纹理
                    vertex.texture.forEach(eachTexture => {
                        let oldValue = this.textureCoords.get(eachTexture.index) || [];
                        this.textureCoords.set(eachTexture.index, oldValue.concat(eachTexture.getValue()));
                    });
                }
            }
        });
        // 校验，多幅纹理，如果length不一致，直接抛异常
        for (let eachCoords of this.textureCoords.values()) {
            if (eachCoords.length / 2 !== this.vertexIndices.length) {
                throw new Error('错误，多幅纹理但是数据长度不一致！');
            }
        }
    }

    setModelMatrix(v) {
        this.modelMatrix = v;
    }

    dumpForRenderer() {
        return {
            step: this.step,
            vertexCoords: new Float32Array(this.vertexCoords),
            colors: new Float32Array(this.colors),
            vertexIndices: this.vertexIndices.length > 256
                ? new Uint16Array(this.vertexIndices)
                : new Uint8Array(this.vertexIndices),
            textureCoords: new Map([...this.textureCoords].map(item => {
                item[1] = new Float32Array(item[1]);
                return item;
            })),
            modelMatrix: this.modelMatrix
        };
    }
}
