


function Chart(container, options) {

    var self = this;

    this.min = 0;
    this.max = 3000;
    this.from = 0;
    this.to = 0;

    this.period = {
        from: 0,
        to: 0,
        accuracy: 'year'
    }

    self.positionX = 0;
    self.quantityX = 1;
    self.fullQuantityX = 1;
    self.dataState = '';
    self.rateX = 1;
    self.store = 'months';
    self.data = [];

    var params = {
            width: 0,
            height: 0,
            minDate: 0,
            maxDate: 3000,
            padding: [10, 2, 10, 50], //top, right, bottom, left
            fitByWidth: true,
            pointWidth: 1,
            scales: {
                fn: ChartScales,
                renderOn: function() {
                    return (self.dataState === 'visible' || self.dataState === 'done')
                },
                axisY: true,
                axisX: 0,
                axisXHeight: 50,
                linesY: 10, //step
                linesX: true,
                lineColor: '#ccc',
                textColor: '#333'
            },
            days: {
                fn: ChartLine,
                type: 'chart',
                rect: [0, 0, .2, 0],
                renderOn: function() {
                    return self.store == 'days' && (self.dataState === 'visible' || self.dataState === 'done')
                },
                pointWidth: 1,
                borderColor: '#ccc',
                lineColor: '#333'
            },
            months: {
                fn: ChartBars,
                type: 'chart',
                rect: [0, 0, .2, 0],
                renderOn: function() {
                    return self.store == 'months' && (self.dataState === 'visible' || self.dataState === 'done')
                },
                pointWidth: 7,
                margin: 1,
                borderColor: '#ccc',
                barColor: '#aaa'
            },
            map: {
                fn: ChartMap,
                rect: [.85, 0, 0, 0],
                fullData: true,
                averaging: true,
                lineColor: '#666',
                borderColor: '#ccc',
                selectionColor: '#ffdd88'
            }
        };

    var controls,
        canvas,
        inputFrom,
        inputTo,
        activeModules;

    function addControls(minDate, maxDate) {
        controls = utils.crEl('div', container, {class: 'chart-controls'});
        canvas = utils.crEl('canvas', container, {class: 'chart'});
        inputFrom = new Input('from', minDate, maxDate);
        inputTo = new Input('to', minDate, maxDate);

        function _onPeriodSizeSelect() {
            let period = this.getAttribute('period'),
                type = period === 'days' ? 'date' : 'month';

            if (this.classList.contains('active')) {
                // return;
            }
            self.store = period;
            controls.querySelector('.chart-period-size.active').classList.remove('active');
            this.classList.add('active');
            
            inputFrom.type = type;
            inputTo.type = type;
            dataUpdate();
        }

        utils.crEl('button', controls, {
            class: 'chart-period-size active',
            period: 'months',
            txt: 'Months'
        }).addEventListener('click', _onPeriodSizeSelect);

        utils.crEl('button', controls, {
            class: 'chart-period-size',
            period: 'days',
            txt: 'Days'
        }).addEventListener('click', _onPeriodSizeSelect);
    }


    function Input(name, min, max) {
        var input = utils.crEl('input', controls, {
            type: min.length > 7 ? 'date' : 'month',
            name: name,
            class: 'chart-date',
            value: name == 'from' ? min : max,
            min: min,
            max: max
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
            // dataUpdate();
        }

        return {
            el: input,
            set value(v) {
                input.value = v;
                update();
            },
            set type(type) {
                var value = input.value.substr(0, 7);
                if (type === 'date') {
                    value += '-' + (name === 'to' ? utils.daysInMonth(value) : '01');
                }
                input.type = type;
                input.value = value;
                self.fullQuantityX = self.data.length;
                update()
            }
        }
    }


    function calculateCanvasSize() {
        let p = params.padding,
            w, h;

        //reset for resize
        canvas.style.width = null;
        canvas.style.height = null;
        w = canvas.offsetWidth;
        h = canvas.offsetHeight;

        self.ratio = utils.getPixelRatio(canvas.getContext("2d"));
        self.width = w * self.ratio;
        self.height = h * self.ratio;

        canvas.setAttribute('width', self.width);
        canvas.setAttribute('height', self.height);

        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';

        let rect = canvas.getBoundingClientRect();
        canvas.left = rect.left;
        canvas.top = rect.top;

        (activeModules || getAllModulesFromParams()).map(calculateModulePositionAndSize);
    }

    function calculateModulePositionAndSize(mdl) {
        var name = mdl.name || mdl,
            p = params.padding,
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

        if (pn.type === 'chart') {
            self.quantityX = pn.width;
        }

        if (mdl.name) {
            mdl.height = pn.height;
            mdl.width = pn.width;
            mdl.y = pn.y;
            mdl.x = pn.x;
        }
    }

    function getAllModulesFromParams() {
        var modules = [];
        for (let name in params) {
            if (params[name].fn) {
                modules.push(name);
            }
        }
        return modules;
    }

    function addModules() {
        activeModules = [];
        getAllModulesFromParams().map(function(name) {
            let mdl = new params[name].fn(canvas, params);
            mdl.name = name;
            Object.setPrototypeOf(mdl, self);
            for (let p in params[name]) {
                if (p === 'fn') {
                    continue;
                }
                mdl[p] = params[name][p];
                if (mdl.type === 'chart') {
                    mdl.quantityX = mdl.width / ((params[name].margin || 0) + (params[name].pointWidth || 1));
                }
            }
            activeModules.push(mdl);
        });
        console.log('activeModules',activeModules);
    }


    function dataCompression(quantity, averaging) {
        quantity = quantity || self.quantityX;
        if (quantity >= self.fullQuantityX) {
            return self.data;
        }

        let data = self.data,
            _data = [],
            rate = self.fullQuantityX / quantity;

        for (let i = 0, ii = Math.min(data.length, quantity); i < ii; i++) {
            let d = Math.min(Math.round(i * rate), self.fullQuantityX - 1);

            if (averaging) {
                let avr = 0,
                    dd = Math.min(Math.round((i + 1) * rate), self.fullQuantityX - 1);

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
    }

    function getMinMaxValues(_data) {
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

    function renderModules(force) {
        let _data = self.data.slice(self.positionX, self.positionX + self.quantityX),
            minMaxValues = getMinMaxValues(_data);

        if (self.dataState !== 'invisible' || force) {
            cleanupCanvas();
        }

        activeModules.map(function(mdl) {
            // if (params.fitByWidth) {
            // }
            if ((force || self.dataState === 'done') && (!mdl.renderOn || mdl.renderOn())) {
                self.quantityX = mdl.quantityX || self.quantityX;
                if (mdl.fullData) {
                    mdl.data = dataCompression(mdl.width, mdl.averaging);
                    let mmv = getMinMaxValues(mdl.data)
                    mdl.minValue = mmv.min;
                    mdl.maxValue = mmv.max;
                } else {
                    mdl.data = _data;
                    mdl.minValue = minMaxValues.min;
                    mdl.maxValue = minMaxValues.max;
                }
                // console.log('',mdl.name,mdl.width, mdl.pointWidth , mdl.data.length);
                mdl.rateX = Math.max(1, mdl.width / (mdl.pointWidth || 1) / mdl.data.length);
                
                mdl.render();
            }
        });
        
    }

    var cleanupCanvas = function() {
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    function moveChartAni(shift, duration) {
        if (shift === 0) return;
        utils.animate({
            duration: duration || 200,
            timing: 'circ',
            draw: function(progress) {
                moveChart(progress * shift)
                shift = shift - progress * shift;
            }
        });
    }

    function moveChart(shift, duration) {
        if (shift === 0) {
            return;
        }
        if (duration) {
            return moveChartAni(shift, duration);
        }
        var newPositionX = Math.max(self.positionX + shift, 0);
        newPositionX = Math.min(newPositionX, self.fullQuantityX - self.quantityX);
        newPositionX = Math.max(newPositionX, 0);
        if (self.positionX != newPositionX) {
            self.positionX = newPositionX;
            renderModules();
            return true
        }
        return false;
    }
    self.moveChart = moveChart;

    function dataUpdate() {
        if (self.period.from > self.period.to) {
            return;
        }

        var _params = {
                url: options.dataSource,
                quantity: self.quantityX,
                from: self.period.from,
                to: self.period.to,
                store: self.store
            },
            cacheKey = _params.url + self.store + _params.from + _params.to,
            cachedData = utils.cache(cacheKey);


        if (cachedData) {
            self.data = cachedData.data;
            self.dataState = cachedData.dataState;
            self.fullQuantityX = cachedData.data.length;
            renderModules(true);
            return;
        }

        var dataState = '',
            data = [];

        Data.get(_params, function(_data) {
            if (_data.stream) {
                data.push(_data.stream);
                dataState = self.quantityX <= data.length ? 'visible' : 'invisible';
            } else if (_data.state === 'done' || _data.all){
                data = _data.all || data;
                dataState = 'done';
            }

            if (dataState === 'done' || data.length % 100 === 0) {
                utils.cache(cacheKey, {
                    data: data,
                    dataState: dataState
                });
                if (self.store === _data.store) {
                    self.data = data;
                    self.dataState = dataState;
                    self.fullQuantityX = data.length;
                    requestAnimationFrame(renderModules);
                }
            }
        });
    }

    (function init() {
        Data.getMinMaxDates(addControls);

        //Promises can be save us in this row, but they will not because IE
        setTimeout(function() {
            calculateCanvasSize();
            addModules();
            dataUpdate();
            Object.setPrototypeOf(new ChartEvents(canvas, activeModules), self);

            //TODO: add checkup canvas visiblility:
            window.addEventListener('resize', function() {
                calculateCanvasSize();
                renderModules();
            });
            window.addEventListener('scroll', function() {
                let rect = canvas.getBoundingClientRect();
                canvas.left = rect.left;
                canvas.top = rect.top;
            });
        }, 100);
    })()

}


