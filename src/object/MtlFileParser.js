/**
 * @file .mtl file loader and parser
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';
import Material from '../helper/Material';
import loader from './loader';

export default class MtlFileParser extends EventTarget {
    constructor(url) {
        super();
        if (!url) {
            throw new Error('no url for MtlFileParser!');
        }
        this.url = url;
        this.material = new Material({
            url: this.url
        });
    }

    parse() {
        return this.load().then(data => {
            return this.parseMtlData(data);
        });
    }

    load() {
        return loader.load(this.url);
    }

    parseMtlData(data) {
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
        }

        let current = null;

        // 开始处理
        for (let i = 0; i < result.length; i++) {
            let line = result[i];
            let parseResult = this.parseLine(line);
            switch (parseResult.command) {
                case 'newmtl':
                    current = parseResult.data;  // name
                    this.material.add(current);
                    break;
                default:
                    this.material.setData(current, {
                        [parseResult.command]: parseResult.data
                    });
            }
        }

        return this.material.adjust();
    }

    parseLine(line) {
        let pos = line.indexOf(' ');
        return {
            command: line.substring(0, pos),
            data: line.substring(pos + 1)
        };
    }

 }
