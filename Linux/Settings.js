const Settings = require('./settings.json')


function SearchEngine() {
    const activeKey = Object.keys(Settings['Search Engine']).find(e => 
        Settings['Search Engine'][e].status === "active"
    );
    
    if (activeKey) {
        return Settings['Search Engine'][activeKey].Url;
    } else {
        return null; // or throw an error
    }
}

module.exports = {SearchEngine}