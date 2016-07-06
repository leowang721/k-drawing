/**
 * @file 节点类 for 树
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {EventTarget} from 'k-core';

export default class Node extends EventTarget {

    parent = null;
    children = [];

    constructor(options = {}) {
        super(options);
        if (options.parent) {
            this.setParent(options.parent);
        }
    }

    isRoot() {
        return !this.parent;
    }
    isLeaf() {
        return this.children.length === 0;
    }

    addChildren(children = []) {
        [].concat(children).forEach(child => {
            if (child instanceof Node) {
                this.children.push(child);
                child.parent = this;
            }
        });
    }

    setParent(parent) {
        if (parent instanceof Node) {
            parent.addChildren(this);
        }
    }
}
