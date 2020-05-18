dc_leaflet.choroplethChart = function(parent, chartGroup) {
    var _chart = dc_leaflet.leafletBase(dc.ColorMixin(dc.MarginMixin));

    var _geojsonLayer = false;
    var _dataMap = [];

    var _geojson = false;
    var _renderPopup = true;
    var _brushOn = true;
    var _featureOptions = {
        'fillColor':'black',
        'color':'gray',
        'opacity':0.4,
        'fillOpacity':0.6,
        'weight':1
    };

    var _featureKey = function(feature) {
        return feature.key;
    };

    var _featureStyle = function(feature) {
        var options = _chart.featureOptions();
        if (options instanceof Function) {
            options=options(feature);
        }
        options = JSON.parse(JSON.stringify(options));
        var v = _dataMap[_chart.featureKeyAccessor()(feature)];
        if (v && v.d) {
            options.fillColor=_chart.getColor(v.d, v.i);
            if (_chart.filters().indexOf(v.d.key) !== -1) {
                options.opacity=0.8;
                options.fillOpacity=1;
            }
        }
        return options;
    };

    var _popup = function(d, feature) {
        return _chart.title()(d);
    };

    _chart._postRender = function() {
        _geojsonLayer=L.geoJson(_chart.geojson(), {
            style: _chart.featureStyle(),
            onEachFeature: processFeatures
        });
        _chart.map().addLayer(_geojsonLayer);
    };

    const super_doRedraw = _chart._doRedraw;
    _chart._doRedraw = function() {
        _geojsonLayer.clearLayers();
        _dataMap=[];
        _chart._computeOrderedGroups(_chart.data()).forEach(function (d, i) {
            _dataMap[_chart.keyAccessor()(d)] = {'d':d, 'i':i};
        });
        _geojsonLayer.addData(_chart.geojson());
        return super_doRedraw.call(this);
    };

    _chart.geojson = function(_) {
        if (!arguments.length) {
            return _geojson;
        }
        _geojson = _;
        return _chart;
    };

    _chart.featureOptions = function(_) {
        if (!arguments.length) {
            return _featureOptions;
        }
        _featureOptions = _;
        return _chart;
    };

    _chart.featureKeyAccessor = function(_) {
        if (!arguments.length) {
            return _featureKey;
        }
        _featureKey= _;
        return _chart;
    };

    _chart.featureStyle = function(_) {
        if (!arguments.length) {
            return _featureStyle;
        }
        _featureStyle= _;
        return _chart;
    };

    _chart.popup = function(_) {
        if (!arguments.length) {
            return _popup;
        }
        _popup= _;
        return _chart;
    };

    _chart.renderPopup = function(_) {
        if (!arguments.length) {
            return _renderPopup;
        }
        _renderPopup = _;
        return _chart;
    };

    _chart.brushOn = function(_) {
        if (!arguments.length) {
            return _brushOn;
        }
        _brushOn = _;
        return _chart;
    };

    var processFeatures = function (feature, layer) {
        var v = _dataMap[_chart.featureKeyAccessor()(feature)];
        if (v && v.d) {
            layer.key=v.d.key;
            if (_chart.renderPopup())
                _chart.bindPopupWithMod(layer, _chart.popup()(v.d, feature));
            if (_chart.brushOn())
                layer.on("click", selectFilter);
        }
    };

    var selectFilter = function(e) {
        if (!e.target) {
            return;
        }
        if (!_chart.modKeyMatches(e, _chart.filterMod()))
            return;
        var filter = e.target.key;
        dc.events.trigger(function () {
            _chart.filter(filter);
            dc.redrawAll(_chart.chartGroup());
        });
    };

    return _chart.anchor(parent, chartGroup);
};
