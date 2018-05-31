


function Chart(canvas) {

    var ctx = canvas.getContext("2d"),
        _t = this,
        _data,
        width,
        height;

    ctx.lineJoin = 'round';

    this.resize = function() {
        if (!canvas.offsetWidth) {
            canvas.classList.add('loading')
        }

        this.rect = canvas.getBoundingClientRect();

        width = canvas.offsetWidth;
        height = document.body.clientHeight - this.rect.top;
        height = Math.min(canvas.offsetWidth / 16 * 9, height);

        canvas.setAttribute('width', parseInt(width));
        canvas.setAttribute('height', parseInt(height));

        if (canvas.classList.contains('loading')) {
            canvas.className = '';
        }
    }

    function dataSanitize(data, averaging) {

        if (width >= data.length) {
            return data;
        }

        let _data = [],
            q = data.length / width;

        for (let i = 0; i < width; i++) {
            let d = Math.min(Math.round(i * q), data.length - 1);

            if (averaging) {
                let avr = 0,
                    dd = Math.min(Math.round((i + 1) * q), data.length - 1);

                for (let a = d; a <= dd; a++) {
                    avr += +data[a].v;
                }
                _data.push({
                    t: data[d].t,
                    v: avr / Math.max(1, dd - d)
                });
            } else {
                _data.push(data[d]);
            }
        }
        return _data;
    }

    function y(value, delta, pixInVal) {
        return height - (+value + delta) * pixInVal;
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

    this.render = function(data) {
        _fullData = data || _fullData;
        if (!data) {
            this.resize();
        }

        this.data = dataSanitize.call(this, _fullData, true);
        ctx.beginPath();

        //Y-scale
        let min = Infinity,
            max = -Infinity;

        for (var i = this.data.length - 1; i >= 0; i--) {
            min = Math.min(min, +this.data[i].v);
            max = Math.max(max, +this.data[i].v);
        }

        this.delta = 0 - min;
        this.pixInVal = height / (max - min);

        this.cleanup();
        ctx.moveTo(0, y(this.data[0].v, this.delta, this.pixInVal));

        for (var i = 1; i < this.data.length; i++) {
            ctx.lineTo(i, y(this.data[i].v, this.delta, this.pixInVal));
        }
        ctx.stroke();
    }


    this.getByPoint = function(x, y) {
        return this.data && this.data[~~x];
    }

    this.resize(canvas);

}


