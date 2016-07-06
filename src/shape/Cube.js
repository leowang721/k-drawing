/**
 * @file 简单物体 —— 立方体
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Base from './Base';
import Vertex from '../helper/Vertex';
import Face from '../element/Face';
import {RENDER_TYPE} from '../config/type';

export default class Cube extends Base {
    type = 'cube';
    constructor(options) {
        super(options);
    }

    initOptions() {
        this.length = this.options.length || 1;
        this.width = this.options.width || 1;
        this.height = this.options.height || 1;
        this.color = this.options.color;  // reset

        // length: left, right, center
        // height: top, bottom, middle
        // width: near, far, among
        // 默认是正中间作为位置点（旋转基点）
        // 顺序不重要
        this.rotatePos = this.options.rotatePos || ['center', 'middle', 'among'];
        if (typeof this.rotatePos === 'string') {
            // 支持: 'center/middle/among'  顺序不重要
            if (this.rotatePos.indexOf('/') > -1) {
                this.rotatePos = this.rotatePos.split('/');
            }
            // 支持: 'cma'  顺序不重要
            else {
                this.rotatePos = this.rotatePos.split('');
            }
        }
    }

    initElements() {
        // 都是用本地坐标系的位置
        // [0, 0, 0]永远是旋转基点
        // 计算range
        // length: left, right, center
        // height: top, bottom, middle
        // width: near, far, among
        let left;
        let right;
        let bottom;
        let top;
        let near;
        let far;
        this.rotatePos.forEach(pv => {
            switch (pv) {
                case 'left':
                case 'l':
                    left = 0;
                    right = this.length;
                    break;
                case 'center':
                case 'c':
                    left = -this.length / 2;
                    right = this.length / 2;
                    break;
                case 'right':
                case 'r':
                    left = -this.length;
                    right = 0;
                    break;
                case 'top':
                case 't':
                    top = 0;
                    bottom = -this.height;
                    break;
                case 'middle':
                case 'm':
                    top = this.height / 2;
                    bottom = -this.height / 2;
                    break;
                case 'bottom':
                case 'b':
                    top = this.height;
                    bottom = 0;
                    break;
                case 'near':
                case 'n':
                    near = 0;
                    far = -this.width;
                    break;
                case 'among':
                case 'a':
                    near = this.width / 2;
                    far = -this.width / 2;
                    break;
                case 'far':
                case 'f':
                    near = this.width;
                    far = 0;
                    break;
            }
        });

        // 依次增加六个面
        let frontFace = new Face({
            mode: RENDER_TYPE.TRIANGLE_STRIP,
            vertices: [
                new Vertex({
                    coord: [right, top, near],
                    color: this.color.front || this.color,
                    normal: [0, 0, 1]
                }),
                new Vertex({
                    coord: [left, top, near],
                    color: this.color.front || this.color,
                    normal: [0, 0, 1]
                }),
                new Vertex({
                    coord: [left, bottom, near],
                    color: this.color.front || this.color,
                    normal: [0, 0, 1]
                }),
                new Vertex({
                    coord: [right, bottom, near],
                    color: this.color.front || this.color,
                    normal: [0, 0, 1]
                })
            ]
        });
        let rightFace = new Face({
            mode: RENDER_TYPE.TRIANGLE_STRIP,
            color: this.color,
            vertices: [
                new Vertex({
                    coord: [right, top, near],
                    color: this.color.right || this.color,
                    normal: [1, 0, 0]
                }),
                new Vertex({
                    coord: [right, bottom, near],
                    color: this.color.right || this.color,
                    normal: [1, 0, 0]
                }),
                new Vertex({
                    coord: [right, bottom, far],
                    color: this.color.right || this.color,
                    normal: [1, 0, 0]
                }),
                new Vertex({
                    coord: [right, top, far],
                    color: this.color.right || this.color,
                    normal: [1, 0, 0]
                })
            ]
        });

        let topFace = new Face({
            mode: RENDER_TYPE.TRIANGLE_STRIP,
            color: this.color,
            vertices: [
                new Vertex({
                    coord: [right, top, near],
                    color: this.color.top || this.color,
                    normal: [0, 1, 0]
                }),
                new Vertex({
                    coord: [right, top, far],
                    color: this.color.top || this.color,
                    normal: [0, 1, 0]
                }),
                new Vertex({
                    coord: [left, top, far],
                    color: this.color.top || this.color,
                    normal: [0, 1, 0]
                }),
                new Vertex({
                    coord: [left, top, near],
                    color: this.color.top || this.color,
                    normal: [0, 1, 0]
                })
            ]
        });

        let leftFace = new Face({
            mode: RENDER_TYPE.TRIANGLE_STRIP,
            color: this.color,
            vertices: [
                new Vertex({
                    coord: [left, bottom, far],
                    color: this.color.left || this.color,
                    normal: [-1, 0, 0]
                }),
                new Vertex({
                    coord: [left, top, far],
                    color: this.color.left || this.color,
                    normal: [-1, 0, 0]
                }),
                new Vertex({
                    coord: [left, top, near],
                    color: this.color.left || this.color,
                    normal: [-1, 0, 0]
                }),
                new Vertex({
                    coord: [left, bottom, near],
                    color: this.color.left || this.color,
                    normal: [-1, 0, 0]
                })
            ]
        });

        let backFace = new Face({
            mode: RENDER_TYPE.TRIANGLE_STRIP,
            color: this.color,
            vertices: [
                new Vertex({
                    coord: [left, bottom, far],
                    color: this.color.back || this.color,
                    normal: [0, 0, -1]
                }),
                new Vertex({
                    coord: [right, bottom, far],
                    color: this.color.back || this.color,
                    normal: [0, 0, -1]
                }),
                new Vertex({
                    coord: [right, top, far],
                    color: this.color.back || this.color,
                    normal: [0, 0, -1]
                }),
                new Vertex({
                    coord: [left, top, far],
                    color: this.color.back || this.color,
                    normal: [0, 0, -1]
                })
            ]
        });

        let bottomFace = new Face({
            mode: RENDER_TYPE.TRIANGLE_STRIP,
            color: this.color,
            vertices: [
                new Vertex({
                    coord: [left, bottom, far],
                    color: this.color.bottom || this.color,
                    normal: [0, -1, 0]
                }),
                new Vertex({
                    coord: [left, bottom, near],
                    color: this.color.bottom || this.color,
                    normal: [0, -1, 0]
                }),
                new Vertex({
                    coord: [right, bottom, near],
                    color: this.color.bottom || this.color,
                    normal: [0, -1, 0]
                }),
                new Vertex({
                    coord: [right, bottom, far],
                    color: this.color.bottom || this.color,
                    normal: [0, -1, 0]
                })
            ]
        });

        this.addElements([frontFace, rightFace, topFace, backFace, leftFace, bottomFace]);
        this.addElements = () => {};
    }
}
