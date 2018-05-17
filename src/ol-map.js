import {debounce} from "./utils"
import updateVega from "./updateVega"
const ol = require('openlayers')

let map = null

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

  map.getLayers().forEach(layer => {
    if(layer.get('name') !== 'VegaLayer'){
      const vega_layer = new ol.layer.Image({
        name: "VegaLayer",
        source: new ol.source.ImageStatic({
          url: vegaSource,
          projection: map.getView().getProjection(),
          imageExtent: map.getView().calculateExtent(map.getSize())
        })
      })
      map.addLayer(vega_layer)
    }
    else {
      const newSource = new ol.source.ImageStatic({
        url: vegaSource,
        projection: map.getView().getProjection(),
        imageExtent: map.getView().calculateExtent(map.getSize())
      })
      layer.setSource(newSource)
    }
  })
}
