dc_leaflet.bubbleChart = function (parent, chartGroup) {
    "use strict";

    /* ####################################
     * Private variables -- default values.
     * ####################################
     */
    var _chart = dc_leaflet.leafletBase(dc.MarginMixin);
    var _selectedColor = 'blue';
    var _unselectedColor = 'gray';
    var _layerGroup = false;

    var _location = function (d) {
        return _chart.keyAccessor()(d);
    };

    var _r = d3.scaleLinear().domain([0, 100]);
    var _brushOn = true;

    var _marker = function (d, map) {
        var loc = _chart.locationAccessor()(d);
        var locArray = _chart.toLocArray(loc);

        var latlng = L.latLng(+locArray[0], +locArray[1]);
        var circle = L.circleMarker(latlng);

        circle.setRadius(_chart.r()(_chart.valueAccessor()(d)));
        circle.on("mouseover", function (e) {
            // TODO - Tooltips!
            //console.log(_chart.title()(d));
        });
        var key = _chart.keyAccessor()(d);
        var isSelected = (-1 !== _chart.filters().indexOf(key));

        circle.options.color = isSelected ? _chart.selectedColor() : _chart.unselectedColor();

        return circle;
    };

    /* ########################
     * Private helper functions
     * ########################
     */

    /* ################
     * Public interface
     * ################
     */


    /**
     #### .r([bubbleRadiusScale])
     Get or set bubble radius scale. By default bubble chart uses ```d3.scaleLinear().domain([0, 100])``` as its r scale .

     **/
    _chart.r = function (_) {
        if (!arguments.length) return _r;
        _r = _;
        return _chart;
    };

    _chart.brushOn = function (_) {
        if (!arguments.length) {
            return _brushOn;
        }
        _brushOn = _;
        return _chart;
    };

    _chart.locationAccessor = function (_) {
        if (!arguments.length) {
            return _location;
        }
        _location = _;
        return _chart;
    };
    /**
     #### .selectedColor([color])
     Get or set the color of a selected (filter) bubble.
     */
    _chart.selectedColor = function (_) {
        if (!arguments.length) {
            return _selectedColor;
        }
        _selectedColor = _;
        return _chart;
    };

    /**
     #### .unselectedColor([color])
     Get or set the color of a bubble which is not currently in the filter.

     */
    _chart.unselectedColor = function (_) {
        if (!arguments.length) {
            return _unselectedColor;
        }
        _unselectedColor = _;
        return _chart;
    };

    var createmarker = function (v, k) {
        var marker = _chart.marker()(v, _chart.map());
        marker.key = k;
        if (_chart.brushOn()) {
            marker.on("click", selectFilter);
        }
        return marker;
    };

    _chart.marker = function (_) {
        if (!arguments.length) {
            return _marker;
        }
        _marker = _;
        return _chart;
    };

    /* Render and redraw overrides */
    _chart._postRender = function () {
        if (_chart.brushOn()) {

            _chart.map().on('click', function (e) {
                _chart.filter(null);
                _chart.redrawGroup();
            });
        }
        _chart.map().on('boxzoomend', boxzoomFilter, this);
        _layerGroup = new L.LayerGroup();
        _chart.map().addLayer(_layerGroup);
    };

    _chart._doRedraw = function () {
        var groups = _chart._computeOrderedGroups(_chart.data()).filter(function (d) {
            return _chart.valueAccessor()(d) !== 0;
        });
        _layerGroup.clearLayers();
        groups.forEach(function (v, i) {
            var key = _chart.keyAccessor()(v);
            var marker = null;

            marker = createmarker(v, key);
            _layerGroup.addLayer(marker);
        });
    };

    /* Callback functions */
    function boxzoomFilter(e) {
        var filters = [];

        _layerGroup.eachLayer(function (layer) {
            var latLng = layer.getLatLng();
            if (e.boxZoomBounds.contains(latLng)) {
                filters.push(layer.key);
            }
        });

        dc.events.trigger(function (e) {
            _chart.replaceFilter([filters]);
            _chart.redrawGroup();
        });
    }

    var selectFilter = function (e) {
        L.DomEvent.stopPropagation(e);
        var filter = e.target.key;
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            // If ctrl/cmd key modifier was pressed on click, toggle the target
            _chart.filter(filter);
        }
        else {
            // If ctrl key wasn't pressed, clear selection and add target
            _chart.replaceFilter([[filter]]);
        }
        _chart.redrawGroup();
    };


    return _chart.anchor(parent, chartGroup);
};
