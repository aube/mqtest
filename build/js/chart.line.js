



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
function ChartLine(canvas) {

    var self = this,
        ctx = canvas.getContext("2d"),
        _data,
        options = {
            noScroll: true,
            yAxisPx: 100,
            xAxisPx: 100,
        },
        //calcs on init
        params = {
            width: 0,
            height: 0,
            minDate: 0,
            maxDate: 3000
        };

    ctx.lineJoin = 'round';
    this.dataUpdated = false;

    this.resize = function() {

        this.rect = canvas.getBoundingClientRect();

        self.width = canvas.offsetWidth;
        self.height = canvas.offsetHeight;
        // height = document.body.clientHeight - this.rect.top;
        // height = Math.min(canvas.offsetWidth / 16 * 9, height);

        canvas.setAttribute('width', parseInt(self.width));
        canvas.setAttribute('height', parseInt(self.height));

    }


    function drawYAxis() {

    }

    function y(value, delta, pixInVal) {
        return self.height - (+value + delta) * pixInVal;
    }

    this.cleanup = function() {
        // Store the current transformation matrix
        ctx.save();
        // Use the identity matrix while clearing the canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Restore the transform
        ctx.restore();
    }

    this.render = function() {
        var data = this.data;
        ctx.beginPath();

        //Y-scale
        let min = Infinity,
            max = -Infinity;

        for (var i = this.data.length - 1; i >= 0; i--) {
            min = Math.min(min, +this.data[i].v);
            max = Math.max(max, +this.data[i].v);
        }

        this.delta = 0 - min;
        this.pixInVal = self.height / (max - min);

        this.cleanup();
        ctx.moveTo(0, y(this.data[0].v, this.delta, this.pixInVal));

        for (var i = 1; i < this.data.length; i++) {
            ctx.lineTo(i, y(this.data[i].v, this.delta, this.pixInVal));
        }
        ctx.stroke();
        self.dataUpdated = false;
    }

    this.loop = function()
    {
        if (self.dataUpdated) {
            self.cleanup();
            self.render();
        }
        
        requestAnimationFrame(self.loop);
    }
    this.loop();

    this.getByPoint = function(x, y) {
        return this.data && this.data[~~x];
    }

    this.resize(canvas);

}


