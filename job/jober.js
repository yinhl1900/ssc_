var path = require('path');
var glob = require('glob');

var ref = glob.sync(__dirname + '/*.js');
for (i = 0; i < ref.length; i++) {
    var file = ref[i];
    if (path.basename(file) === 'jober.js') {
        continue;
    }
    filename = './' + path.basename(file, '.iced');
    require(filename)
}