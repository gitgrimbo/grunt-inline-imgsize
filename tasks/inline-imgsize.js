var inlineImgSize = require('./inline-imgsize-standalone');

module.exports = function plugin(grunt) {

    var fileOptions = {
        encoding: 'utf-8'
    };

    var options = {
        encoding: 'utf8'
    };

    grunt.registerMultiTask('inlineImgSize', 'Inject width and height for img tags', function() {

        grunt.util._.extend(options, this.options());

        this.files.forEach(function(f) {
            var src = f.src.filter(function(path) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(path)) {
                    grunt.log.warn('Source file "' + path + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(path) {
                var contents = grunt.file.read(path, fileOptions);
                contents = inlineImgSize(contents, path);
                grunt.file.write(path, contents, fileOptions);
            });
        });
    });

};
