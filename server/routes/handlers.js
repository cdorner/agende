function error(err, res){
    console.error(err);
    res.statusCode = 500;
    return res.end();
}

function handle(err, object, res){
    if(err)
        res.statusCode = 500;
    if(object == undefined)
        res.statusCode = 404;
    return res.end();
}

function check(err, object){
    return err || !object;
}

module.exports = {
   error : error,
    handle : handle,
   check : check
};