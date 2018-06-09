
    var Charts = [{
            id: 'temperature',
            dataSource: '/temperature.json',
            title: 'Температура'
        }, {
            id: 'precipitation',
            dataSource: '/precipitation.json',
            title: 'Осадки'
        }],
        // hash = window.location.hash.substr(1).split(','),
        // activeChart = hash[0] || CHARTS[0].id,
        MIN_YEAR = 1881,
        MAX_YEAR = 2006;


    var hash = new function() {
        this.update = function() {
            var _chart = tabs.active.chart;
            this.chart = _chart.id;
            this.from = _chart.ctrl.period.from;
            this.to = _chart.ctrl.period.to;

            location.hash = [this.chart, this.from, this.to].filter(function(v) {
                return !!v
            }).join(',');
        }

        let _h = location.hash.substr(1).split(',');
        this.chart = _h[0];
        this.from = _h[1];
        this.to = _h[2] || _h[1];
    }


    var tabs = {
        map: {},

        onActivate: setActiveChart,

        active: '',

        setActive: function(id) {
            if (tabs.active) {
                tabs.active.tab.classList.remove('active');
                tabs.active.content.classList.remove('active');
            }
            tabs.map[id].tab.classList.add('active');
            tabs.map[id].content.classList.add('active');
            tabs.active = tabs.map[id];
            if (tabs.onActivate) {
                tabs.onActivate.apply(tabs.map[id].chart);
            }
            hash.update();
        },

        create: function(chart) {
            var tab = utils.crEl('li', 'nav > ul');

            chart.container = utils.crEl('div', 'main', {class: 'chart-container'});

            tabs.map[chart.id] = {
                tab: tab,
                content: chart.container,
                chart: chart
            }

            tab.innerText = chart.title;

            tab.addEventListener('click', function() {
                tabs.setActive(chart.id);
            });

            return tab;
        }
    }



        // var html = '<input '
        // chartContainer.insertAdjacentHTML('afterbegin', html);

        // chart.ctrl = new Chart(chart.canvas);
        // chart.rect = chart.canvas.getBoundingClientRect();

    function getActiveChart() {
        return Charts.filter(function(chart) {
            return chart.active;
        })[0];
    }

    function setActiveChart() {
        var chart = this;

        //first load
        //container class '.loadind' should be set for content size calc on init
        if (!chart.ctrl) {
            chart.container.classList.add('loading')
            chart.ctrl = new Chart(chart.container, chart);
            chart.container.classList.remove('loading')
        }



        // hash[0] = chart.id;
        // window.location.hash = hash.join();

        // chart.ctrl.resize();

        // if (!chart.data) {
        //     chartDataUpdate(chart);
        // } else {
        //     chart.ctrl.render(chart.data);
        // }

        // console.log('',document.forms.period.start);
    }


    function init() {

        // period.start.init(hash[1] || MIN_YEAR);
        // period.end.init(hash[2] || MAX_YEAR);

        Charts.map(function(chart) {

            var tab = tabs.create(chart);

            // chart.ctrl = new Chart(chart.canvas);
            // chart.rect = chart.canvas.getBoundingClientRect();

            // if (activeChart === chart.id) {
            //     chart.active = true;
            //     // setActiveChart.call(chart);
            // }

            // chart.canvas.onmousemove = function(e) {
            //     // important: correct mouse position:
            //     var x = e.clientX - chart.ctrl.rect.left,
            //         y = e.clientY - chart.ctrl.rect.top;

            //     let res = chart.ctrl.getByPoint(x, y);
            //     // console.log('res',res);
            //     // ctx.clearRect(0, 0, canvas.width, canvas.height); // for demo

            //     // while(r = rects[i++]) {
            //     //     // add a single rect to path:
            //     //     ctx.beginPath();
            //     //     ctx.rect(r.x, r.y, r.w, r.h);
                    
            //     //     // check if we hover it, fill red, if not fill it blue
            //     //     ctx.fillStyle = ctx.isPointInPath(x, y) ? "red" : "blue";
            //     //     ctx.fill();
            //     // }
            // };

        });

        tabs.setActive(hash.chart || Charts[0].id);

        // window.addEventListener('resize', function() {
        //     getActiveChart().ctrl.render();
        // });


    }



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
                    cb.call(this, this.data);
                } else {
                    //throw error
                }
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

}