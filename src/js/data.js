window.Data = {
    cache: (function() {
        var storage = {};

        return function(key, value, lifetime) {
            if (arguments.length === 1) {
                return storage[key];
            }

            lifetime = lifetime || 1e5;
            storage[key] = value;

            if (lifetime > 0) {
                setTimeout(function() {
                    delete storage[key];
                }, lifetime)
            }
        }
    })(),

    load: function(url, cb) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    this.data = JSON.parse(this.responseText);
                    Data.cache(url, this.data);
                    cb.call(this, this.data);
                } else {
                    //throw error
                }
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    },

    select: function(data, start, end) {
        function _daysBetween(d0, d1) {
            d0 = d0.split('-');
            d1 = d1.split('-');
            var days = (d0[0] - d1[0]) * 365.242199 + 
                (d0[1] - d1[1]) * 30.4368499 + 
                (d0[2] - d1[2]);
            return Math.round(days);
        }

        var min = data[0].t,
            max = data[data.length - 1].t,
            shift = Math.max(0, _daysBetween(start, min)),
            amount = _daysBetween(end, start);
        

        // while (start != data[shift].t && data[shift].t) {
        //     shift += 1 * (start > data[shift].t ? 1 : -1);
        // }
        // while (end != data[shift + amount - 1].t && data[shift + amount - 1].t) {
        //     amount += 1 * (start > data[shift + amount - 1].t ? 1 : -1);
        // }
        return data.slice(shift, shift + amount);
    },



    get: function(params, cb) {
        if (Data.cache(params.url)) {
            cb.call(this, 
                Data.select(
                    Data.cache(params.url),
                    params.start,
                    params.end
                )
            );
            return;
        }

        Data.load(params.url, function(data) {
            cb.call(this, 
                Data.select(
                    data,
                    params.start,
                    params.end
                )
            );
        });
        // cb.call(this);
    }
}


