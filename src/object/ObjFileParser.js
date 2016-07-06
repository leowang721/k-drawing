/**
 * @file .obj 文件解析器
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget, Promise} from 'k-core';
import ObjShape from './ObjShape';
import Face from '../element/Face';
import MtlFileParser from './MtlFileParser';
import loader from './loader';

export default class ObjFileParser extends EventTarget {
    constructor(url) {
        super();
        if (!url) {
            throw new Error('no url for ObjFileParser!');
        }
        this.url = url;
        this.objects = [];
        this.material = null;
    }

    parse() {
        return this.load().then(data => {
            return this.parseObjData(data);
        });
    }

    load() {
        return loader.load(this.url);
    }

    parseObjData(data) {
        let lines = data.split('\n');

        // 过滤一次再处理吧
        let result = [];
        for (let i = 0, j = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            // 检查是否需要跳过
            if (line.length === 0 || line[0] === '#') {
                continue;
            }
            result[j] = result[j] || '';
            result[j] += line;
            // 检查是否需要合并
            if (line[line.length - 1] !== '\\') {
                j++;
            }
            // 获取material
            let parseResult = this.parseLine(line);
            if (parseResult.command === 'mtllib') {
                this.materialLib = parseResult.data;
            }
        }

        if (this.materialLib) {
            return new Promise((resolve, reject) => {
                let url = this.url;
                if (url.lastIndexOf('/') !== '-1') {
                    url = url.substring(0, url.lastIndexOf('/')) + '/' + this.materialLib;
                }
                else {
                    url = this.materialLib;
                }
                let mtlFileParser = new MtlFileParser(url);
                mtlFileParser.parse().then(material => {
                    this.material = material;
                    return this.doProcessObjLines(result);
                }).then(resolve).catch(reject);
            });
        }
        return this.doProcessObjLines(result);
    }

    doProcessObjLines(lines) {
        let shapes = [];
        let currentShape = null;
        let currentMaterial = null;
        let info = {
            v: [],
            vt: [],
            vn: []
        };

        // 开始处理
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let parseResult = this.parseLine(line);
            switch (parseResult.command) {
                case 'mtllib':
                    break;
                case 'o':  // 对象名称(Object name)
                case 'g':  // 组名称(Group name)
                    currentShape = new ObjShape({
                        id: parseResult.data,
                        material: this.material
                    });
                    shapes.push(currentShape);
                case 's':  // 光滑组(Smoothing group)
                case 'mg':  // 合并组(Merging group)
                    break;
                case 'v':  // vertices
                case 'vt':   // textures
                case 'vn':  // normals
                    if (!currentShape) {
                        currentShape = new ObjShape({
                            id: 'default',
                            material: this.material
                        });
                        shapes.push(currentShape);
                    }
                    info[parseResult.command].push(parseResult.data.split(' ').map(v => parseFloat(v)));
                    break;
                case 'f':  // faces
                    let faceData = this.parseFace(parseResult.data);
                    let fv = [];
                    faceData.forEach(point => {
                        let toAdd = {
                            coord: info.v[+point.coord],
                            texture: info.vt[+point.texture]
                        };

                        if (info.vt[+point.texture]) {
                            // currentShape.flag.texture = true;
                        }

                        if (info.vn[+point.normal]) {
                            toAdd.normal = info.vn[+point.normal];
                        }

                        if (currentMaterial) {
                            // 填充颜色先用Kd试试
                            toAdd.color = currentMaterial.Kd;
                        }

                        fv.push(toAdd);
                    });
                    let face = new Face({
                        vertices: fv,
                        color: currentMaterial ? currentMaterial.Kd : [0.7, 0.7, 0.7]
                    });
                    currentShape.addElements(face);

                    break;
                case 'usemtl':
                    currentMaterial = this.material.get(parseResult.data);
                    break;
            }
        }

        return shapes;
    }

    parseLine(line) {
        let pos = line.indexOf(' ');
        return {
            command: line.substring(0, pos),
            data: line.substring(pos + 1)
        };
    }

    parseFace(str) {
        let points = str.split(' ');
        return points.map(point => {
            let data = point.split('/');
            return {
                coord: data[0] - 1,
                texture: data[1] - 1,
                normal: data[2] - 1
            };
        });
    }
}
