class promise2 {
    constructor(executor) {
        if (typeof executor !== 'function') {
            throw new TypeError(`It is  ${executor} a function`);
        }
        initValue();
        initBind();
        try {
            executor(this.resolve, this.reject);
        } catch (e) {
            // statements
            console.log(e);
        }
    }
    initValue(value) {
        this.status = promise2.PENDING;
        this.value = null;
        this.reason = null;
        this.onFullfilledCallBacks = [];
        this.onRejectedCallBacks = [];
    }
    initBind() {
        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);
    }
    resolve(value) {
        if (this.status === promise2.PENDING) {
            this.status = promise2.FULLFILLED;
            this.value = value;
            this.onFullfilledCallBacks.forEach(fn => {
                fn(this.value);
            });
        }
    }
    reject(reason) {
        if (this.status === promise2.REJECTED) {
            this.status = promise2.REJECTED;
            this.reason = reason;
            this.onRejectedCallBacks.forEach(fn => {
                fn(this.reason);
            });

        }
    }
    then(onFullfilled, onRejected) {
        if (typeof onFullfilled !== 'function') {
            onFullfilled = function (value) {
                return value
            }
        }
        if (typeof onRejected !== 'function') {
            onRejected = function (reason) {
                return reason
            }
        }
        let promise3 = new promise2((resolve, reject) => {
            if (this.status === promise2.FULLFILLED) {
                setTimeout(() => {
                    try {
                        const x = onFullfilled(this.value);
                        promise2.resolvePromise(promise3, x, resolve, reject)
                    } catch (e) {
                        this.reject(e);
                    }
                })
            }
            if (this.status === promise2.REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.value);
                        promise2.resolvePromise(promise3, x, resolve, reject)
                    } catch (e) {
                        this.reject(e);
                    }
                })
            }
            if (this.status === promise2.PENDING) {
                this.onFullfilledCallBacks.push(value => {
                    setTimeout(() => {
                        try {
                            const x = onFullfilled(this.value);
                            promise2.resolvePromise(promise3, x, resolve, reject)
                        } catch (e) {
                            this.reject(e);
                        }
                    })
                });
                this.onRejectedCallBacks.push(value => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.value);
                            promise2.resolvePromise(promise3, x, resolve, reject)
                        } catch (e) {
                            this.reject(e);
                        }
                    })
                })

            }
        })
        return promise3;
    }
}
promise2.PENDING = 'pending'
promise2.FULLFILLED = 'fullfilled'
promise2.REJECTED = 'rejected'
promise2.resolvePromise = function (promise3, x, resolve, reject) {
    if (promise3 === x) {
        reject(new TypeError('Chaining Cycle deteted for promise'))
    }
    let called = false;
    if (x instanceof promise2) {
        x.then(value => {
            promise2.resolvePromise(promise3, x, resolve, reject)
        }, reason => {
            reject(reason)
        })
    } else if (x !== null && (typeof x === 'obeject' || typeof x === 'function')) {
        try {
            const then = x.then;
            if (typeof then === 'function') {
                // statement
                then.call(x, value => {
                    if (called) return
                    called = true;
                    promise2.resolvePromise(promise3, x, resolve, reject)
                }, reason => {
                    if (called) return
                    called = true;
                    reject(reason);
                })
            } else {
                if (called) return
                called = true;
                reject(x);
            }

        } catch (e) {
            if (called) return
            called = true;
            rejected(e)
        }
    } else {
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