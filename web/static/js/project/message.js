var Message = (function() {
    "use strict";

    var message,
    	error,
        hideHandler,
        that = {};

    that.init = function(options) {
    	message = $(options.message);
        error = $(options.error);
    };

    that.show = function(text) {
        clearTimeout(hideHandler);

        message.find("span").html(text);
        message.delay(200).fadeIn().delay(4000).fadeOut();
    };
    
    that.error = function(text) {
        clearTimeout(hideHandler);

        error.find("span").html(text);
        error.delay(200).fadeIn().delay(4000).fadeOut();
    };


    return that;
}());