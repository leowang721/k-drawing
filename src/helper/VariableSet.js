/**
 * @file gl中使用的变量集类
 * 变量集的特点是：不允许重名
 * 主要作用是提供给Element、Shape、Scene至两种Shader使用来存储聚合产出的去重变量的信息，最终用于生成Program
 * 如果是在Element中，因为聚合的是变量信息，所以理论上是不存在重复的，在这里可以作为Element的执行使用
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import _ from 'lodash';

export default class VariableSet {
    constructor(...vars) {
        this._data = {
            attribute: new Set(),
            uniform: new Set(),
            varying: new Set()
        };

        this._map = new Map();

        vars.forEach(eachVar => {
            this.add(eachVar);
        });
    }

    forEach(iterator) {
        return this._map.forEach(iterator);
    }

    dump() {
        return _.mapValues(this._data, value => [...value].map(item => this._map.get(item)));
    }

    dumpToCheck() {
        return new Map([...this._map].map(value => {
            value[1] = 0;
            return value;
        }));
    }

    getExecution() {
        return this._map;
    }

    get(key) {
        return this._map.get(key);
    }

    add(newValue) {
        if (!newValue || !newValue.type || !this._data[newValue.type]) {
            throw new Error('invalid arguments when trying to add new value to VariableSet');
        }
        this._data[newValue.type].add(newValue.name);
        if (!this._map.has(newValue.name)) {
            this._map.set(newValue.name, newValue);
        }
    }
    remove(target) {
        if (typeof target !== 'string') {
            target = target.name;
        }
        if (this._map.has(target)) {
            let type = this._map.get(target).type;
            this._data[type].delete(target);
            this._map.delete(target);
        }
    }
    clear() {
        this._map.clear();
        this._data.attribute.clear();
        this._data.uniform.clear();
        this._data.varying.clear();
    }

    merge(anotherVariableSet) {
        ['attribute', 'uniform', 'varying'].forEach(key => {
            let difference = new Set([...anotherVariableSet._data[key]].filter(x => !this._data[key].has(x)));
            for (let newValue of difference) {
                this.add(anotherVariableSet._map.get(newValue));
            }
        });
    }
}
