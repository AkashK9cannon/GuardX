const {app} = require('electron')
const LaunchAppWindow = require('./MainWindow')
const Tabs = require('./Tabs.json')
const { writeFileSync } = require('fs')

app.addListener('activate', () => {

})
app.addListener(`ready`, () => {
    LaunchAppWindow()
})
app.addListener('before-quit', () => {

})

app.addListener(`quit`, () => {
    if(process.platform!='darwin'){
        app.addListener('window-all-closed', ()=>{
            Tabs.slice(0, Tabs.length-1)
            writeFileSync('./Tabs.json', JSON.stringify(Tabs))
            app.quit()

        })
    }
})