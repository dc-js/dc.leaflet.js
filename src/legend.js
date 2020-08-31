//Legend code adapted from http://leafletjs.com/examples/choropleth.html
dc_leaflet.legend = function() {
    var _parent, _legend = {};
    var _leafletLegend = null;
    var _position = 'bottomleft';
    var _legendTitle = false;

    _legend.parent = function (parent) {
        if(!arguments.length)
            return _parent;
        _parent = parent;
        return this;
    };

    function _LegendClass() {
        return L.Control.extend({
            options: {position: _position},
            onAdd: function (map) {
                if (map.legend)
                    map.legend.setContent("");
                else
                    map.legend = this;
                this._div = L.DomUtil.create('div', 'info legend');
                map.on('moveend',this._update,this);
                this._update();
                return this._div;
            },
            setContent: function (content) {
                return this.getContainer().innerHTML = content;
            },
            _update: function () {
                if (!_parent.colorDomain)
                    console.warn('legend not supported for this dc.leaflet chart type, ignoring');
                else {
                    var minValue = _parent.colorDomain()[0],
                        maxValue = _parent.colorDomain()[1],
                        palette = _parent.colors().range(),
                        colorLength = _parent.colors().range().length,
                        delta = (maxValue - minValue)/colorLength,
                        i;

                    // define grades for legend colours
                    // based on equation in dc.js colorCalculator (before version based on colorMixin)
                    var grades = [];
                    grades[0] = Math.round(minValue);
                    for (i= 1; i < colorLength; i++) {
                        grades[i] = Math.round((0.5 + (i - 1)) * delta + minValue);
                    }

                    var div = L.DomUtil.create('div', 'info legend');
                    if (_legendTitle)
                        this._div.innerHTML = "<strong>" + _legendTitle + "</strong><br/>";
                    else
                        this._div.innerHTML = ""; //reset so that legend is not plotted multiple times
                    // loop through our density intervals and generate a label with a colored
                    // square for each interval
                    for (i = 0; i < grades.length; i++) {
                        this._div.innerHTML +=
                            '<i style="background:' + palette[i] + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }
                }
            }
        });
    }

    _legend.LegendClass = function(LegendClass) {
        if(!arguments.length)
            return _LegendClass;
        _LegendClass = LegendClass;
        return _legend;
    };

    _legend.legendTitle = function(_) {
        if(!arguments.length)
            return _legendTitle;
        _legendTitle = _;
        return _legend;
    };

    _legend.render = function () {
        // unfortunately the dc.js legend has no concept of redraw, it's always render
        if(!_leafletLegend) {
            // fetch the legend class creator, invoke it
            var Legend = _legend.LegendClass()();
            // and constuct that class
            _leafletLegend = new Legend();
            _leafletLegend.addTo(_parent.map());
        }

        return _legend.redraw();
    };

    _legend.redraw = function () {
        _leafletLegend._update();
        return _legend;
    };

    _legend.leafletLegend = function () {
        return _leafletLegend;
    };

    _legend.position = function (position) {
        if(!arguments.length) return _position;
        _position = position;
        return _legend;
    };

    return _legend;
};