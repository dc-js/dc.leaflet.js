dc_leaflet.d3 = d3;
dc_leaflet.dc = dc;

return dc_leaflet;
}
    if (typeof define === 'function' && define.amd) {
        define(["dc", "d3", "leaflet", "leaflet.markercluster"], _dc_leaflet);
    } else if (typeof module == "object" && module.exports) {
        var _dc = require('dc');
        var _d3 = require('d3');
        var L = require('leaflet');
        var lmc = require('leaflet.markercluster');
        module.exports = _dc_leaflet(_dc, _d3, L);
    } else {
        this.dc_leaflet = _dc_leaflet(dc, d3, this.L);
    }
}
)();
