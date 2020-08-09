dc_leaflet.markerChart = function(parent, chartGroup) {
    var _chart = dc_leaflet.leafletBase(dc.MarginMixin);

    var _renderPopup = true;
    var _cluster = false; // requires leaflet.markerCluster
    var _clusterOptions=false;
    var _rebuildMarkers = false;
    var _brushOn = true;
    var _filterByArea = false;
    var _clickEvent = false;
    var _featureGroup = false;

    var _filter;
    var _innerFilter=false;
    var _zooming=false;
    var _layerGroup = false;
    var _markerList = [];
    var _currentGroups=false;

    var _fitOnRender = true;
    var _fitOnRedraw = false;
    var _disableFitOnRedraw = false;
    var _showMarkerTitle = true;

    var _location = function(d) {
        return _chart.keyAccessor()(d);
    };

    var _marker = function(d, map) {
        var marker = new L.Marker(_chart.toLocArray(_chart.locationAccessor()(d)), {
            title: _showMarkerTitle ? _chart.title()(d) : '',
            alt: _showMarkerTitle ? _chart.title()(d) : '',
            icon: _icon(d, map),
            clickable: _chart.renderPopup() || (_chart.brushOn() && !_filterByArea),
            draggable: false
        });
        return marker;
    };

    var _icon = function(d, map) {
        return new L.Icon.Default();
    };

    var _popup = function(d, marker) {
        return _chart.title()(d);
    };

    _chart._postRender = function() {
        if (_chart.brushOn()) {
            if (_filterByArea) {
                _chart.filterHandler(doFilterByArea);
            }

            _chart.map().on('zoomend moveend', zoomFilter, this );
            if (!_filterByArea)
                _chart.map().on('click', zoomFilter, this );
            _chart.map().on('zoomstart', zoomStart, this);
        }

        if (_cluster) {
            _layerGroup = new L.MarkerClusterGroup(_clusterOptions?_clusterOptions:null);
        }
        else {
            _layerGroup = new L.LayerGroup();
        }
        _chart.map().addLayer(_layerGroup);
    };

    _chart._doRedraw = function() {
        var groups = _chart._computeOrderedGroups(_chart.data()).filter(function (d) {
            return _chart.valueAccessor()(d) !== 0;
        });
        if (_currentGroups && _currentGroups.toString() === groups.toString()) {
            return;
        }
        _currentGroups=groups;

        if (_rebuildMarkers) {
            _markerList=[];
        }
        _layerGroup.clearLayers();

        var addList=[];
        _featureGroup = false;
        groups.forEach(function(v, i) {
            var key = _chart.keyAccessor()(v);
            var marker = null;
            if (!_rebuildMarkers && key in _markerList) {
                marker = _markerList[key];
            }
            else {
                marker = createmarker(v, key);
            }
            if (!_chart.cluster()) {
                _layerGroup.addLayer(marker);
            }
            else {
                addList.push(marker);
            }
        });

        if (_chart.cluster() && addList.length > 0) {
            _layerGroup.addLayers(addList);
        }

        if (addList.length > 0) {
            if (_fitOnRender || (_fitOnRedraw && !_disableFitOnRedraw)) {
                _featureGroup = new L.featureGroup(addList);
                _chart.map().fitBounds(_featureGroup.getBounds());
            }
        }

        _disableFitOnRedraw = false;
        _fitOnRender = false;
    };

    _chart.locationAccessor = function(_) {
        if (!arguments.length) {
            return _location;
        }
        _location= _;
        return _chart;
    };

    _chart.marker = function(_) {
        if (!arguments.length) {
            return _marker;
        }
        _marker= _;
        return _chart;
    };

    _chart.featureGroup = function(_) {
        if (!arguments.length) {
            return _featureGroup;
        }
        _featureGroup= _;
        return _chart;
    };

    _chart.icon = function(_) {
        if (!arguments.length) {
            return _icon;
        }
        _icon= _;
        return _chart;
    };

    _chart.popup = function(_) {
        if (!arguments.length) {
            return _popup;
        }
        _popup= _;
        return _chart;
    };

    _chart.clickEvent = function(_) {
        if (!arguments.length) {
            return _clickEvent;
        }
        _clickEvent= _;
        return _chart;
    };

    _chart.renderPopup = function(_) {
        if (!arguments.length) {
            return _renderPopup;
        }
        _renderPopup = _;
        return _chart;
    };


    _chart.cluster = function(_) {
        if (!arguments.length) {
            return _cluster;
        }
        _cluster = _;
        return _chart;
    };

    _chart.clusterOptions = function(_) {
        if (!arguments.length) {
            return _clusterOptions;
        }
        _clusterOptions = _;
        return _chart;
    };

    _chart.rebuildMarkers = function(_) {
        if (!arguments.length) {
            return _rebuildMarkers;
        }
        _rebuildMarkers = _;
        return _chart;
    };

    _chart.brushOn = function(_) {
        if (!arguments.length) {
            return _brushOn;
        }
        _brushOn = _;
        return _chart;
    };

    _chart.filterByArea = function(_) {
        if (!arguments.length) {
            return _filterByArea;
        }
        _filterByArea = _;
        return _chart;
    };

    _chart.fitOnRender = function(_) {
        if (!arguments.length) {
            return _fitOnRender;
        }
        _fitOnRender = _;
        return _chart;
    };

    _chart.fitOnRedraw = function(_) {
        if (!arguments.length) {
            return _fitOnRedraw;
        }
        _fitOnRedraw = _;
        return _chart;
    };

    _chart.showMarkerTitle = function(_) {
        if (!arguments.length) {
            return _showMarkerTitle;
        }
        _showMarkerTitle = _;
        return _chart;
    };

    _chart.markerGroup = function() {
        return _layerGroup;
    };

    var createmarker = function(v, k) {
        var marker = _marker(v, _chart.map());
        marker.key = k;
        if (_chart.renderPopup()) {
            _chart.bindPopupWithMod(marker, _chart.popup()(v, marker));
        }
        if (_chart.brushOn() && !_filterByArea) {
            marker.on("click", selectFilter);
        }
        if (_clickEvent)
            marker.on("click", _clickEvent)

        _markerList[k]=marker;
        return marker;
    };

    var zoomStart = function(e) {
        _zooming=true;
    };

    var zoomFilter = function(e) {
        if (e.type === "moveend" && (_zooming || e.hard)) {
            return;
        }
        _zooming=false;

        if (_filterByArea) {
            var filter;
            if (_chart.map().getCenter().equals(_chart.center()) && _chart.map().getZoom() === _chart.zoom()) {
                filter = null;
            }
            else {
                filter = _chart.map().getBounds();
            }
            dc.events.trigger(function () {
                _chart.filter(null);
                if (filter) {
                    _innerFilter=true;
                    _chart.filter(filter);
                    _innerFilter=false;
                }
                dc.redrawAll(_chart.chartGroup());
            });
        } else if (_chart.filter() && (e.type === "click" ||
                                       (_markerList.indexOf(_chart.filter()) !== -1 &&
                                        !_chart.map().getBounds().contains(_markerList[_chart.filter()].getLatLng())))) {
            dc.events.trigger(function () {
                _chart.filter(null);
                if (_renderPopup) {
                    _chart.map().closePopup();
                }
                dc.redrawAll(_chart.chartGroup());
            });
        }
    };

    var doFilterByArea = function(dimension, filters) {
        _chart.dimension().filter(null);
        if (filters && filters.length>0) {
            _chart.dimension().filterFunction(function(d) {
                if (!(d in _markerList)) {
                    return false;
                }
                var locO = _markerList[d].getLatLng();
                return locO && filters[0].contains(locO);
            });
            if (!_innerFilter && _chart.map().getBounds().toString !== filters[0].toString()) {
                _chart.map().fitBounds(filters[0]);
            }
        }
    };

    var selectFilter = function(e) {
        if (!e.target) return;
        if (!_chart.modKeyMatches(e, _chart.filterMod())) return;
        var filter = e.target.key;
        dc.events.trigger(function () {
            _chart.filter(filter);
            dc.redrawAll(_chart.chartGroup());
        });
    };

    return _chart.anchor(parent, chartGroup);
};