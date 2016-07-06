/**
 * @file 灯光
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import {vec3} from './dep/gl-matrix-min';

export default class Light extends EventTarget {

    values = [];

    constructor(options = {}) {
        super();
        this.color = vec3.fromValues(...(options.color || [1.0, 1.0, 1.0]));
        this.ambientColor = vec3.fromValues(...(options.ambientColor || [0.2, 0.2, 0.2]));
        this.direction = vec3.fromValues(...(options.direction || [0, 0, 1]));
        // 归一化
        vec3.normalize(this.direction, this.direction);
    }

    calculateColors(normals, colors) {
        let result = [];
        // 根据每个法线、以及当前的颜色、角度，计算欲与颜色的alpha结合的vec3
        normals.forEach((normal, index) => {
            // normal = vec3.fromValues(...normal);  // 转为vec3
            // vec3.normalize(normal, normal);  // 归一化
            let cosA = Math.max(vec3.dot(this.direction, normal), 0);  // 点积
            let color = colors.slice(index * 4, index * 4 + 4);
            let touse = vec3.create();
            vec3.multiply(touse, this.color, vec3.fromValues(...color));
            // 乘以 cosA
            vec3.scale(touse, touse, cosA);

            let ambient = vec3.create();
            vec3.multiply(ambient, this.ambientColor, color.slice(0, 3));
            result.push(...vec3.add(touse, touse, ambient), color[3]);
        });

        return new Float32Array(result);
    }

}
