/**
 * ChartLine module for Chart
 * 
 */
function ChartLine(canvas, params) {

    var self = this,
        ctx = canvas.getContext("2d");

    ctx.translate(0.5, 0.5);

    function _posY(value) {
        var rate = self.height / (self.maxValue - self.minValue);
        return self.height + self.y - (+value - self.minValue) * rate;
    }

    function _posX(value) {
        return value * self.rateX * params.pointWidth + self.x;
    }

    /**
     * Line chart builder
     */
    this.render = function() {
        var data = self.data,
            x, y;

        if (!data.length) {
            return;
        }

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';

        if (self.borderColor) {
            ctx.strokeStyle = self.borderColor;
            ctx.strokeRect(self.x, self.y, self.width, self.height);
        }

        ctx.strokeStyle = self.lineColor;
        y = _posY(data[0].v);
        x = _posX(0);
        ctx.moveTo(x, y);
        for (var i = 1; i < data.length; i++) {
            y = _posY(data[i].v);
            x = _posX(i);
            ctx.lineTo(x, y);
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
        if (drag == 'prepare' && Math.abs(startX - x) > 5) {
            drag = 'active';
        }
        if (drag == 'active') {
            self.moveChart(startX - x);
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


