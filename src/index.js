require("./styles.css")
require('openlayers')
require("./styles.css");
require("proj4")


import {serverInfo} from './config'
import {initMap} from './ol-map'
import updateVega from './updateVega'
import {getConnection, getConnectionStatus, saveConnectionObj} from "./mapd-connector"

const map = initMap()

// connect to the mapd backend and add vega layer with initial map size and extent
getConnection(serverInfo)
  .then(con => {
    // save the connection object so we can use it later
    saveConnectionObj(con)
    // check the connection status
    return getConnectionStatus(con)
  })
  .then(status => {
    if (status && status[0] && status[0].rendering_enabled) {
      // render the vega and add it to the map
      updateVega(map.getSize(), map.getView().calculateExtent(map.getSize()))
    } else {
      // no BE rendering :(
      throw Error("backend rendering is not enabled")
    }
  })
  .catch(error => throw error)
