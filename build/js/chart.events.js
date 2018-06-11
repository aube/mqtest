


function ChartEvents(canvas, activeModules) {

    var self = this;

    function _getTouchXY(e) {
        var tt = e.targetTouches;

        if (tt && tt.length > 1 || !tt[0]) {
            return false;
        }
        return {
            x: tt[0].clientX - canvas.left,
            y: tt[0].clientY - canvas.top
        }
    }

    function _targetModuleEvents(event, x, y) {
        x = x * self.ratio;
        y = y * self.ratio;
        activeModules.map(function(mdl) {
            if (mdl[event] &&
                mdl.x <= x && mdl.x + mdl.width >= x &&
                mdl.y <= y && mdl.y + mdl.height >= y) {
                mdl[event].call(mdl, x, y);
                mdl.mousein = true;
            }
            if (mdl.mousein &&
                (x < mdl.x || x > mdl.x + mdl.width || y < mdl.y || y > mdl.y + mdl.height)) {
                mdl.mousein = false;

                if (mdl.mouseleave) {
                    mdl.mouseleave.call(mdl, x, y);
                }
            }
        })
    }

    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        self.moveChart(30 * (e.deltaY > 0 ? 1 : -1), 100);
    });

    canvas.addEventListener('click', function(e) {
        _targetModuleEvents('click', e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mouseup', function(e) {
        _targetModuleEvents('mouseup', e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousedown', function(e) {
        _targetModuleEvents('mousedown', e.offsetX, e.offsetY);
    });

    canvas.addEventListener('mousemove', function(e) {
        _targetModuleEvents('mousemove', e.offsetX, e.offsetY);
    });

    canvas.addEventListener('touchend', function(e) {
        _targetModuleEvents('mouseup');
    });

    canvas.addEventListener('touchstart', function(e) {
        let offset = _getTouchXY(e);
        if (offset) {
            _targetModuleEvents('mousedown', offset.x, offset.y);
        }
    });

    canvas.addEventListener('touchmove', function(e) {
        let offset = _getTouchXY(e);
        if (offset) {
            _targetModuleEvents('mousemove', offset.x, offset.y);
        }
    });


}


