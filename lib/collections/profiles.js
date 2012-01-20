var profiles = { },
    indexes  = [ ],
    uuid     = require('../helpers/uuid');

function add(profile) {
  var id = profile.uid.split('.')

  if (profiles[id[0]] === undefined)
    profiles[id[0]] = [ profile ];
  else
    profiles[id[0]][id[1]] = profile;

  indexes.push(profile.uid);
  
  return profile;
}

function get(id) {
  var p = [ ]

  if (arguments.length >= 1)
    for (var i = 0; i < arguments.length; i++) {
        // console.log("\nargument ", arguments[i])
        var id = arguments[i].split('.')
        p.push(profiles[id[0]][id[1]])
      }
  else
    p = profiles

  return p;
}

function at(index) {
  return profiles[indexes[index]];
}

function mostRecent() {
  var get = indexes[indexes.length - 1];

  if (get !== undefined) {
    get = get.split('.');

    var invokation = parseInt(get.pop(), 10),
        profile    = get.join('.');

    return profiles[profile][invokation];
  }
}

exports.create     = add;
exports.add        = add;
exports.get        = get;
exports.getAll     = get;
exports.at         = at;
exports.last       = mostRecent;
exports.mostRecent = mostRecent;