



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
function ChartLine(canvas, params) {

    var self = this,
        ctx = canvas.getContext("2d");

    this.chart = params.chart;
    this.dataUpdated = false;

    function posY(value) {
        var rate = params.height / (self.data.maxValue - self.data.minValue);
        return params.height + params.margin[0] - (+value - self.data.minValue) * rate;
    }

    function posX(value) {
        var m = params.margin[3],
            rate = 1,
            points = self.data.array.length,
            pointWidth = params.pointWidth || 1;

        if (params.fitByWidth) {
            rate = Math.max(1, params.width / pointWidth / points);
        }

        return value * rate * pointWidth + m;
    }

    this.render = function(done) {

        var data = this.data.array,
            x, y;

        if (!data.length) {
            return;
        }

        ctx.strokeStyle = params.lineColor;

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';

        y = posY(data[0].v);
        x = posX(0);
        ctx.moveTo(x, y);
        for (var i = 1; i < data.length; i++) {
            y = posY(data[i].v);
            x = posX(i);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
        self.dataUpdated = false;
    }


    this.getByPoint = function(x, y) {
        return this.data && this.data[~~x];
    }

}


