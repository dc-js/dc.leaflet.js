dc_leaflet.leafletBase = function(_chart) {
    _chart = dc.marginMixin(dc.baseChart(_chart));

    _chart.margins({left:0, top:0, right:0, bottom:0});

    var _map;

    var _mapOptions=false;
    var _defaultCenter=false;
    var _defaultZoom=false;

    var _cachedHandlers = {};

    var _createLeaflet = function(root) {
        // append sub-div if not there, to allow client to put stuff (reset link etc.)
        // in main div. might also use relative positioning here, for now assume
        // appending will put in right position
        var child_div = root.append('div')
            .attr('class', 'dc-leaflet')
            .style('width', _chart.effectiveWidth() + "px")
            .style('height', _chart.effectiveHeight() + "px");

        return L.map(child_div.node(),_mapOptions);
    };

    var _tiles=function(map) {
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
        _map = _createLeaflet(_chart.root());
        for(var ev in _cachedHandlers)
            _map.on(ev, _cachedHandlers[ev]);

        if (_defaultCenter && _defaultZoom) {
            _map.setView(_chart.toLocArray(_defaultCenter), _defaultZoom);
        }

        _chart.tiles()(_map);

        _chart._postRender();

        return _chart._doRedraw();
    };

    _chart._postRender = function() {
        //abstract
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

    _chart.toLocArray = function(value) {
        if (typeof value === "string") {
            // expects '11.111,1.111'
            value = value.split(",");
        }
        // else expects [11.111,1.111]
        return value;
    };

    // combine Leaflet events into d3 & dc events
    dc.override(_chart, 'on', function(event, callback) {
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
        else return _chart._on(event, callback);
    });

    return _chart;
};
