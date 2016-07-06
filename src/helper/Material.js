/**
 * @file 材质库信息，本身 .mtl 支持多个的，本类的实例对应一个
 * 信息包含：
 *     环境反射(Ka) rgb|rfl文件|CIEXYZ
 *     漫反射(Kd) rgb|rfl文件|CIEXYZ
 *     镜反射(Ks) rgb|rfl文件|CIEXYZ
 *     滤光透射率(Tf) rgb|rfl文件|CIEXYZ
 *     光照模型(illum) illum_#0~10
 *         光照模型属性
 *         0 Color on and Ambient off
 *         1 Color on and Ambient on
 *         2 Highlight on
 *         3 Reflection on and Ray trace on
 *         4 Transparency: Glass on
 *           Reflection: Ray trace on
 *         5 Reflection: Fresnel on and Ray trace on
 *         6 Transparency: Refraction on
 *           Reflection: Fresnel off and Ray trace on
 *         7 Transparency: Refraction on
 *           Reflection: Fresnel on and Ray trace on
 *         8 Reflection on and Ray trace off
 *         9 Transparency: Glass on
 *           Reflection: Ray trace off
 *         10 Casts shadows onto invisible surfaces
 *     渐隐指数(d) factor 0.0~1.0 透明度
 *         d -halo factor 受影响的渐隐 例如，对于一个定义为 d -halo 0.0的球体，在它的中心是完全消隐的，而在表面边界处将逐渐变得不透明。
 *         factor表示应用在材质上的渐隐率的最小值。而材质上具体的渐隐率将在这个最小值到1.0之间取值
 *         dissolve = 1.0 - (N*v)(1.0-factor)
 *     反射指数(Ns) exponent 值越高则高光越密集，一般取值范围在0~1000 反射高光度
 *     清晰度(Sharpness) value 指定本地反射贴图的清晰度。
 *         如果材质中没有本地反射贴图定义，则将此值应用到预览中的全局反射贴图上。
 *         value可在0~1000中取值，默认60。值越高则越清晰
 *     折射值(Ni) ptical density 指定材质表面的光密度，即折射值
 *         ptical density是光密度值，可在0.001到10之间进行取值。
 *         若取值为1.0，光在通过物体的时候不发生弯曲。玻璃的折射率为1.5。
 *         取值小于1.0的时候可能会产生奇怪的结果，不推荐
 *     纹理映射(map_材质参数)，指定文件
 *         纹理映射可以对映射的相应材质参数进行修改，这个修改只是对原有存在的参数进行叠加修改，而不是替换原有参数
 *         从而纹理映射在物体表面的表现上有很好的灵活性
 *         纹理映射只可以改变以下材质参数：
 *             - Ka (color)  环境反射指定纹理文件
 *             - Kd (color)  漫反射指定纹理文件
 *             - Ks (color)  镜反射指定纹理文件
 *             - Ns (scalar)  镜面反射指定标量纹理文件
 *             - d (scalar)  消隐指数指定标量纹理文件
 *         除了以上参数，表面法线也可以更改。
 *         纹理文件类型可以是以下几种：
 *             1.纹理映射文件
 *                 .mpc：颜色纹理文件color texture files ——可改变Ka，Kd，Ks的值
 *                 .mps：标量纹理文件scalar texture files——可改变Ns，d，decal的值
 *                 .mpb：凹凸纹理文件bump texture files——可改变面法线
 *             2.程序纹理文件：
 *                 程序纹理文件是用数学公式来计算纹理的样本值。有以下几种格式：
 *                 .cxc, .cxs, .cxb
 *         另外还支持：
 *             - map_aat on 打开纹理反走样功能
 *             - decal 指定一个标量纹理文件或程序纹理文件用于选择性地将材质的颜色替换为纹理的颜色。可选参数同map_Ns
 *             - disp 指定一个标量纹理文件或程序纹理文件实现物体变形或产生表面粗糙。可选参数同map_Ns
 *             - bump 指定凹凸纹理文件（.mpb或.cxb）,或是一个位图文件
 *
 *     反射贴图
 *         refl -type sphere -options -args filename
 *             指定一个球体区域将指定的纹理反射映射至物体。filename为一个颜色纹理文件，或可以映射的位图
 *         refl -type cube_side -options -args filenames
 *             指定一个立方体区域将指定的纹理反射映射至物体
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {util, Promise} from 'k-core';
import Texture from './Texture';

export default class Material {
    constructor(options = {}) {
        this.id = options.id || ('material-' + util.guid());
        this.url = options.url;
        this._map = new Map();
        this.textures = new Map();
    }

    add(name) {
        this._map.set(name, {});
    }

    setData(name, data) {
        let current = this._map.get(name) || {};
        this._map.set(name, Object.assign({}, current, data));
    }

    get(name) {
        return this._map.get(name);
    }

    adjust() {
        let promises = [];
        let textureCount = 0;
        for (let eachMaterial of this._map.values()) {
            if (typeof eachMaterial.Ka === 'string') {  // 环境
                eachMaterial.Ka = eachMaterial.Ka.split(' ').map(v => parseFloat(v));
            }
            if (typeof eachMaterial.Kd === 'string') {  // 漫
                eachMaterial.Kd = eachMaterial.Kd.split(' ').map(v => parseFloat(v));
            }
            if (typeof eachMaterial.Ks === 'string') {  // 镜
                eachMaterial.Ks = eachMaterial.Ks.split(' ').map(v => parseFloat(v));
            }

            let url = this.url;
            if (url.lastIndexOf('/') !== '-1') {
                url = url.substring(0, url.lastIndexOf('/')) + '/';
            }
            else {
                url = '';
            }

            typeof eachMaterial.Ni === 'string' && (eachMaterial.Ni = +eachMaterial.Ni);  // 折射值
            typeof eachMaterial.Ns === 'string' && (eachMaterial.Ns = +eachMaterial.Ns);  // 反射指数
            typeof eachMaterial.d === 'string' && (eachMaterial.d = +eachMaterial.d);  // 渐隐指数
            typeof eachMaterial.illum === 'string' && (eachMaterial.illum = +eachMaterial.illum);  // 光照模型

            if (typeof eachMaterial.map_Kd === 'string') {
                eachMaterial.map_Kd = url + eachMaterial.map_Kd;
                eachMaterial.texture_Kd = new Texture({
                    url: eachMaterial.map_Kd,
                    index: textureCount++
                });

                if (!this.textures.get(eachMaterial.map_Kd)) {
                    this.textures.set(eachMaterial.map_Kd, eachMaterial.texture_Kd);
                }
                promises.push(eachMaterial.texture_Kd.load());
            }
            if (typeof eachMaterial.map_d === 'string') {
                eachMaterial.map_d = url + eachMaterial.map_d;
                eachMaterial.texture_d = new Texture({
                    url: eachMaterial.map_d,
                    index: textureCount++
                });

                if (!this.textures.get(eachMaterial.map_d)) {
                    this.textures.set(eachMaterial.map_d, eachMaterial.texture_d);
                }
                promises.push(eachMaterial.texture_d.load());
            }
        }

        return Promise.all(promises).then(() => this);
    }
}
