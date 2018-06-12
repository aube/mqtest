/**
 * ChartMap module for Chart
 * Displaying data map bottom (usually) of canvas
 * can be used like scrollbar
 */
function ChartMap(canvas, params) {

    var self = this,
        ctx = canvas.getContext("2d");

    ctx.translate(0.5, 0.5);

    function _posY(value) {
        var rate = self.height / (self.maxValue - self.minValue);
        return self.height + self.y - (+value - self.minValue) * rate;
    }

    function _posX(value) {
        return value + self.x;
    }

    /**
     * Writes text on the map, before all data is loading complete
     * @param  {String} txt
     */
    function displayLoadingText(txt) {
        ctx.font = (10 + 4 * self.ratio) + 'px serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            txt,
            self.x + self.width / 2,
            self.y + self.height / 2
        );
    }

    /**
     * Returns coordinates and sizes of highlighted zone on map
     * @return {Array} [x, y, width, height]
     */
    function getHighlitedZoneCoords() {
        let rate = self.visiblePoints / self.allPoints,
            width = Math.max(20, rate * self.width) * self.ratio,
            x = self.x + self.width * (self.positionX / self.allPoints);

        return [
            x,
            self.y,
            width,
            self.height
        ]
    }

    /**
     * Hightlited visible chart zone on map
     */
    function hightlightVisibleZone() {
        let coords = getHighlitedZoneCoords();
        ctx.fillStyle = self.selectionColor;
        ctx.fillRect(
            coords[0],
            coords[1],
            coords[2],
            coords[3]
        );
    }

    /**
     * Line chart builder
     */
    this.render = function() {
        let _data = self.__proto__.data,
            _dataCompressed = utils.dataCompression(_data, self.width, self.averaging),
            minMaxValues = utils.getMinMaxValues(_dataCompressed),
            x, y;

        self.minValue = minMaxValues.min;
        self.maxValue = minMaxValues.max;

        if (!_dataCompressed.length) {
            return;
        }

        self.rateX = 1;

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.lineJoin = 'round';
        if (self.borderColor) {
            ctx.strokeStyle = self.borderColor;
            ctx.strokeRect(self.x, self.y, self.width, self.height);
        }

        if (self.dataState !== 'done') {
            displayLoadingText('Loading: ' + _dataCompressed.slice(-1)[0].t);
            return;
        } else {
            hightlightVisibleZone();
            ctx.strokeStyle = self.lineColor;
            y = _posY(_dataCompressed[0].v);
            x = _posX(0);
            ctx.moveTo(x, y);
            for (var i = 1; i < _dataCompressed.length; i++) {
                y = _posY(_dataCompressed[i].v);
                x = _posX(i);
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    /**
     * Drag'n'Drop
     */
    var drag,
        startX;

    this.click = function(x, y) {
        if (drag !== 'active') {
            let shiftPercent = (x - self.x) / self.width - self.positionX / self.allPoints,
                position = self.allPoints * (shiftPercent  - (self.visiblePoints / self.allPoints) / 2);
            self.moveChart(position);
        }
    }

    this.mousedown = function(x, y) {
        let coords = getHighlitedZoneCoords();
        if (x > coords[0] && x < coords[0] + coords[2]) {
            drag = 'prepare';
            startX = x;
        }
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
            let shiftPercent = (x - startX) / self.width,
                position = self.allPoints * shiftPercent;
            self.moveChart(position);

            startX = x;
        }
    }

}


