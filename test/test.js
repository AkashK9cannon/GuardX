const set = require("./settings.json");

const active = set.Menu["Search Engine"].Active;
const options = set.Menu["Search Engine"].Options;

if (Object.keys(options).includes(active)) {
    console.log("Active Engine:", active);
    console.log("Details:", options[active]);
} else {
    console.log("Invalid search engine:", active);
}
