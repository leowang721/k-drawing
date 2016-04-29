/**
 * @file 简单纹理
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {Promise} from 'k-core';

export default class Texture {
    constructor(options = {}) {
        this.url = options.url;
        this.coords = options.coords;
        this.loaded = false;
    }

    load() {
        return new Promise((resolve, reject) => {
            if (this.loaded) {
                resolve();
            }
            else {
                this.image = new Image();
                this.image.onload = () => resolve();
                this.image.onerror = e => reject(e);
                this.image.src = this.url;
                this.loaded = true;
            }
        });
    }

    processWith(gl, program) {
        let texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // y轴反射
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.image);
        return this.image;
    }

}
