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
        return value * self.rateX * params.pointWidth + self.x;
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
        let rate = self.quantityX / self.fullQuantityX,
            width = Math.max(20, rate * self.width) * self.ratio,
            x = self.x + rate * self.positionX;

        if (x + width > self.x + self.quantityX) {
            x = Math.max(self.x, self.x + self.quantityX - width);
        }

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
        let data = self.data,
            _min = Infinity,
            _max = -Infinity,
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

        if (self.dataState !== 'done') {
            displayLoadingText('Loading: ' + data.slice(-1)[0].t);
            return;
        } else {
            hightlightVisibleZone();
            ctx.strokeStyle = self.lineColor;
            y = _posY(data[0].v);
            x = _posX(0);
            ctx.moveTo(x, y);
            for (var i = 1; i < data.length; i++) {
                y = _posY(data[i].v);
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
        if (!drag) {
            self.moveChart(((x - self.x) / self.quantityX) * self.fullQuantityX - self.positionX - self.quantityX / 2, 200);
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
            self.moveChart(((x - startX) / self.quantityX) * self.fullQuantityX);
            startX = x;
        }
    }

}


