/**
 * @file loader
 *
 * @author Leo Wang(leowang721@gmail.com)
 */

import {Promise} from 'k-core';

export default {
    load(url) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    }
                    // 如果请求不成功，也就不用再分解数据了，直接丢回去就好
                    if (status < 200 || (status >= 300 && status !== 304)) {
                        reject();
                        return;
                    }
                }
            };
            xhr.open('GET', url, true);
            xhr.send();
        });
    }
};
