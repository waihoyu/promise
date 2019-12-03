/*
 *@description:  promise 的手动实现 
 *@author: Wai HoYu
 *@date: 2019-12-01 01:41:13
 *@version: V1.0.5
 *@comments: 测试promise完整性插件：npm i promises-aplus-tests
 *@comments: 命令行测试程序： npx promises-aplus-tests promise.js
 */

class Promise {

    constructor(executor) {
        //不能相信用户的输入，一定要进行参数校验
        if (typeof executor !== 'function') {
            throw new TypeError(` Promise resolver ${executor} is not a function `);
        }
        this.initValue();
        this.initBind();
        try {
            executor(this.resolve, this.reject);
        } catch (error) {
            this.reject(error);
        }
    }

    initBind() {
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
    }

    initValue() {
        this.value = null;
        this.reason = null;
        this.state = Promise.PENDING;
        this.onFullfilledCallbacks = [];
        this.onRejectedCallbacks = [];
    }

    resolve(value) {
        //成功后的一系列操作 状态的改变  成功回调的执行
        if (this.state === Promise.PENDING) {
            this.state = Promise.FULLFILLED;
            this.value = value;
            this.onFullfilledCallbacks.forEach((fn) => {
                fn(this.value);
            });
        }
    }

    reject(reason) {
        if (this.state === Promise.PENDING) {
            this.state = Promise.REJECTED;
            this.reason = reason;
            this.onRejectedCallbacks.forEach((fn) => {
                fn(this.reason);
            });
        }
    }

    then(onFullfilled, onRejected) {
        if (typeof onFullfilled !== 'function') {
            onFullfilled = function (value) {
                return value;
            }
            console.log(onFullfilled);
        }

        if (typeof onRejected !== 'function') {
            onRejected = function (reason) {
                throw reason;
            }
        }

        let promise2 = new Promise((resolve, reject) => {
            if (this.state === Promise.FULLFILLED) {
                setTimeout(() => {
                    try {
                        const x = onFullfilled(this.value);
                        Promise.resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            if (this.state === Promise.REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason);
                        Promise.resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        reject(error);
                    }
                });
            }

            if (this.state === Promise.PENDING) {
                this.onFullfilledCallbacks.push(value => {
                    setTimeout(() => {
                        try {
                            const x = onFullfilled(value);
                            Promise.resolvePromise(promise2, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                });

                this.onRejectedCallbacks.push(reason => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(reason);
                            Promise.resolvePromise(promise2, x, resolve, reject)
                        } catch (error) {
                            reject(error);
                        }
                    })
                });
            }

        });
        return promise2;
    }
}

Promise.PENDING = 'pending';
Promise.FULLFILLED = 'fullfilled';
Promise.REJECTED = 'rejected';

Promise.resolvePromise = function (promise2, x, resolve, reject) {
    if (promise2 === x) {
        reject(new TypeError('Chaining cycle detected for promise'));
    }
    let called = false;
    if (x instanceof Promise) {
        x.then(
            value => {
                Promise.resolvePromise(promise2, value, resolve, reject);
            },
            reason => {
                reject(reason);
            });
    }
    // 
    else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            const then = x.then;
            if (typeof then === 'function') {
                then.call(
                    x,
                    value => {
                        if (called) return
                        called = true
                        Promise.resolvePromise(promise2, value, resolve, reject);
                    }, reason => {
                        if (called) return
                        called = true
                        reject(reason);
                    });
            } else {
                if (called) return
                called = true
                resolve(x);
            }
        } catch (error) {
            if (called) return
            called = true
            reject(error)
        }
    }
    // 
    else {
        resolve(x);
    }
}

Promise.defer = Promise.deferred = function () {
    let dfd = {}
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}

module.exports = Promise;