const req = require.context("../styles", true, /\.json$/);
const base = req("./base.json");
const env = require("../environment/development.js");
const baseLayers = base.layers.map(l => req(`./${l}.json`));
const source = (env.tileSource == "remote") ? "composite" : "local"

export default Object.assign({}, base, {
  layers: [].concat(...baseLayers).map(l => {
    if (l.source && l.source == "$source") l.source = source;
    return l;
  }),
  sources: base[env.tileSource]
});