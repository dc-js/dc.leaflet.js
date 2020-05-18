dc_leaflet.leafletBase = function(Base) {
    var _chart = new Base();

    _chart.margins({left:0, top:0, right:0, bottom:0});

    var _map;

    var _mapOptions=false;
    var _defaultCenter=false;
    var _defaultZoom=false;

    var _popupMod = null;
    var _filterMod = null;

    var _cachedHandlers = {};

    var _createLeaflet = function(root) {
        // append sub-div if not there, to allow client to put stuff (reset link etc.)
        // in main div. might also use relative positioning here, for now assume
        // appending will put in right position
        var child_div = root.selectAll('div.dc-leaflet');
        child_div = child_div.data([0]).enter()
            .append('div').attr('class', 'dc-leaflet')
            .style('width', _chart.effectiveWidth() + "px")
            .style('height', _chart.effectiveHeight() + "px")
            .merge(child_div);
        return L.map(child_div.node(),_mapOptions);
    };

    var _tiles=function(map) {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    };

    _chart.createLeaflet = function(_) {
        if(!arguments.length) {
            return _createLeaflet;
        }
        _createLeaflet = _;
        return _chart;
    };

    _chart._doRender = function() {
        if(! _chart.map()){
            _map = _createLeaflet(_chart.root());
            for(var ev in _cachedHandlers)
                _map.on(ev, _cachedHandlers[ev]);

            if (_defaultCenter && _defaultZoom) {
                _map.setView(_chart.toLocArray(_defaultCenter), _defaultZoom);
            }

            _chart.tiles()(_map);
            _chart._postRender();
        }
        else
            console.warn("WARNING: Leaflet map already rendered.");

        return _chart._doRedraw();
    };

    _chart._doRedraw = function() {
        return _chart;
    };

    _chart._postRender = function() {
        return _chart;
    };

    _chart.mapOptions = function(_) {
        if (!arguments.length) {
            return _mapOptions;
        }
        _mapOptions = _;
        return _chart;
    };

    _chart.center = function(_) {
        if (!arguments.length) {
            return _defaultCenter;
        }
        _defaultCenter = _;
        return _chart;
    };

    _chart.zoom = function(_) {
        if (!arguments.length) {
            return _defaultZoom;
        }
        _defaultZoom = _;
        return _chart;
    };

    _chart.tiles = function(_) {
        if (!arguments.length) {
            return _tiles;
        }
        _tiles = _;
        return _chart;
    };

    _chart.map = function() {
        return _map;
    };

    _chart._isMac = navigator.platform.toUpperCase().includes('MAC');

    _chart._modAssignment = {
        shift: 'shiftKey',
        alt: 'altKey',
        ctrlCmd: _chart._isMac ? 'metaKey' : 'ctrlKey'
    };

    _chart.popupMod = function(_) {
        if (!arguments.length)
            return _popupMod;
        _popupMod = _;
        return _chart;
    };

    _chart.filterMod = function(_) {
        if (!arguments.length)
            return _filterMod;
        _filterMod = _;
        return _chart;
    };

    _chart.modKeyMatches = function(e, modKey) {
        if (modKey)
            return e.originalEvent[_chart._modAssignment[modKey]];
        else
            return !e.originalEvent.shiftKey && !e.originalEvent.altKey &&
                !e.originalEvent.ctrlKey && !e.originalEvent.metaKey;
    };

    _chart.bindPopupWithMod = function(layer, value) {
        layer.bindPopup(value);
        layer.off('click', layer._openPopup);
        layer.on('click', function(e) {
            if (_chart.modKeyMatches(e, _chart.popupMod()))
                layer._openPopup(e);
        });
    };

    _chart.toLocArray = function(value) {
        if (typeof value === "string") {
            // expects '11.111,1.111'
            value = value.split(",");
        }
        // else expects [11.111,1.111]
        return value;
    };

    // combine Leaflet events into d3 & dc events
    const super_on = _chart.on;
    _chart.on = function(event, callback) {
        var leaflet_events = ['zoomend', 'moveend'];
        if(leaflet_events.indexOf(event) >= 0) {
            if(_map) {
                _map.on(event, callback);
            }
            else {
                _cachedHandlers[event] = callback;
            }
            return this;
        }
        else return super_on.call(this, event, callback);
    };

    return _chart;
};
