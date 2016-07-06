/**
 * @file shader library
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {Promise} from 'k-core';
let library = {};

function load(name) {
    return Promise.require([
        `etpl/tpl!k-webgl/shader/tpl/${name}.vert.tpl`,
        `etpl/tpl!k-webgl/shader/tpl/${name}.frag.tpl`
    ]);
}

export default {
    use(name) {
        if (library[name]) {
            return Promise.resolve(library[name]);
        }
        return load(name).then(([vertex, fragment]) => {
            library[name] = {vertex, fragment};
            return library[name];
        });
    }
};
