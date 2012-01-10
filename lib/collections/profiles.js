var profiles = { },
    indexes  = [ ];

function add(profile) {
	console.log("\nAdding: ", profile)
  if (profiles[profile.id] === undefined)
    profiles[profile.id] = [ profile ];
  else
    profiles[profile.id][profile.invokation] = profile;

  indexes.push(profile.id + '.' + profile.invokation);
}

function get(id) {
  var p = { };

  if (arguments.length >= 1) {
    for (var k in arguments)
      if (arguments.hasOwnProperty(k))
        p[k] = profiles[k];
  } else {
    p = profiles;
  }

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