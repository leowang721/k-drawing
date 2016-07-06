/**
 * @file 形状：三角形，一共有三种类型，根据 triangle 的 mode 来对应
 *
 * 先假设有坐标位置 a, b, c, d 四个
 * TRIANGLES 默认，一系列单独的三角形，三角形为：(a,b, c) d被省略
 * TRIANGLE_STRIP  一系列模进使用顶点的三角形，三角形为：(a,b,c)、(b,c,d)
 * TRIANGLE_FAN 一系列三角形，第一个点均为整体的第一个点，剩余模进，三角形为：(a,b,c)、(a,c,d)
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Base from './Base';
import ElementTriangles from '../element/Triangles';

export default class Triangles extends Base {

    type = 'triangles';

    constructor(options = {}) {
        super(options);
    }

    initOptions() {
        // 材质库中包含
        // 材质的漫射(diffuse)，环境(ambient)，光泽(specular)的RGB(红绿蓝)的定义值
        // 以及反射(specularity)，折射(refraction)，透明度(transparency)等其它特征
        // 包括纹理文件……
        // 更具体的参看 Material
        this.material = this.options.material || {};
        // 纹理
        this.textures = this.options.textures;
    }

    initElements() {
        this.triangles = new ElementTriangles({
            color: this.color,
            vertices: this.options.vertices,
            mode: this.options.mode
        });
        this.addElements(this.triangles);
        // 清理此API
        this.addElements = () => {};
    }

    /**
     * 添加点
     *
     * @param {Array.<Vertex> | Array.<Array.<number>> | Vertex | Array.<number>} vertices 点信息
     */
    addVertices(vertices = []) {
        this.triangles.addVertices(vertices);
        this.fire('change');
    }
}
