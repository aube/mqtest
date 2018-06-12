
utils = {
    crEl: function(name, container, attributes) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        var el = document.createElement(name);
        container.appendChild(el);
        if (attributes) {
            for (var a in attributes) {
                el.setAttribute(a, attributes[a]);
                if (a === 'txt' || a === 'innerText') {
                    el.innerText = attributes[a];
                }
            }
        }
        return el;
    },

    animate: function(options, cb) {
        var start = performance.now(),
            timings = {
                pow2: function(progress) {
                    return Math.pow(progress, 2);
                },
                pow5: function(progress) {
                    return Math.pow(progress, 5);
                },
                circ: function(progress) {
                    return 1 - Math.sin(Math.acos(progress));
                },
                linear: function(progress) {
                    return progress;
                },
                makeEaseOut: function(timing) {
                    timing = timings[timing || 'pow2'];
                    return function(progress) {
                        return 1 - timing(1 - progress);
                    }
                }
            },
            timing = timings.makeEaseOut();
            

        if (options.timing) {
            timing = timings[options.timing];
        }

        requestAnimationFrame(function _animate(time) {
            var timeFraction = Math.min(1, (time - start) / options.duration),
                progress = timing(timeFraction);

            options.draw(progress);

            if (timeFraction < 1) {
                requestAnimationFrame(_animate);
            } else if (cb) {
                cb();
            }
        });
    },

    ym: function(dateString) {
        return dateString.substr(0, 7);
    },

    copyObj: function (o) {
        if (!o || typeof o !== 'object')
            return o;

        var d = o instanceof Array ? [] : Object.create(Object.getPrototypeOf(o)),
            keys = Object.getOwnPropertyNames(o);

        for (var i = 0, n = keys.length; i < n; ++i) {
            var key = keys[i];
            Object.defineProperty(d, key, Object.getOwnPropertyDescriptor(o, key));
        }

        return d;
    },

    daysBetween: function(d0, d1) {
        d0 = d0.split('-');
        d1 = d1.split('-');
        var days = (d0[0] - d1[0]) * 365.242199 + 
            (d0[1] - d1[1]) * 30.4368499 + 
            (d0[2] - d1[2]);
        return Math.round(days);
    },

    daysInMonth: function(dateString) {
        var days = [31, 28, 31, 30, 31, 31, 30, 31, 30, 31, 30, 31],
            d = dateString.split('-'),
            y = +d[0],
            m = +d[1] - 1;

        return days[m] + (m === 1 ? +(y % 4) : 0);
    },


    /**
     * Simple [key:value] storage with defined values lifetime
     *
     * @param {String} key
     * @param {something} value
     * @param {Number} lifetime in ms
     */
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

    /**
     * XMLHttpRequest
     *
     * @param {Object} params {url: '', from: '', to: ''}
     * @param {Function} cb
     */
    xhr: function(params, cb) {
        var url = params.url,
            query = [];

        for (var key in params) {
            if (key !== 'url') {
                query.push(key + '=' + params[key]);
            }
        }

        if (query.length) {
            url += '?' + query.join('&');
        }

        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    this.data = JSON.parse(this.responseText);
                    utils.cache(url, this.data);
                    cb.call(this, {
                        id: params.id,
                        all: this.data
                    });
                } else {
                    //throw error
                }
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    },

    getPixelRatio: function(ctx) {
        var dpr = window.devicePixelRatio || 1,
            bsr = ctx.webkitBackingStorePixelRatio ||
                  ctx.mozBackingStorePixelRatio ||
                  ctx.msBackingStorePixelRatio ||
                  ctx.oBackingStorePixelRatio ||
                  ctx.backingStorePixelRatio || 1;

        return dpr / bsr;
    },

    state: (function() {
        var el = document.getElementById('data-state');
        return function(txt) {
            el.innerText = txt || '';
        }
    })(),


    dataCompression: function(data, quantity, averaging) {
        if (quantity >= data.length) {
            return data;
        }

        let _data = [],
            step = data.length / quantity;

        for (let i = 0, ii = Math.min(data.length, quantity); i < ii; i++) {
            let d = Math.min(Math.round(i * step), data.length - 1);

            if (averaging) {
                let avr = 0,
                    dd = Math.min(Math.round((i + 1) * step), data.length - 1);

                for (let a = d; a <= dd; a++) {
                    avr += +(data[a] || {}).v;
                }

                _data.push({
                    t: data[d].t,
                    v: avr / Math.max(1, dd - d)
                });
            } else {
                _data.push(data[d] || {v: 0});
            }
        }
        return _data;
    },

    getMinMaxValues: function(_data) {
        let min = Infinity,
            max = -Infinity;

        for (var i = _data.length - 1; i >= 0; i--) {
            min = Math.min(min, +_data[i].l || +_data[i].v);
            max = Math.max(max, +_data[i].h || +_data[i].v);
        }

        if (!_data.length) {
            return {min: -1, max: 1};
        }

        return {
            min: min,
            max: max
        }
    }

}