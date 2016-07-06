/**
 * @file 形状 —— 多边形
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Base from './Base';
import Triangles from '../element/Triangles';
import {RENDER_TYPE} from '../config/type';

export default class Polygon extends Base {

    type = 'polygon';

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
        this.triangles = new Triangles({
            color: this.color,
            vertices: this.options.vertices,
            mode: RENDER_TYPE.TRIANGLE_FAN
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
