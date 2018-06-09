



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

    

    this.chart = params.chart;


    ctx.lineJoin = 'round';

    function posY(value) {
        var rate = self.chart.height / (self.maxValue - self.minValue);
        return self.chart.height + self.padding[0] - (+value - self.minValue) * rate;
    }

    function drawX() {
        var x0 = self.padding[3],
            x1 = self.width + self.padding[3],
            y = self.axisX !== true ? posY(self.axisX) : self.height - self.padding[2];

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
    }

    function drawY() {
        var y0 = self.padding[0],
            y1 = self.chart.height + y0,
            x = self.padding[3];
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
    }

    function lineY(value) {
        var x0 = self.padding[3],
            x1 = self.width + self.padding[3],
            y = posY(value);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '14px serif';

        value = value.toFixed(2);
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);

        ctx.fillStyle = self.textColor;
        ctx.fillText(value, x0 - 10, y);
    }

    function lineX(value) {
        var x = value.pos * self.rateX + self.padding[3],
            y0 = self.padding[0],
            y1 = self.chart.height + y0;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = (value.txt.length < 4 ? 12 : 14) + 'px serif';

        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);

        ctx.fillStyle = self.textColor;
        ctx.fillText(value.txt, x, y1 + 10);
    }


    this.render = function() {

        ctx.strokeStyle = self.lineColor;
        
        if (self.axisX !== false) {
            drawX();
        }
        
        if (self.axisY !== false) {
            drawY();
        }

        if (self.linesY !== false) {
            let lines = [self.minValue, self.maxValue, 0],
                absMax = Math.max(Math.abs(self.minValue), Math.abs(self.maxValue)),
                step = self.linesY;

            if (self.linesY !== true) {
                for (var i = step; i < absMax; i += step) {
                    if (i < Math.abs(self.maxValue)) {
                        lines.push(i * (self.maxValue < 0 ? -1 : 1));
                    }
                    if (i < Math.abs(self.minValue)) {
                        lines.push(i * (self.minValue < 0 ? -1 : 1));
                    }
                }
            }

            ctx.beginPath();
            lines.map(function(value) {
                lineY(value);
            })
            ctx.stroke();
        }

        if (self.linesX !== false) {
            let lines = [];

            for (var i = 0; i < self.data.length; i++) {
                let d = self.data[i].t,
                    match = d.match(/(\d{4})-(\d\d)-01/);
                if (match) {
                    lines.push({
                        pos: i,
                        txt: match[2] == '01' ? match[1] : match[2]
                    });
                    i += 27;
                }
            }

            ctx.beginPath();
            lines.map(function(value) {
                lineX(value);
            })
            ctx.stroke();
        }


        
        // var data = this.data.array,
        //     x, y;

        // if (!data.length) {
        //     return;
        // }
        // ctx.fillRect(self.padding[3], self.padding[0], self.chart.width, self.chart.height);
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


