/**
 * @file 顶点类
 * 最重要的基础元素，本身包括以下信息：
 * 1. coord {Coordinate} 坐标
 * 2. color {Rgba} 颜色
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Vec4 from '../helper/math/Vec4';
import Coordinate from '../helper/Coordinate';
import Rgba from '../helper/Rgba';

export default class Vertex {

    static step = 13;
    static offset = {
        coord: 0,
        size: 3,
        color: 4,
        normal: 8,
        texture: 10
    };

    // 提供一个 factory
    static create(options) {
        return new Vertex(options);
    }

    // 从其他对象之类的数据转换为一个Vertex实例
    static from(target) {
        if (target instanceof Vertex || !target) {
            return target;
        }
        return Vertex.create({
            coord: target.coord,
            color: target.color,
            size: target.size,
            normal: target.normal,
            texture: target.texture
        });
    }

    static equals(a, b) {
        return (
            Vec4.equals(a.coord, b.coord)
            && Vec4.equals(a.color, b.color)
            && a.size === b.size
            && a.normal.join(',') === b.normal.join(',')
            && a.texture.join(',') === b.texture.join(',')
        );
    }

    /**
     * 构造函数
     *
     * @param {Object} options = {} 配置
     * @param {helper.Coordinate | Object | Array.<number>} coord 坐标
     * @param {helper.Rgba | Object | Array.<number>} color 颜色
     */
    constructor(options = {}) {
        this.coord = Coordinate.from(options.coord);
        this.color = Rgba.from(options.color);
        this.size = options.size || 1;
        this.normal = options.normal || [1, 1, 1];
        this.texture = options.texture || [-1, -1];
    }

    equals(other) {
        return Vertex.equals(this, other);
    }

    getId() {
        return [
            this.coord.getId(),
            this.size,
            this.color.getId(),
            this.normal.join(','),
            this.texture.join(',')
        ].join('-');
    }

    getValue() {
        // 固定序，所以就不指定了
        // 一定是 coord, size, color 这个顺序
        return [].concat(
            this.coord.getValue(),
            this.size,
            this.color.getValue(),
            this.normal,
            this.texture
        );
    }
}
