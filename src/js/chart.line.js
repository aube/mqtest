



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

    function posY(value) {
        var rate = self.height / (self.maxValue - self.minValue);
        return self.height + self.y - (+value - self.minValue) * rate;
    }

    function posX(value) {
        return value * self.rateX * params.pointWidth + self.x;
    }

    this.render = function(done) {

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
        y = posY(data[0].v);
        x = posX(0);
        ctx.moveTo(x, y);
        for (var i = 1; i < data.length; i++) {
            y = posY(data[i].v);
            x = posX(i);
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }


    this.getByPoint = function(x, y) {
        return this.data && this.data[~~x];
    }

}


