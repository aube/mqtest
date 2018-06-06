


function Chart(container, options) {



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
        width,
        height,
        // options = {
        //     noScroll: true,
        //     yAxisPx: 100,
        //     xAxisPx: 100,
        // },
        //calcs on init
        params = {
            width: 0,
            height: 0,
            minDate: 0,
            maxDate: 3000,
            padding: [50, 50, 50, 50], //top, right, bottom, left
            scales: {
                axisY: true,
                axisX: 0,
                linesY: 10,
                lineColor: '#ccc'
            },
            chart: {
                lineColor: '#333',
                fitByWidth: true,
                pointWidth: 1
            }
        };

    params.chart.margin = [
        params.padding[0],
        params.padding[1],
        params.padding[2],
        params.padding[3]
    ]


    var controls = utils.crEl('div', container, {class: 'chart-controls'}),
        canvas = utils.crEl('canvas', container, {class: 'chart'}),
        inputFrom = new Input('from'),
        inputTo = new Input('to'),
        chartModules = [];


    function resize() {

        self.width = canvas.offsetWidth;
        self.height = canvas.offsetHeight;
        // canvas.rect = canvas.getBoundingClientRect();
        // height = document.body.clientHeight - canvas.rect.top;
        // height = Math.min(canvas.offsetWidth / 16 * 9, height);

        canvas.setAttribute('width', parseInt(self.width));
        canvas.setAttribute('height', parseInt(self.height));
        canvas.style.width = parseInt(self.width) + 'px';
        canvas.style.height = parseInt(self.height) + 'px';

        params.chart.width = canvas.width - params.chart.margin[1] - params.chart.margin[3];
        params.chart.height = canvas.height - params.chart.margin[0] - params.chart.margin[2];

    }
    resize();
    chartModules.push(new ChartScales(canvas, params));
    chartModules.push(new ChartLine(canvas, params.chart));


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

        if (canvas.width >= data.length) {
            return data;
        }

        let _data = [],
            q = data.length / canvas.width;

        for (let i = 0; i < canvas.width; i++) {
            let d = Math.min(Math.round(i * q), data.length - 1);

            if (averaging) {
                let avr = 0,
                    dd = Math.min(Math.round((i + 1) * q), data.length - 1);

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

    function setDataToChartModules(data, done) {
        let _data = dataCompression(1),
            _min = Infinity,
            _max = -Infinity;

        for (var i = _data.length - 1; i >= 0; i--) {
            _min = Math.min(_min, +_data[i].v);
            _max = Math.max(_max, +_data[i].v);
        }

        cleanup();

        chartModules.map(function(module) {
            module.data = {array: _data, minValue: _min, maxValue: _max};
            // module.cleanup();
            module.render(done);
        });
        
    }

    var cleanup = function() {
        var ctx = canvas.getContext("2d");
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    function dataUpdate() {

        data = [];
        if (self.period.from > self.period.to) {
            return;
        }

        var _params = {
            url: options.dataSource,
            quantity: params.chart.width
        }

        if (self.period.from && self.period.to) {
            _params.from = self.period.from + '-01-01';
            _params.to = self.period.to + '-12-31';
        }

        var dataLoaded = 0;

        console.log('_params',_params);

        Data.get(_params, function(d) {
            if (dataLoaded) return;
            if (d.stream) {
                data.push(d.stream);
                // inputTo.el.value = ('' + d.stream.t).substr(0, 4)
            } else if (d !== 'done'){
                data = d;
            }

            // console.log('data',data);
            // chart.data = data;

            if (!self.period.from) {
                let t = '' + data[0].t;
                inputFrom.value = t.substr(0, 4)
            }
            if (!self.period.to) {
                let t = '' + data.slice(-1)[0].t;
                inputTo.value = t.substr(0, 4)
            }

            if (d === 'done') {
                setDataToChartModules(data, true);
                dataLoaded = 1;
            } else {
                requestAnimationFrame(function() {
                    setDataToChartModules(data, dataLoaded);
                });
            }

            // document.forms.period.from = startyear;
        });
    }


    dataUpdate();





    // this.resize(canvas);

}


