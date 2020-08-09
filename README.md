dc.leaflet.js
=============
This library provides support for DC.js charts in a Leaflet.js map. It is a fork of Boyan Yurukov's dc.js extension, upgraded to a full library with AMD support and updated for dc.js 2.0+.

Demo
=============
Examples of each of the charts can be found here:
[http://dc-js.github.io/dc.leaflet.js/](http://dc-js.github.io/dc.leaflet.js/)

Requirements
=============
(These will be installed by `npm install`)
*  [dc.js](https://github.com/dc-js/dc.js) 1.7.0 ([crossfilter.js](https://github.com/square/crossfilter) 1.3.7 & [d3.js](https://github.com/d3/d3) 3.4.8)
*  [leaflet.js](https://github.com/Leaflet/Leaflet) 0.7.2
*  [leaflet.markercluster.js](https://github.com/Leaflet/Leaflet.markercluster) 0.4.0 (in case you use the cluster option)

The charts should work with older versions with minor changes.

Usage
=============
There are two charts currently implemented - markers and choropleth. They extend the base abstract leaflet chart. Both support selection of datapoints and update in real time. Styling and map options can be set directly to the map object and though functions in the chart. Check the [Leaflet reference](http://leafletjs.com/reference.html#map-options) for more information on the specific map, marker and geojson options.
Location can be set as either 'lat,lng' string or as an array [lat,lng].

Leaflet base
--------------------
Properties included in all `dc_leaflet` charts. Derives from [dc.baseMixin](http://dc-js.github.io/dc.js/docs/html/dc.baseMixin.html) and [dc.marginMixin](http://dc-js.github.io/dc.js/docs/html/dc.marginMixin.html). This is a base class/mixin and can't be instantiated directly.
```js
dc_leaflet.leafletBase = function(chart)
  .mapOptions({..})       - set leaflet specific options to the map object; Default: Leaflet default options
  .center([1.1,1.1])      - get or set initial location
  .zoom(7)                - get or set initial zoom level
  .map()                  - set or get map object
  .brushOn(true)          - if the map should select datapoints; Default: true
  .popupMod('alt')        - only display popup when 'alt' modifier key (or 'shift' or 'ctrlCmd') is pressed;
                            Default: null, no modifier key
  .filterMod('ctrlMod')   - only filter when control key (command key on Mac) is pressed
                            Default: null, no modifier key
```

Marker chart
--------------------
Each group is presented as one marker on the map. Includes all properties from `leafletBase`, and:
```js
dc_leaflet.markerChart(parent, chartGroup)
  .locationAccessor()     - function (d) to access the property indicating the latlng (string or array); Default: use keyAccessor
  .marker()               - set function(d, map) to build the marker object. Default: standard Leaflet marker is built
  .icon()                 - function(d, map) to build an icon object. Default: L.Icon.Default
  .popup()                - function(d, marker) to return the string or DOM content of a popup
  .renderPopup(true)      - get or set if popups should be shown; Default: true
  .cluster(false)         - get or set if markers should be clustered. Requires leaflet.markercluster.js; Default: false
  .clusterOptions({..})   - options for the markerCluster object
  .rebuildMarkers(false)  - set if all markers should be rebuild each time the map is redrawn. Degrades performance; Default: false
  .filterByArea(false)    - if the map should filter data based on the markers inside the zoomed in area instead of the user clicking on individual markers; Default: false
  .markerGroup()          - get the Leaflet group object containing all shown markers (regular group or cluster)
  .featureGroup()         - get or set featureGroup that will be used for fit on render or redraw
  .clickEvent()           - get or set the event to fire when a marker is clicked
  .fitOnRender()          - get or set a bool to determine whether to fit to bounds when markers are rendered
  .showMarkerTitle()      - get or set a bool to determine whether title and alt should be shown for markers
```

Choropleth chart
--------------------
Each group is mapped to an feature on the map. Includes all properties from `leafletBase`, and:
```js
dc_leaflet.choroplethChart(parent, chartGroup)
  .geojson()              - get or set geojson object describing the features
  .featureOptions()       - object or a function(feature) to set the options for each feature
  .featureKeyAccessor()   - function(feature) to return a feature property that would be compared to the group key; Default: feature.properties.key
  .featureStyle()         - get or set the function(feature) to return style options for L.geoJson. Probably not helpful to override this, but it's possible. Default: use featureOptions, data, color, selection status to define the style; see source for details.
  .popup()                - function(d, feature) to return the string or DOM content of a popup
  .renderPopup(true)      - get or set if popups should be shown; Default: true
```

Bubble chart
--------------------
Each group is mapped to a circle on the map. Includes all properties from `leafletBase`, and:
```js
dc_leaflet.bubbleChart(parent, chartGroup)
  .r()                    - radius scale, used to convert value returned by valueAccessor(d) to pixels. Default: d3.scale.linear().domain([0, 100])
  .locationAccessor()     - function(d) to access the property indicating the latlng (string or array); Default: use keyAccessor
  .selectedColor()        - get or set the (constant) selected bubble color
  .unselectedColor()      - get or set the unselected bubble color, which can render from a color domain (like a choropleth can)
  .popup()                - function(d, marker) to return the string or DOM content of a popup
  .renderPopup()          - get or set if popups should be shown on mouseover; Default: true
  .layerGroup()           - get the layerGroup for the bubbles
  .marker()               - get or set function(d, map) to build the marker object. Probably not helpful to override this, but its's possible. Default: create L.circleMarker based on the other parameters; see source for details.
```
