/***************************
 LeafletBubbleChart
 ***************************/
dc.leafletBubbleChart = function (parent, chartGroup) {
    "use strict";

    /* ####################################
     * Private variables -- default values.
     * ####################################
     */
    var _chart = dc.leafletChart({});
    var _selectedMarkerList = [];
    var _selectedColor = 'blue';
    var _unselectedColor = 'gray';
    var _layerGroup = false;

    var _location = function (d) {
        return _chart.keyAccessor()(d);
    };

    var _r = d3.scale.linear().domain([0, 100]);
    var _brushOn = true;

    var _marker = function (d, map) {
        var key = _chart.locationAccessor()(d);
        var locArray = _chart.toLocArray(key);

        var latlng = L.latLng(+locArray[0], +locArray[1]);
        var circle = L.circleMarker(latlng);

        circle.setRadius(_chart.r()(_chart.valueAccessor()(d)));
        circle.on("mouseover", function (e) {
            // TODO - Tooltips!
            console.log(_chart.title()(d));
        });
        var isSelected = (-1 !== _selectedMarkerList.indexOf(key));

        circle.options.color = isSelected ? _chart.selectedColor() : _chart.unselectedColor();

        return circle;
    };

    /* ########################
     * Private helper functions
     * ########################
     */

    function clearSelectedMarkerList() {
        while (_selectedMarkerList.length > 0) {
            _selectedMarkerList.pop();
        }
    }

    /* ################
     * Public interface
     * ################
    */


    /**
     #### .r([bubbleRadiusScale])
     Get or set bubble radius scale. By default bubble chart uses ```d3.scale.linear().domain([0, 100])``` as it's r scale .

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
        var marker = _chart.marker()(v);
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
    _chart.filterAll = function () {
        // Clear selectedMarkerList on a call to filterAll.
        clearSelectedMarkerList();
        return _chart.filter(null);
    };

    _chart._postRender = function () {
        if (_chart.brushOn()) {

            _chart.map().on('click', function (e) {
                while (_selectedMarkerList.length > 0) {
                    _selectedMarkerList.pop();
                }
                dc.events.trigger(function () {
                    _chart.filter(null);
                    dc.redrawAll(_chart.chartGroup());
                });
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
            _layerGroup.addLayer(marker)
        });
    };

    /* Callback functions */
    function boxzoomFilter(e) {
        clearSelectedMarkerList();

        _layerGroup.eachLayer(function (layer) {
            var latLng = layer.getLatLng();
            if (e.boxZoomBounds.contains(latLng)) {
                _selectedMarkerList.push(layer.key);
            }
        });

        dc.events.trigger(function (e) {
            _chart.dimension().filterFunction(function (d) {
                return _selectedMarkerList.indexOf(d) !== -1;
            });
            dc.redrawAll();
        });
    }

    var selectFilter = function (e) {
        if (!e.target) {
            dc.events.trigger(function () {
                _chart.filter(null);
                dc.redrawAll(_chart.chartGroup());
            });
            return;
        }
        var filter = e.target.key;

        if (e.originalEvent.ctrlKey) {
            // If ctrl key modifier was pressed on click.
            var selectedIndex = _selectedMarkerList.indexOf(filter);
            if (selectedIndex === -1) {
                // If target not already in selected marker list, add it.
                _selectedMarkerList.push(filter);
            }
            else {
                // Else, remove it.
                _selectedMarkerList.splice(selectedIndex, 1);
            }
        }
        else {
            // If ctrl key wasnt pressed, clear filter and selection and add target to a empty selectedMarkersList.
            while (_selectedMarkerList.length > 0) {
                _selectedMarkerList.pop();
            }
            _selectedMarkerList.push(filter);
        }
        dc.events.trigger(function () {
            if (_selectedMarkerList.length > 0) {
                _chart.dimension().filterFunction(function (d) {
                    return _selectedMarkerList.indexOf(d) !== -1;
                });
            } else {
                _chart.filter(null);
            }
            dc.redrawAll(_chart.chartGroup());
        });
    };


    return _chart.anchor(parent, chartGroup);
};

