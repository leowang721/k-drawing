/**
 * @file 简单物体 —— 球体
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Base from './Base';
import Vertex from '../helper/Vertex';
import Face from '../element/Face';

export default class Ball extends Base {
    type = 'ball';
    constructor(options) {
        super(options);
    }

    initOptions() {
        this.r = this.options.r || 1;
        // 暂定，r为1，则u和v为100
        // this.uCount = this.r * 10;
        // this.vCount = this.r * 10;
        this.uCount = 80;
        this.vCount = 80;
    }

    initElements() {
        let ustep = 1 / this.uCount;
        let vstep = 1 / this.vCount;

        let elements = [];

        let u = 0;
        let v = 0;
        // 绘制下端三角形组
        let vertices = [];
        for (let i = 0; i < this.uCount; i++) {
            vertices.push(
                getPoint(0, 0, this.r),
                getPoint(u, vstep, this.r),
                getPoint(u + ustep, vstep, this.r)
            );
            elements.push(new Face({
                color: this.color,
                vertices: [
                    getPoint(0, 0, this.r),
                    getPoint(u, vstep, this.r),
                    getPoint(u + ustep, vstep, this.r)
                ]
            }));
            u += ustep;
        }
        // 绘制中间四边形组
        u = 0, v = vstep;
        for (let i = 1; i < this.vCount - 1; i++) {
            for (let j = 0; j < this.uCount; j++) {
                vertices.push(
                    getPoint(u, v, this.r),
                    getPoint(u + ustep, v, this.r),
                    getPoint(u + ustep, v + vstep, this.r),
                    getPoint(u, v + vstep, this.r)
                );
                u += ustep;
                elements.push(new Face({
                    color: this.color,
                    vertices: [
                        getPoint(u, v, this.r),
                        getPoint(u + ustep, v, this.r),
                        getPoint(u + ustep, v + vstep, this.r),
                        getPoint(u, v + vstep, this.r)
                    ]
                }));
            }
            v += vstep;
        }
        // 绘制下端三角形组
        u = 0;
        for (let i = 0; i < this.uCount; i++) {
            vertices.push(
                getPoint(0, 1, this.r),
                getPoint(u, 1 - vstep, this.r),
                getPoint(u + ustep, 1 - vstep, this.r)
            );
            elements.push(new Face({
                color: this.color,
                vertices: [
                    getPoint(0, 1, this.r),
                    getPoint(u, 1 - vstep, this.r),
                    getPoint(u + ustep, 1 - vstep, this.r)
                ]
            }));
        }

        // let lines = new Lines({
        //     mode: RENDER_TYPE.LINE_LOOP,
        //     color: this.color,
        //     vertices: vertices
        // });

        this.addElements(elements);
        this.addElements = () => {};
    }
}

function getPoint(u, v, r = 1) {
    let A = -2 * Math.PI * Math.PI * r * r * Math.sin(Math.PI * v);
    let x = Math.sin(Math.PI * v) * Math.cos(Math.PI * 2 * u);
    let y = Math.sin(Math.PI * v) * Math.sin(Math.PI * 2 * u);
    let z = Math.cos(Math.PI * v);
    return {
        coord: [
            x * r,
            y * r,
            z * r
        ],
        normal: [
            A * x,
            A * y,
            A * z
        ]
    };
}
