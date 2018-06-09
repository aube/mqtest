


function Chart(container, options) {

    var positionX = 0,
        quantityX = 1,
        fullQuantityX = 1,
        dataState = '';

    this.min = 0;
    this.max = 3000;
    this.from = 0;
    this.to = 0;

    this.period = {
        from: 0,
        to: 0,
        accuracy: 'year'
    }

    var self = this,
        data = [],
        fullData = [],
        width,
        height,
        params = {
            width: 0,
            height: 0,
            minDate: 0,
            maxDate: 3000,
            padding: [50, 50, 50, 50], //top, right, bottom, left
            fitByWidth: true,
            pointWidth: 1,
            scales: {
                fn: ChartScales,
                renderOn: 'visible',
                axisY: true,
                axisX: 0,
                axisXHeight: 50,
                linesY: 10, //step
                linesX: true,
                lineColor: '#ccc',
                textColor: '#333'
            },
            chart: {
                fn: ChartLine,
                rect: [0, 0, .2, 0],
                renderOn: 'visible',
                borderColor: '#ccc',
                lineColor: '#333'
            },
            map: {
                fn: ChartMap,
                events: {
                    click: function(x, y) {
                        const INDENT = 10;
                        moveChart(((x - this.x - INDENT) / quantityX) * fullQuantityX - positionX);
                    }
                },
                rect: [.85, 0, 0, 0],
                fullData: true,
                lineColor: '#666',
                borderColor: '#ccc',
                selectionColor: '#ffdd88',
                position: 'after', //'after' || 'before', default is 'after'
                height: 20 //percents
            }
        };


    var controls = utils.crEl('div', container, {class: 'chart-controls'}),
        canvas = utils.crEl('canvas', container, {class: 'chart'}),
        inputFrom = new Input('from'),
        inputTo = new Input('to'),
        activeModules = [];




    function calculatePositionAndSizes(name) {
        var p = params.padding,
            pn = params[name],
            pos = 0;

        pn.padding = utils.copyObj(p);

        pn.height = canvas.height;
        pn.width = canvas.width;

        for (var pos = 0; pos < 4; pos++) {
            if (!pn.rect || !pn.rect[pos]) {
                continue;
            }

            if (+pn.rect[pos] >= 1) {
                pn.padding[pos] = +pn.rect[pos];
            //percents:
            } else if (pos % 2 === 0) {
                pn.padding[pos] = Math.round(+pn.rect[pos] * pn.height);
            } else {
                pn.padding[pos] = Math.round(+pn.rect[pos] * pn.width);
            }
            pn.padding[pos] = Math.max(pn.padding[pos], p[pos]);
        };

        pn.height = pn.height - pn.padding[0] - pn.padding[2];
        pn.width = pn.width - pn.padding[1] - pn.padding[3];
        pn.y = pn.padding[0];
        pn.x = pn.padding[3];

        if (name == 'chart') {
            quantityX = pn.width;
        }
    }

    function resize() {
        let p = params.padding,
            pc = params.chart.padding;

        canvas.style.width = '100%';
        canvas.style.height = '100%';

        self.width = canvas.offsetWidth;
        self.height = canvas.offsetHeight;

        canvas.setAttribute('width', parseInt(self.width));
        canvas.setAttribute('height', parseInt(self.height));
        canvas.style.width = parseInt(self.width) + 'px';
        canvas.style.height = parseInt(self.height) + 'px';

        getAllModules().map(calculatePositionAndSizes);
    }

    function getAllModules() {
        var modules = [];
        for (let name in params) {
            if (params[name].fn) {
                modules.push(name);
            }
        }
        return modules;
    }

    function addModules() {
        getAllModules().map(function(name) {
            let mdl = new params[name].fn(canvas, params);
            mdl.name = name;
            for (let p in params[name]) {
                if (p === 'fn') {
                    continue;
                }
                if (p === 'events') {
                    for (let event in params[name][p]) {
                        mdl[event] = params[name][p][event];
                    }
                    continue;
                }
                mdl[p] = params[name][p];
            }
            activeModules.push(mdl);
        });
    }

    function Input(name) {
        var input = utils.crEl('input', controls, {
            type: 'number',
            name: name,
            value: hash[name]
        });

        input.addEventListener('keyup', update);
        input.addEventListener('change', update);
        input.addEventListener('mouseup', update);
        self.period[name] = input.value;

        function update() {
            if (self.period[name] == input.value) {
                return;
            }
            self.period[name] = input.value;
            hash[name] = input.value;
            hash.update();
            dataUpdate();
        }

        return {
            el: input,
            set value(v) {
                input.value = v;
                update();
            }
        }
    }


    function dataCompression(averaging) {
        if (quantityX >= fullQuantityX) {
            return data;
        }

        let _data = [],
            rate = fullQuantityX / quantityX;

        for (let i = 0; i < quantityX; i++) {
            let d = Math.min(Math.round(i * rate), fullQuantityX - 1);

            if (averaging) {
                let avr = 0,
                    dd = Math.min(Math.round((i + 1) * rate), fullQuantityX - 1);

                for (let a = d; a <= dd; a++) {
                    avr += +data[a].v;
                }
                _data.push({
                    t: data[d].t,
                    v: avr / Math.max(1, dd - d)
                });
            } else {
                _data.push(data[d]);
            }
        }
        return _data;
    }

    function getMinMaxValues(data) {
        let min = Infinity,
            max = -Infinity;

        //min/max update for compressed data
        for (var i = data.length - 1; i >= 0; i--) {
            min = Math.min(min, +data[i].v);
            max = Math.max(max, +data[i].v);
        }

        return {
            min: min,
            max: max
        }
    }


    function renderModules() {
        let _data = data.slice(positionX, positionX + quantityX),
            rateX = 1,
            minMaxValues = getMinMaxValues(_data);

        if (params.fitByWidth) {
            rateX = Math.max(1, params.chart.width / params.pointWidth / _data.length);
        }

        if (dataState !== 'invisible') {
            cleanup();
        }

        activeModules.map(function(mdl) {
            if (dataState === 'done' || mdl.renderOn === dataState || !mdl.renderOn) {
                if (mdl.fullData) {
                    mdl.data = dataCompression(mdl.avaraging);
                    let mmv = getMinMaxValues(mdl.data)
                    mdl.minValue = mmv.min;
                    mdl.maxValue = mmv.max;
                } else {
                    mdl.data = _data;
                    mdl.minValue = minMaxValues.min;
                    mdl.maxValue = minMaxValues.max;
                }
                mdl.rateX = rateX;
                mdl.dataState = dataState;
                mdl.positionX = positionX;
                mdl.quantityX = quantityX;
                mdl.fullQuantityX  = fullQuantityX;

                //sizes
                mdl.padding = params[mdl.name].padding;
                mdl.width = params[mdl.name].width;
                mdl.height = params[mdl.name].height;
                mdl.x = params[mdl.name].x;
                mdl.y = params[mdl.name].y;

                mdl.render(dataState);
            }
        });
        
    }

    var cleanup = function() {
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }


    function moveChart(shift) {
        shift = shift || 100;
        utils.animate({
            duration: 200,
            timing: 'circ',
            draw: function(progress) {
                positionX = Math.max(positionX + progress * shift, 0);
                positionX = Math.min(positionX, fullQuantityX - quantityX);
                positionX = Math.max(positionX, 0);
                shift = shift - progress * shift;
                renderModules();
            }
        });
    }


    function dataUpdate() {
        data = [];
        if (self.period.from > self.period.to) {
            return;
        }

        var _params = {
            url: options.dataSource,
            quantity: quantityX,

            from: (self.period.from || 1881) + '-01-01',
            to: (self.period.to || 1890) + '-12-31'
        }

        // if (self.period.from && self.period.to) {
        //     _params.from = self.period.from + '-01-01';
        //     _params.to = self.period.to + '-12-31';
        // }

        dataState = '';


        Data.get(_params, function(d) {
            // if (dataState == 'done') return;

            if (d.stream) {
                data.push(d.stream);
                // inputTo.el.value = ('' + d.stream.t).substr(0, 4)
            } else if (d !== 'done'){
                data = d;
            }

            // console.log('data',data);
            // chart.data = data;

            // if (!self.period.from) {
            //     let t = '' + data[0].t;
            //     inputFrom.value = t.substr(0, 4)
            // }
            // if (!self.period.to) {
            //     let t = '' + data.slice(-1)[0].t;
            //     inputTo.value = t.substr(0, 4)
            // }

            fullQuantityX = data.length;
            if (d === 'done') {
                dataState = 'done';
            } else {
                dataState = params.chart.width ? 'visible' : 'invisible';
            }

            requestAnimationFrame(renderModules);
        });
    }

    (function init() {

        resize();
        addModules();
        dataUpdate();

    })();



    window.addEventListener('resize', function() {
        resize();
        renderModules();
    });

    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        moveChart(20 * (e.deltaY > 0 ? -1 : 1));
    });

    function targetModuleEvents(event, x, y) {
        // console.log('',x, y);
        activeModules.map(function(mdl) {
            if (mdl[event] &&
                mdl.x <= x && mdl.x + mdl.width >= x &&
                mdl.y <= y && mdl.y + mdl.height >= y) {
                mdl[event].call(mdl, x, y);
            }
        })
    }

    canvas.addEventListener('click', function(e) {
        targetModuleEvents('click', e.offsetX, e.offsetY);
    });


}


