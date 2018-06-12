


function Chart(container, options) {

    var self = this;

    this.period = {
        from: 0,
        to: 0
    }

    self.positionX = 0;
    self.visiblePoints = 1;
    self.allPoints = 1;
    self.dataState = '';
    self.rateX = 1;
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
                axisY: true,
                axisX: 0,
                axisXHeight: 50,
                linesY: 10, //step
                linesX: true,
                lineColor: '#ccc',
                textColor: '#333'
            },
            months: {
                fn: ChartBars,
                type: 'chart',
                rect: [0, 0, .2, 0],
                pointWidth: 7,
                margin: 1,
                borderColor: '#ccc',
                barColor: '#aaa'
            },
            days: {
                fn: ChartLine,
                active: true,
                type: 'chart',
                rect: [0, 0, .2, 0],
                pointWidth: 1,
                margin: 0,
                borderColor: '#ccc',
                lineColor: '#333'
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
        connectedModules;


    /**
     * Cleanup all canvas
     */
    function _renderAllModules(force) {
        let _data = self.data.slice(self.positionX, self.positionX + self.visiblePoints),
            minMaxValues = utils.getMinMaxValues(_data);

        self.minValue = minMaxValues.min;
        self.maxValue = minMaxValues.max;

        if (self.dataState !== 'invisible' || force) {
            _cleanupCanvas();
        }

        connectedModules.map(function(mdl) {
            mdl.data = _data;
            mdl.render(force || self.dataState === 'done');
        });
    }

    /**
     * Cleanup all canvas
     */
    var _cleanupCanvas = function() {
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }


    /**
     * Animation for moveChart()
     * @param  {Number} shift    [in chart points]
     * @param  {Number} duration [for animation]
     */
    function _moveChartAni(shift, duration) {
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


    /**
     * Public method for change graph start position
     * @param  {Number} shift    [in chart points]
     * @param  {Number} duration [for animation]
     * @return {Boolean}
     */
    function moveChart(shift, duration) {
        if (shift === 0) {
            return;
        }
        if (duration) {
            return _moveChartAni(shift, duration);
        }
        var newPositionX = Math.max(self.positionX + shift, 0);
        newPositionX = Math.min(newPositionX, self.allPoints - self.visiblePoints);
        newPositionX = Math.max(newPositionX, 0);
        if (self.positionX != newPositionX) {
            self.positionX = newPositionX;
            _renderAllModules();
            return true
        }
        return false;
    }
    self.moveChart = moveChart;


    function _dataUpdate() {
        if (self.period.from > self.period.to) {
            return;
        }

        var _params = {
                url: options.dataSource,
                quantity: self.visiblePoints,
                from: self.period.from + '-01' + (self.store === 'days' ? '-01' : ''),
                to: self.period.to + '-12' + (self.store === 'days' ? '-31' : ''),
                store: self.store
            },
            cacheKey = _params.url + self.store + _params.from + _params.to,
            cachedData = utils.cache(cacheKey);

        if (cachedData) {
            self.data = cachedData.data;
            self.dataState = cachedData.dataState;
            self.allPoints = cachedData.data.length;
            _renderAllModules(true);
            return;
        }

        var dataState = '',
            data = [],
            c = 0;

        Data.get(_params, function(_data) {
            if (_data.stream) {
                data.push(_data.stream);
                dataState = self.visiblePoints <= data.length ? 'visible' : 'invisible';
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
                    self.allPoints = data.length;
                    requestAnimationFrame(_renderAllModules);
                }
            }
        });
    }

    function _onChartModuleActivation(name) {
        self.store = name;
        
        _dataUpdate();
    }


    /**
     * Chart initialisation:
     * build interface, binding events
     */
    (function init() {
        Data.getMinMaxDates(_addControls);

        //Promises can be save us in this row, but they will not because IE
        setTimeout(function() {
            _calculateCanvasSize();
            _addModules();
            // _dataUpdate();
            Object.setPrototypeOf(new ChartEvents(canvas, connectedModules), self);

            //TODO: add checkup canvas visiblility:
            window.addEventListener('resize', function() {
                _calculateCanvasSize();
                _renderAllModules();
            });
            window.addEventListener('scroll', function() {
                let rect = canvas.getBoundingClientRect();
                canvas.left = rect.left;
                canvas.top = rect.top;
            });
        }, 100);


        function _addControls(minDate, maxDate) {
            controls = utils.crEl('div', container, {class: 'chart-controls'});
            canvas = utils.crEl('canvas', container, {class: 'chart'});
            new Input('from', minDate, maxDate);
            new Input('to', minDate, maxDate);

            function _chartModuleActivation(e) {
                let mdl = this.getAttribute('chart-module');

                if (e && this.classList.contains('active')) {
                    return;
                }

                controls.querySelector('.chart-module-button.active').classList.remove('active');
                this.classList.add('active');
                _onChartModuleActivation(mdl);
            }

            _getAllModulesFromParams('chart').map(function(name) {
                let btn = utils.crEl('button', controls, {
                    class: 'chart-module-button' + (params[name].active ? ' active' : ''),
                    'chart-module': name,
                    txt: name
                });
                btn.addEventListener('click', _chartModuleActivation);
                if (params[name].active) {
                    _chartModuleActivation.call(btn);
                }
            })
        }


        function Input(name, min, max) {
            var input = utils.crEl('input', controls, {
                type: 'number',
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
                // _dataUpdate();
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
                    self.allPoints = self.data.length;
                    update()
                }
            }
        }


        function _calculateCanvasSize() {
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

            (connectedModules || _getAllModulesFromParams()).map(_calculateModulePositionAndSize);
        }


        function _calculateModulePositionAndSize(mdl) {
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
                self.visiblePoints = pn.width;
            }

            if (mdl.name) {
                mdl.height = pn.height;
                mdl.width = pn.width;
                mdl.y = pn.y;
                mdl.x = pn.x;
            }
        }


        function _getAllModulesFromParams(type) {
            var modules = [];
            for (let name in params) {
                if (params[name].fn && (!type || type === params[name].type)) {
                    modules.push(name);
                }
            }
            return modules;
        }


        function _addModules() {
            connectedModules = [];
            _getAllModulesFromParams().map(function(name) {
                let mdl = new params[name].fn(canvas, params);
                mdl.name = name;
                Object.setPrototypeOf(mdl, self);
                for (let p in params[name]) {
                    if (p === 'fn') {
                        continue;
                    }
                    mdl[p] = params[name][p];
                }
                connectedModules.push(mdl);
            });
        }

    })()
}


