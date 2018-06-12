/**
 * ChartLine module for Chart
 * 
 */
function ChartBars(canvas, params) {

    var self = this,
        ctx = canvas.getContext("2d");

    ctx.translate(0.5, 0.5);

    function _posY(value) {
        var rate = self.height / (self.maxValue - self.minValue);
        return self.height + self.y - (+value - self.minValue) * rate;
    }

    function _posX(value) {
        return value * self.rateX * self.pointWidth + self.x + value * 1;
    }

    /**
     * Line chart builder
     */
    this.render = function(force) {
        var data = self.data,
            x, y;

        if (!self.active) {
            return;
        }
        if (!data.length) {
            return;
        }
        if (!force && !~['visible', 'done'].indexOf(self.dataState)) {
            return;
        }

        self.visiblePoints = self.width / (self.pointWidth  + self.margin);
        self.rateX = Math.max(1, self.visiblePoints / self.allPoints);
        self.__proto__.pointWidth = self.pointWidth;
        self.__proto__.margin = self.margin;
        self.__proto__.visiblePoints = self.visiblePoints;

        ctx.beginPath();
        if (self.borderColor) {
            ctx.strokeStyle = self.borderColor;
            ctx.strokeRect(self.x, self.y, self.width, self.height);
        }

        ctx.fillStyle = self.barColor;
        for (let i = 1; i < data.length; i++) {
            let high = _posY(data[i].h),
                low = _posY(data[i].l) - high;
            ctx.fillRect(
                _posX(i),
                high,
                self.pointWidth,
                low
            );
        }
        ctx.stroke();
    }

    /**
     * Drag'n'Drop
     */
    var drag,
        startX;

    this.mousedown = function(x, y) {
        drag = 'prepare';
        startX = x;
    }

    this.mouseup = function(x, y) {
        setTimeout(function() {
            drag = false;
        })
    }

    this.mouseleave = function(x, y) {
        drag = false;
    }

    this.mousemove = function(x, y) {
        if (!drag) {
            return;
        }
        let shift = Math.abs(startX - x),
            step = self.pointWidth + self.margin;

        if (drag == 'prepare' && shift > 5) {
            drag = 'active';
        }
        if (drag == 'active' && shift > step) {
            self.moveChart((startX - x) / step);
            startX = x;
        }
    }

    /**
     * Displaying current point on chart
     */
    // this.getByPoint = function(x, y) {
    //     return this.data && this.data[~~x];
    // }

}


