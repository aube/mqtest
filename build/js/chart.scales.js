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

    ctx.translate(0.5, 0.5);

    self.chart = params.months;

    ctx.lineJoin = 'round';

    function posY(value) {
        var rate = self.chart.height / (self.maxValue - self.minValue);
        return self.chart.height + self.y - (+value - self.minValue) * rate;
    }

    function drawX() {
        var x0 = self.x,
            x1 = self.width + self.x,
            y = self.axisX !== true ? posY(self.axisX) : self.height - self.padding[2];

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
    }

    function drawY() {
        var y0 = self.y,
            y1 = self.chart.height + y0,
            x = self.x;

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
    }

    function lineY(value) {
        var x0 = self.x,
            x1 = self.width + self.x,
            y = posY(value);

        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = (10 + 4 * self.ratio) + 'px serif';

        value = value.toFixed(2);
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);

        ctx.fillStyle = self.textColor;
        ctx.fillText(value, x0 - 10, y);
    }

    function lineX(value) {
        var x = value.pos * (self.pointWidth + self.margin) + self.x,
            y0 = self.y,
            y1 = self.chart.height + y0;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);

        ctx.font = (value.txt.length < 4 ? 2 : 4) * self.ratio + 10 + 'px serif';
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
                    matchDays = d.match(/(\d{4})-(\d\d)-01/),
                    matchMonths = d.match(/(\d{4})-01/);
                if (matchDays) {
                    lines.push({
                        pos: i,
                        txt: matchDays[2] == '01' ? matchDays[1] : matchDays[2]
                    });
                    i += 27;
                }
                if (matchMonths) {
                    lines.push({
                        pos: i,
                        txt: matchMonths[1]
                    });
                    i += 11;
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
        // ctx.fillRect(self.x;
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


