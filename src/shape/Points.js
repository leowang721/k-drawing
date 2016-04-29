/**
 * @file 形状：点
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';
import {VAR_TYPE} from '../config/type';
import Shape from './Shape';
import Attribute from '../variable/Attribute';
import Vertex from '../element/Vertex';

export default class Points extends Shape {

    type = 'POINTS';
    mode = 'POINTS';
    program = 'point';

    constructor(options = {}) {
        super(options);
    }

    initOptions() {
        this.size = this.options.size || 1.0;  // 大小
        this.points = this.options.points || [];
    }

    initVariables() {
        super.initVariables();
        this.addAttribute(new Attribute({
            name: 'a_PointSize',
            glType: VAR_TYPE.FLOAT,
            glName: 'gl_PointSize',
            value: 'size'
        }));
    }

    initElements() {
        this.addPoints(this.points);
    }

    addPoints(points) {
        [].concat(points).forEach(point => {
            this.addVertices(
                Vertex.from(_.extend({
                    color: this.color
                }, point))
            );
            this.rendererData.addAttribute(
                this.variableSet.vertex.get('a_PointSize'),
                point.size
            );
        });
        this.calculatePosition();
    }
}
