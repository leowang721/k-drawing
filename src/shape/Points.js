/**
 * @file 形状：点集，基础类，只有一个点集
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Base from './Base';
import PointsElement from '../element/Points';

export default class Points extends Base {

    type = 'points';

    constructor(options = {}) {
        super(options);
    }

    initOptions() {
        this.size = this.options.size || 1.0;  // 大小

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
        this.points = new PointsElement({
            color: this.color,
            size: this.size,
            vertices: this.options.vertices
        });
        this.addElements(this.points);
        // 清理此API
        this.addElements = () => {};
    }

    /**
     * 添加点
     *
     * @param {Array.<Vertex> | Array.<Array.<number>> | Vertex | Array.<number>} vertices 点信息
     */
    add(vertices = []) {
        this.points.addVertices(vertices);
        this.fire('change');
    }

    updateVariableSetData() {
        // this.variableSet.setData('a_PointSize', new Float32Array(this.points.sizes));
    }
}
