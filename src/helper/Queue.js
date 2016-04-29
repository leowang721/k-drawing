/**
 * @file 简单队列
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

export default class Queue {

    _queue = [];

    enqueue(item) {
        this._queue.push(item);
    }

    dequeue() {
        return this._queue.shift();
    }

    get length() {
        return this._queue.length;
    }

    isEmpty() {
        return this._queue.length === 0;
    }

    clear() {
        this._queue.length = 0;
    }

    merge(anotherQueue) {
        this._queue = this._queue.concat(...anotherQueue._queue);
    }

    toArray() {
        return [...this._queue];
    }
}
