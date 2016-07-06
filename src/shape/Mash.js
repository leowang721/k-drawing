/**
 * @file 网格
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import Base from './Base';
import Lines from '../element/Lines';
import Vertex from '../helper/Vertex';

export default class Mash extends Base {

    type = 'mesh';

    constructor(options = {}) {
        super(options);
    }

    initOptions() {
        this.unitDistance = this.options.unitDistance || 1;
        this.width = this.options.width;
        this.height = this.options.height;
        this.depth = this.options.depth;
        this.color = this.options.color || [0.8, 0.8, 0.8];
        this.deepenedColor = this.options.deepenedColor || [0.6, 0.6, 0.6];
    }

    initElements() {
        let vertices = [];
        let xnum = this.width / 2 / this.unitDistance;
        let znum = this.depth / 2 / this.unitDistance;

        for (let i = 0; i < xnum; i++) {
            let toUseColor = i % 10 === 0 ? this.deepenedColor : this.color;
            vertices.push(
                new Vertex({
                    coord: [i * this.unitDistance, 0, -znum * this.unitDistance],
                    color: toUseColor
                }),
                new Vertex({
                    coord: [i * this.unitDistance, 0, znum * this.unitDistance],
                    color: toUseColor
                })
            );
            if (i > 0) {
                vertices.push(
                    new Vertex({
                        coord: [-i * this.unitDistance, 0, -znum * this.unitDistance],
                        color: toUseColor
                    }),
                    new Vertex({
                        coord: [-i * this.unitDistance, 0, znum * this.unitDistance],
                        color: toUseColor
                    })
                );
            }
        }

        for (let i = 0; i < znum; i++) {
            let toUseColor = i % 10 === 0 ? this.deepenedColor : this.color;
            vertices.push(
                new Vertex({
                    coord: [-xnum * this.unitDistance, 0, i * this.unitDistance],
                    color: toUseColor
                }),
                new Vertex({
                    coord: [xnum * this.unitDistance, 0, i * this.unitDistance],
                    color: toUseColor
                })
            );
            if (i > 0) {
                vertices.push(
                    new Vertex({
                        coord: [-xnum * this.unitDistance, 0, -i * this.unitDistance],
                        color: toUseColor
                    }),
                    new Vertex({
                        coord: [xnum * this.unitDistance, 0, -i * this.unitDistance],
                        color: toUseColor
                    })
                );
            }
        }

        this.lines = new Lines({
            color: this.color,
            vertices: vertices
        });
        this.addElements(this.lines);
        // 清理此API
        this.addElements = () => {};
    }
}
