
    var Pages = [{
            id: 'temperature',
            dataSource: '/temperature.json',
            title: 'Температура',
            type: 'chart'
        }, {
            id: 'precipitation',
            dataSource: '/precipitation.json',
            title: 'Осадки',
            type: 'chart'
        }, {
            id: 'description',
            dataSource: '/description.html',
            title: 'Описание',
            type: 'html'
        }];


    var hash = new function() {
        this.update = function() {
            var _page = tabs.active.page;
            this.page = _page.id;
            // this.from = _page.ctrl.period.from;
            // this.to = _page.ctrl.period.to;

            location.hash = [this.page, this.from, this.to].filter(function(v) {
                return !!v
            }).join(',');
        }

        let _h = location.hash.substr(1).split(',');
        this.page = _h[0];
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
                tabs.onActivate.apply(tabs.map[id].page);
            }
            hash.update();
        },

        create: function(page) {
            var tab = utils.crEl('li', 'nav > ul');

            page.container = utils.crEl('div', 'main', {class: page.type + '-container tab'});

            tabs.map[page.id] = {
                tab: tab,
                content: page.container,
                page: page
            }

            tab.innerText = page.title;

            tab.addEventListener('click', function() {
                tabs.setActive(page.id);
            });

            return tab;
        }
    }


    function setActiveChart() {
        var page = this;

        //first load
        //container class '.loadind' should be set for content size calc on init
        if (page.type == 'chart' && !page.chart) {
            // chart.container.classList.add('loading')
            page.chart = new Chart(page.container, page);
            // chart.container.classList.remove('loading')
        }

    }


    function init() {

        // period.start.init(hash[1] || MIN_YEAR);
        // period.end.init(hash[2] || MAX_YEAR);

        Pages.map(function(page) {

            var tab = tabs.create(page);


        });

        tabs.setActive(hash.page || Pages[0].id);
    }




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