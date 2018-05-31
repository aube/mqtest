
    document.getElementById('temperature-trigger');
    document.getElementById('precipitation-trigger');

    // var canvas = document.querySelector("#chart");


    var CHARTS = [{
            id: 'temperature',
            dataSource: '/temperature.json',
            title: 'Температура'
        }, {
            id: 'precipitation',
            dataSource: '/precipitation.json',
            title: 'Осадки'
        }],
        hash = window.location.hash.substr(1).split(','),
        activeChart = hash[0] || CHARTS[0].id,
        MIN_YEAR = 1881,
        MAX_YEAR = 2006;



    var period = {
        start: new Input('start'),
        end: new Input('end')
    }

    function Input(name) {
        var _t = this,
            input = document.forms.period[name];

        this.set = function(value) {
            if (!+value) {
                return;
            }
            _t.value = +value;
            input.value = +value;
        }

        this.update = function() {
            _t.set(input.value);

            if (name === 'start' && input.value > period.end.value) {
                period.end.set(input.value);
            }
            if (name === 'end' && input.value < period.start.value) {
                period.start.set(input.value);
            }

            hash[1] = period.start.value;
            hash[2] = period.end.value;
            window.location.hash = hash.join();
            chartDataUpdate();
        }

        this.init = function(value) {
            _t.value = value;
            input.value = value;
            input.addEventListener('keyup', period[name].update);
            input.addEventListener('change', period[name].update);
            input.addEventListener('click', period[name].update);
        }
    }

    function chartDataUpdate(chart) {
        chart = chart || getActiveChart() || this;

        var params = {
            url: chart.dataSource,
            start: period.start.value + '-01-01',
            end: period.end.value + '-12-31'
        }

        Data.get(params, function(data) {
            chart.data = data;

            chart.ctrl.render(chart.data);
            // document.forms.period.start.value = startyear;
        });
    }

    function getActiveChart() {
        return CHARTS.filter(function(chart) {
            return chart.active;
        })[0];
    }

    function setActiveChart() {
        var chart = this,
            _ac = getActiveChart();

        hash[0] = chart.id;
        window.location.hash = hash.join();

        if (_ac) {
            _ac.trigger.classList.remove('active');
            _ac.canvas.classList.remove('active');
            _ac.active = false;
        }

        chart.trigger.classList.add('active');
        chart.canvas.classList.add('active');
        chart.active = true;

        chart.ctrl.resize();

        if (!chart.data) {
            chartDataUpdate(chart);
            // Data.get(chart.dataSource, function() {
            //     chart.data = this.data;
            //     chart.min = +chart.data[0].t.substr(0, 4);
            //     chart.max = +chart.data[chart.data.length - 1].t.substr(0, 4);

            //     chart.ctrl.render(chart.data);
            //     // document.forms.period.start.value = startyear;
            // });
        } else {
            chart.ctrl.render(chart.data);
        }

        console.log('',document.forms.period.start);
    }


    function init() {
        var menu = document.querySelector("nav > ul"),
            main = document.querySelector("main");

        period.start.init(hash[1] || MIN_YEAR);
        period.end.init(hash[2] || MAX_YEAR);

        CHARTS.map(function(chart) {

            chart.trigger = document.createElement('li');
            chart.trigger.innerText = chart.title;
            menu.appendChild(chart.trigger);
            chart.trigger.addEventListener('click', function() {
                setActiveChart.call(chart);
            });

            chart.canvas = document.createElement('canvas');
            main.appendChild(chart.canvas);
            chart.ctrl = new Chart(chart.canvas);
            // chart.rect = chart.canvas.getBoundingClientRect();

            if (activeChart === chart.id) {
                chart.active = true;
                setActiveChart.call(chart);
            }

            chart.canvas.onmousemove = function(e) {
                // important: correct mouse position:
                var x = e.clientX - chart.ctrl.rect.left,
                    y = e.clientY - chart.ctrl.rect.top;

                let res = chart.ctrl.getByPoint(x, y);
                // console.log('res',res);
                // ctx.clearRect(0, 0, canvas.width, canvas.height); // for demo

                // while(r = rects[i++]) {
                //     // add a single rect to path:
                //     ctx.beginPath();
                //     ctx.rect(r.x, r.y, r.w, r.h);
                    
                //     // check if we hover it, fill red, if not fill it blue
                //     ctx.fillStyle = ctx.isPointInPath(x, y) ? "red" : "blue";
                //     ctx.fill();
                // }
            };

        });

        window.addEventListener('resize', function() {
            getActiveChart().ctrl.render();
        });


    }

init();

    // var rects = [
    //             {x: 10, y: 10, w: 200, h: 50},
    //             {x: 50, y: 70, w: 150, h: 30}        // etc.
    //     ], i = 0, r;

    // // render initial rects.
    // while(r = rects[i++]) {
    //     ctx.rect(r.x, r.y, r.w, r.h);
    // }
    // ctx.fillStyle = "blue";
    // ctx.fill();

