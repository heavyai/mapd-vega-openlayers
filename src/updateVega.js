import {updateMap} from "./ol-map"
import makeVegaSpec from "./vegaspec"
import {renderVega} from "./mapd-connector"
import {conv4326To900913} from "./utils"
import {serverInfo} from './config'

function updateVega(size, extent) {  // extent = [minx, miny, maxx, maxy]

  const width = size ? size[0] : 1383
  const height = size ? size[1] : 700


  const vegaSpec = makeVegaSpec({
    width,
    height,
    minXBounds: extent[0],
    maxXBounds: extent[2],
    minYBounds: extent[1],
    maxYBounds: extent[3]
  })

  // render the vega and add it to the map
  renderVega(vegaSpec)
    .then(result => {
      updateMap(result)
    })
    .catch(error => throw error)
}

export default updateVega;
