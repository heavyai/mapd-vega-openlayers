import {debounce} from "./utils"
import updateVega from "./updateVega"
const ol = require('openlayers')
require('openlayers/css/ol.css')
require('./styles.css')

var map = null
var draw = null
var vegaSize = null
var vegaExtent = null

export const initMap = () => {
  const drawPolygonButton = document.createElement("BUTTON")
  const btnText = document.createTextNode('Draw Polygon')
  drawPolygonButton.appendChild(btnText)
  document.body.appendChild(drawPolygonButton)
  drawPolygonButton.className = "drawButton"
  drawPolygonButton.addEventListener('click', function (ev) {
    drawShape()
  })

  const cancelDrawPolygonButton = document.createElement("BUTTON")
  const cancelBtnText = document.createTextNode('Clear Polygon')
  cancelDrawPolygonButton.appendChild(cancelBtnText)
  document.body.appendChild(cancelDrawPolygonButton)
  cancelDrawPolygonButton.className = "drawButton"
  cancelDrawPolygonButton.addEventListener('click', function (ev) {
    clearDrawShapes()
  })

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
    if(!vector){
      vegaSize = map.getSize()
      vegaExtent = map.getView().calculateExtent(vegaSize)
      updateVega(vegaSize, vegaExtent)
    }
  }

  map.on('moveend', debounce(update, 100));

  return map
}

var source = new ol.source.Vector({wrapX: false});
var vector = null

function drawShape() {
  var geometryFunction = ol.interaction.Draw.createBox();
  draw = new ol.interaction.Draw({
    source: source,
    type: 'Circle',
    geometryFunction: geometryFunction
  })
  vector = new ol.layer.Vector({
    name: 'CustomFilter',
    source: source
  });

  map.addInteraction(draw)
  map.addLayer(vector)
  draw.on('drawend', function (evt) {
    // map.removeInteraction(draw)
    const sketch = evt.feature

    const sketchExtent = sketch.getGeometry().getExtent()
    const topLeft = map.getPixelFromCoordinate(ol.extent.getTopLeft(sketchExtent))
    const bottomLeft = map.getPixelFromCoordinate(ol.extent.getBottomLeft(sketchExtent))
    const topRight = map.getPixelFromCoordinate(ol.extent.getTopRight(sketchExtent))

    const sketchWidth = topRight[0] - topLeft[0]
    const sketchHeight = bottomLeft[1] - topLeft[1]
    vegaSize = [Math.round(sketchWidth), Math.round(sketchHeight)]
    vegaExtent = sketchExtent
    if(sketchExtent[0] !== Infinity){
      updateVega(vegaSize, vegaExtent)
    }
  })
}

function clearDrawShapes() {
  map.removeInteraction(draw)
  map.removeLayer(vector)
  vector = null
  vegaSize = map.getSize()
  vegaExtent = map.getView().calculateExtent(vegaSize)
  updateVega(vegaSize, vegaExtent)
}

export const updateMap = (vegaImage) => {

  const vegaSource = vegaImage ? new URL(vegaImage) : ''
  const mapProjection = map.getView().getProjection()

  const vegaLayerSource = new ol.source.ImageStatic({
    url: vegaSource,
    projection: mapProjection,
    imageExtent: vegaExtent
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
