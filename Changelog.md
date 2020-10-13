## 0.5.6
* use `this` for all dependencies in 

## 0.5.5
* use `unpkg` instead of `browser`; seems to be what Observable wants

## 0.5.4
* make dependency on d3 explicit; dependency on crossfilter is just a devDependency
* use @wesselkuipers/leaflet.markercluster fork of leaflet.markercluster for module compatibility

## 0.5.3
* adds `browser` attribute for Observable and other module compatibility

## 0.5.2
Improvements by Mori Heisoku ([#40](https://github.com/dc-js/dc.leaflet.js/pull/40))
 * leafletBase now supports reuse of an existing leaflet map object using the .map() function
 * new legend function legendTitle() added to optionally specify a title that appears above the legend contents if set
 * bubbleChart changed to inherit from ColorMixin so .colors(), .colorDomain() and .colorAccessor() can be used to change bubble colors and a legend can be added to the map to show color ranges
 * markerChart changed to allow you to define whether titles should be shown or not - function showRenderTitle() replaces prior default of rendering title at all times
 * new markerChart functions fitOnRender() and fitOnRedraw() added to allow map to fit to bounds on initial render and/or crossfilter redraw respectively
 * `legend.setContent` allows setting the content

## 0.5.1
 * `popupMod` and `filterMod` optionally restrict popup and filter actions to when a modifier key is pressed

## 0.5.0
 * Compatible with dc.js 4.* (but not refactored as ES6 classes yet)

## 0.4.0
 * Compatible with D3v5 and dc.js 3.*

## 0.3.3
 * Include `index.js` for ES6 module support, by Sunny Doshi ([#31](https://github.com/dc-js/dc.leaflet.js/pull/31) / [#28](https://github.com/dc-js/dc.leaflet.js/issues/28))

## 0.3.2
 * Pass `.marker()` and `.icon` arguments consistent with documentation. Thanks DienNM! ([#30](https://github.com/dc-js/dc.leaflet.js/issues/30))
 * Documentation improvements: bubble chart is now documented, shared functions are documented under `leafletBase`, minor tweaks.

## 0.3.1
 * Dependency bump (thanks Ramesh Rajagopalan!) ([#25](https://github.com/dc-js/dc.leaflet.js/pull/25)

## 0.3.0
 * Bubble Chart, by Viktor Forsman ([#13](https://github.com/dc-js/dc.leaflet.js/pull/13))

## Starting dc.leaflet.js changelog
 * Ask Git what happened in the past!

The repo [github.com/dc.js/dc.leaflet.js](https://github.com/dc-js/dc.leaflet.js) is a fork of
[yurukov/dc.leaflet.js](https://github.com/yurukov/dc.leaflet.js), by Boyan Yurukov, with
contributions by the community.
