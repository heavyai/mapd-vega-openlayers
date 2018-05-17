import {debounce} from "./utils"
import updateVega from "./updateVega"
const ol = require('openlayers')

var map = null

export const initMap = () => {
  // create a div element for openlayers map
  const div = document.createElement("div");
  div.id = "map"
  document.querySelector("body").append(div)

  map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      projection : "EPSG:900913",
      center: [0, 0],
      zoom: 2
    })
  });

  function update() {
    updateVega(map)
  }

  map.on('moveend', debounce(update, 100));

  return map
}

export const updateMap = (vegaImage) => {

  const vegaSource = vegaImage ? new URL(vegaImage) : ''
  const mapProjection = map.getView().getProjection()
  const mapExtent = map.getView().calculateExtent(map.getSize())

  const vegaLayerSource = new ol.source.ImageStatic({
    url: vegaSource,
    projection: mapProjection,
    imageExtent: mapExtent
  })

  map.getLayers().forEach(layer => {

    if(layer.get('name') !== 'VegaLayer'){
      const vega_layer = new ol.layer.Image({
        name: "VegaLayer",
        source: vegaLayerSource
      })

      map.addLayer(vega_layer)
    }
    else {
      layer.setSource(vegaLayerSource)
    }
  })
}
