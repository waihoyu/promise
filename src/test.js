let promise = require('./promise')
let p = new promise((res, reject) => {
    console.log(123)
});
p.then(21, 22);