import sls from "single-line-string"

const makeVegaSpec = ({
  width,
  height,
  minXBounds,
  minYBounds,
  maxYBounds,
  maxXBounds
}) => ({
  width,
  height,
  data: [
    {
      name: "fec_contributions_oct",
      sql: sls`SELECT
        conv_4326_900913_x(lon) as x,
        conv_4326_900913_y(lat) as y,
        recipient_party as dim0,
        amount as val,
        rowid
        FROM fec_contributions_oct
        WHERE conv_4326_900913_x(lon) between ${minXBounds} and ${maxXBounds}
        AND conv_4326_900913_y(lat) between ${minYBounds} and ${maxYBounds}
        LIMIT 2000000`
    }
  ],
  scales: [
    {
      name: "x",
      type: "linear",
      domain: [minXBounds, maxXBounds],
      range: "width"
    },
    {
      name: "y",
      type: "linear",
      domain: [minYBounds, maxYBounds],
      range: "height"
    }
  ],
  marks: [
    {
      type: "symbol",
      from: { data: "fec_contributions_oct" },
      properties: {
        width: 10,
        height: 10,
        x: { scale: "x", field: "x" },
        y: { scale: "y", field: "y" },
        fillColor: "blue",
        strokeColor: "rgb(0, 0, 0)",
        strokeWidth: 0.5,
        shape: "circle"
      }
    }
  ]
});

export default makeVegaSpec
// const makeVegaSpec = ({
//                         width,
//                         height,
//                         minXBounds,
//                         minYBounds,
//                         maxYBounds,
//                         maxXBounds
//                       }) => ({
//   width,
//   height,
//   data: [
//     {
//       name: "heatmap_query",
//       sql: "SELECT rect_pixel_bin(conv_4326_900913_x(lon), -13847031.457875465, -7451726.712679257, 733, 733) as x, "+
//       "rect_pixel_bin(conv_4326_900913_y(lat), 2346114.147993467, 6970277.197053557, 530, 530) as y, "+
//       "SUM(amount) as cnt "+
//       "FROM contributions "+
//       "WHERE (lon >= -124.39000000000038 AND lon <= -66.93999999999943) AND "+
//       "(lat >= 20.61570573311549 AND lat <= 52.93117449504004) AND "+
//       "amount > 0 AND "+
//       "recipient_party = 'R' "+
//       "GROUP BY x, y;"
//     }
//   ],
//   scales: [
//     {
//       "name": "heat_color",
//       "type": "quantize",
//       "domain": [
//         10000.0,
//         1000000.0
//       ],
//       "range": [ "#0d0887", "#2a0593", "#41049d", "#5601a4", "#6a00a8",
//         "#7e03a8", "#8f0da4", "#a11b9b", "#b12a90", "#bf3984",
//         "#cb4679", "#d6556d", "#e16462", "#ea7457", "#f2844b",
//         "#f89540", "#fca636", "#feba2c", "#fcce25", "#f7e425", "#f0f921"
//       ],
//       "default": "#0d0887",
//       "nullValue": "#0d0887"
//     }
//   ],
//   marks: [
//     {
//       "type": "symbol",
//       "from": {
//         "data": "heatmap_query"
//       },
//       "properties": {
//         "shape": "square",
//         "x": {
//           "field": "x"
//         },
//         "y": {
//           "field": "y"
//         },
//         "width": 1,
//         "height": 1,
//         "fillColor": {
//           "scale": "heat_color",
//           "field": "cnt"
//         }
//       }
//     }
//   ]
// });