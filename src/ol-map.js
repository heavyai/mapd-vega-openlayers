import {debounce} from "./utils"
import updateVega from "./updateVega"
const ol = require('openlayers')
require('openlayers/css/ol.css')
require('./styles.css')
import * as proj4 from 'proj4'


var map = null
var vegaSize = null
var vegaExtent = null
// adding Projection options
const projectionOption = document.createElement("select")
projectionOption.id = "projection"

var opt0 = document.createElement('option')
opt0.value = 'EPSG:900913'
opt0.innerHTML = 'WGS84(EPSG:900913)'
projectionOption.appendChild((opt0))

var opt1 = document.createElement('option')
opt1.value = 'EPSG:3857'
opt1.innerHTML = 'Spherical Mercator(EPSG:3857)'
projectionOption.appendChild((opt1))

var opt2 = document.createElement('option')
opt2.value = 'EPSG:3413'
opt2.innerHTML = 'NSIDC Polar Stereographic North(EPSG:3413)'
projectionOption.appendChild((opt2))

var opt3 = document.createElement('option')
opt3.value = 'ESRI:54009'
opt3.innerHTML = 'Mollweide(ESRI:54009)'
projectionOption.appendChild((opt3))

document.body.appendChild(projectionOption)
export const initMap = () => {

  // adding Draw Polygon and Clear Polygon buttons
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


  // calls renderVega with new vega spec
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

// Custom rectangle polygon filter
var source = new ol.source.Vector({wrapX: false});
var vector = null
var draw = null

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

    const sketch = evt.feature

    // helper values to create vega spec
    const sketchExtent = sketch.getGeometry().getExtent()
    const topLeft = map.getPixelFromCoordinate(ol.extent.getTopLeft(sketchExtent))
    const bottomLeft = map.getPixelFromCoordinate(ol.extent.getBottomLeft(sketchExtent))
    const topRight = map.getPixelFromCoordinate(ol.extent.getTopRight(sketchExtent))
    const sketchWidth = topRight[0] - topLeft[0]
    const sketchHeight = bottomLeft[1] - topLeft[1]

    vegaSize = [Math.round(sketchWidth), Math.round(sketchHeight)]
    vegaExtent = sketchExtent

    // calls renderVega with custom shape size and extent
    if(sketchExtent[0] !== Infinity){
      updateVega(vegaSize, vegaExtent)
    }
  })
}

// called when clicking on Clear Polygon button which removes polygon filter
function clearDrawShapes() {
  map.removeInteraction(draw)
  map.removeLayer(vector)
  vector = null
  vegaSize = map.getSize()
  vegaExtent = map.getView().calculateExtent(vegaSize)
  updateVega(vegaSize, vegaExtent)
}

// Update vega layer on the map
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


// updating projection of the map
// proj4.default('EPSG:3413', '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 ' +
//     '+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs');
// console.log(proj4.default('EPSG:3413', '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 ' +
//     '+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs'))
// var proj3413 = ol.proj.get('EPSG:3413');
// proj3413.setExtent([-4194304, -4194304, 4194304, 4194304]);

// proj4.default.defs('ESRI:54009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' +
//     '+units=m +no_defs');
// var proj54009 = ol.proj.get('ESRI:54009');
// proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);


var viewProjSelect = document.getElementById('projection');

function updateViewProjection() {
  var newProj = ol.proj.get(viewProjSelect.value);
  console.log(newProj)
  var newProjExtent = newProj.getExtent();
  var newView = new ol.View({
    projection: newProj,
    center: ol.extent.getCenter(newProjExtent || [0, 0, 0, 0]),
    zoom: 0,
    extent: newProjExtent || undefined
  });
  map.setView(newView);

  // Example how to prevent double occurrence of map by limiting layer extent
  if (newProj == ol.proj.get('EPSG:3857')) {
    layers['bng'].setExtent([-1057216, 6405988, 404315, 8759696]);
  } else {
    layers['bng'].setExtent(undefined);
  }
}

  projectionOption.onchange = function() {
    updateViewProjection();
  };

