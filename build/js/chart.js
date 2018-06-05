


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
            maxDate: 3000
        };

    var controls = utils.crEl('div', container, {class: 'chart-controls'}),
        canvas = utils.crEl('canvas', container, {class: 'chart'}),
        inputFrom = new Input('from'),
        inputTo = new Input('to'),
        chart = new ChartLine(canvas);




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
            chartDataUpdate();
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

        if (chart.width >= data.length) {
            return data;
        }

        let _data = [],
            q = data.length / chart.width;

        for (let i = 0; i < chart.width; i++) {
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


    function chartDataUpdate() {

        var params = {
            url: options.dataSource,
            quantity: chart.width
        }

        if (self.period.from && self.period.to) {
            params.from = self.period.from + '-01-01';
            params.to = self.period.to + '-12-31';
        }

        self.dataLoading = true;

        Data.get(params, function(d) {
            if (d.stream) {
                data.push(d.stream);
                inputTo.el.value = ('' + d.stream.t).substr(0, 4)
            } else {
                data = d;
            }
            // console.log('data',data);
            // chart.data = data;
            self.dataLoading = false;

            if (!self.period.from) {
                let t = '' + data[0].t;
                inputFrom.value = t.substr(0, 4)
            }
            if (!self.period.to) {
                let t = '' + data.slice(-1)[0].t;
                inputTo.value = t.substr(0, 4)
            }

            let _data = dataCompression(1);

            chart.data = _data;
            chart.dataUpdated = true;
            // document.forms.period.from = startyear;
        });
    }


    chartDataUpdate();





    // this.resize(canvas);

}


