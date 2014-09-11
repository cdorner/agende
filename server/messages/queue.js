var monq = require('monq');

var client;
var worker
function init(url){
    client = monq(url);
    worker = client.worker(['queue']);
};

function register(object){
    worker.register(object);
}

function start(){
    worker.on('dequeued', function (data) { });
    worker.on('failed', function (data) { console.error(data) });
    worker.on('complete', function (data) { });
    worker.on('error', function (err) { console.error(err) });

    worker.start();
}

function dispatch(job, object, callback){
    var queue = client.queue("queue")
    queue.enqueue(job, object, function(err, job){if(err) console.error(err)});
}

module.exports = {
    init : init,
    register : register,
    start : start,
    dispatch : dispatch
}