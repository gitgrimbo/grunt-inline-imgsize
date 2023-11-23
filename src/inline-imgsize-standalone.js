var fs        = require('fs'),
    nodePath  = require("path"),
    imagesize = require('imagesize');

module.exports = function inlineImgSize(contents, path) {
    var Parser = imagesize.Parser;
    var get_image_dimensions = function (buffer) {
        var parser = Parser();

        switch (parser.parse(buffer)) {
            case Parser.EOF:
                return;
            case Parser.INVALID:
                return;
            case Parser.DONE:
                return parser.getResult();
        }
    };

    var regexes = {
        // only match local files
        img: /<img[^\>]+src=['"](?!http:|https:|\/\/|data:image)([^"']+)["'][^\>]*>/gm,
        src: /src=['"]([^"']+)["']/m,
        nosize: /\snosize(\s|>)/m,
        size: /(height|width)=/
    };

    var matches = contents.match(regexes.img) || [];
    matches.forEach(function(tag) {
        // XXX is this necessary?
        // tag = tag.substring(0, tag.length - 1);

        // skip this img if the size is already specified
        if (tag.match(regexes.size)) {
            return;
        }

        // skip this img if the nosize attr is present
        if (tag.match(regexes.nosize)) {
            console.log("NOSIZE", tag);
            return;
        }

        var src = tag.match(regexes.src)[1];

        // ensure forward slashes...
        path = path.split(nodePath.sep).join(nodePath.posix.sep);
        // ...for the following regex
        var imgpath = path.replace(/[^\/]+$/, '') + src;

        var dimensions = get_image_dimensions(fs.readFileSync(imgpath));
        if (!dimensions) {
            return;
        }

        var replacement = tag.replace(/^<img/, "<img width=" + dimensions.width + " height=" + dimensions.height);

        contents = contents.replace(tag, replacement);
    });

    return contents;
}
