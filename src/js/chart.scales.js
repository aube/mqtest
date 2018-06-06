



/**
 * Splits given string into chunks of given length
 * & joins them with a given separator string.
 *
 * @example
 * getSplittedString("abcdefghi") = "abc-def-ghi"
 *
 * @param {String} str
 * @param {Number} [chunkLen=3]
 * @param {String} [sep='-']
 * @returns {String}
 */
function ChartScales(canvas, params) {

    var self = this,
        ctx = canvas.getContext("2d");

    this.scales = params.scales;
    this.chart = params.chart;
    this.dataUpdated = false;

    ctx.lineJoin = 'round';

    function posY(value) {
        var rate = self.chart.height / (self.data.maxValue - self.data.minValue);
        return self.chart.height + self.chart.margin[0] - (+value - self.data.minValue) * rate;
    }

    function drawX() {
        var x0 = params.padding[3],
            x1 = canvas.width - params.padding[1],
            y = params.scales.axisX !== true ? posY(params.scales.axisX) : canvas.height - params.padding[2];

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
    }

    function drawY() {
        var y0 = params.padding[0],
            y1 = canvas.height - params.padding[2],
            x = params.padding[3];
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
    }

    function lineY(value) {
        var x = params.padding[3],
            y = posY(value);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '14px serif';

        value = value.toFixed(2);
        ctx.moveTo(x, y);
        ctx.lineTo(canvas.width - params.padding[1], y);

        ctx.fillText(value, x - 10, y);
    }


    this.render = function(done) {
        if (!done) return;

        ctx.strokeStyle = params.scales.lineColor;
        
        if (params.scales.axisX !== false) {
            drawX();
        }
        
        if (params.scales.axisY !== false) {
            drawY();
        }

        if (params.scales.linesY !== false) {
            var lines = [self.data.minValue, self.data.maxValue, 0],
                absMax = Math.max(Math.abs(self.data.minValue), Math.abs(self.data.maxValue)),
                step = params.scales.linesY;

            if (params.scales.linesY !== true) {
                for (var i = step; i < absMax; i += step) {
                    if (i < Math.abs(self.data.maxValue)) {
                        lines.push(i * (self.data.maxValue < 0 ? -1 : 1));
                    }
                    if (i < Math.abs(self.data.minValue)) {
                        lines.push(i * (self.data.minValue < 0 ? -1 : 1));
                    }
                }
            }

            ctx.beginPath();
            lines.map(function(value) {
                lineY(value);
            })
            ctx.stroke();
        }


        
        // var data = this.data.array,
        //     x, y;

        // if (!data.length) {
        //     return;
        // }
        // ctx.fillRect(self.chart.margin[3], self.chart.margin[0], self.chart.width, self.chart.height);
        // ctx.beginPath();


        // this.cleanup();

        // y = posY(data[0].v);
        // x = posX(0);
        // ctx.moveTo(x, y);
        // for (var i = 1; i < data.length; i++) {
        //     y = posY(data[i].v);
        //     x = posX(i);
        //     ctx.lineTo(x, y);
        // }
        // ctx.stroke();
        // self.dataUpdated = false;
    }


    this.getByPoint = function(x, y) {
        return this.data && this.data[~~x];
    }

}


