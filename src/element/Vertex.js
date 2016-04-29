/**
 * @file 顶点类
 * 最重要的基础元素，本身包括以下信息：
 * 1. coord {Coordinate} 位置，在视图界面的坐标，左上角为(0, 0)，右下角为(width, height)
 * 2. color {Rgba} 颜色，可选，优先级低于 texture 纹理
 * 3. texture {Vec2} 纹理坐标，基于纹理坐标系（st），左上角为(0,1)，右下角为（1，0)，此坐标范围不因图像大小而改变
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Vec4 from '../helper/math/Vec4';
import Coordinate from '../helper/Coordinate';
import TextureCoord from '../helper/TextureCoord';
import Rgba from '../helper/Rgba';

export default class Vertex {

    // 提供一个 factory
    static create(options) {
        return new Vertex(options);
    }

    // 从其他对象之类的数据转换为一个Vertex实例
    static from(target) {
        if (target instanceof Vertex) {
            return target;
        }
        return Vertex.create({
            coord: target.coord,
            color: target.color,
            texture: target.texture
        });
    }

    static equals(a, b) {
        return (
            Vec4.equals(a.coord, b.coord) && TextureCoord.equals(a.texture, b.texture) && Vec4.equals(a.color, b.color)
        );
    }

    /**
     * 构造函数
     *
     * @param {Object} options = {} 配置
     * @param {helper.Coordinate | Object | Array.<number>} coord 坐标
     * @param {helper.Rgba | Object | Array.<number>} color 颜色
     * @param {Array.<helper.TextureCoord | Object | Array.<number>>} texture 纹理坐标
     */
    constructor(options = {}) {
        this.coord = Coordinate.from(options.coord);
        this.color = Rgba.from(options.color || Rgba.BLACK);
        this.texture = [].concat(options.texture || []).map(item => TextureCoord.from(item));
    }

    equals(other) {
        return Vertex.equals(this, other);
    }

    getId() {
        return [
            this.coord.getId(),
            this.texture ? this.texture.map(eachT => eachT.getId()) : '',
            this.color.getId()
        ].join('-');
    }

    getValue() {
        return {
            coord: this.coord.getValue(),
            color: this.color.getValue(),
            texture: this.texture.getValue()
        };
    }
}
