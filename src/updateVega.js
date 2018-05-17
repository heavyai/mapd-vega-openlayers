import {updateMap} from "./ol-map"
import makeVegaSpec from "./vegaspec"
import {renderVega} from "./mapd-connector"
import {conv4326To900913} from "./utils"
import {serverInfo} from './config'

function updateVega(map) {
  const container = map.getSize()
  const height = container[1]
  const width = container[0]

  const mapExtent = map.getView().calculateExtent(container) // extent = [minx, miny, maxx, maxy]

  const vegaSpec = makeVegaSpec({
    width,
    height,
    minXBounds: mapExtent[0],
    maxXBounds: mapExtent[2],
    minYBounds: mapExtent[1],
    maxYBounds: mapExtent[3]
  })

  // render the vega and add it to the map
  renderVega(vegaSpec)
    .then(result => {
      updateMap(result)
    })
    .catch(error => throw error)
}

export default updateVega;
