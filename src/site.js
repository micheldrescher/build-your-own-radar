require('./common')
require('./images/logo.png')
require('./images/radar_legend.png')

const GoogleSheetInput = require('./util/factory')

// This is the main entry point to the radar.
// It is loaded through black magic in WebPack.config.js.
GoogleSheetInput().build()
