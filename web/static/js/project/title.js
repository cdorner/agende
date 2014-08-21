var agenda = angular.module("agendeTitle", [])
    .factory('$title', function() {
        var title = 'Agende.med ';
        var subtitle = "";
        return {
            get: function() { console.info(title + subtitle); return title + subtitle; },
            setTitle: function(newTitle) { subtitle = newTitle; console.info(newTitle)}
        };
    })
;