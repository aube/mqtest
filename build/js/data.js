window.onload = function() {
    window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
}


window.Data = {

    /**
     * IndexedDB instances storage
     **/
    iDBs: (function(){
        var storage = {};

        return function(dbName, storeName) {
            if (!dbName && !storeName) {
                return storage;
            }

            //because cant create multiple stores in one instance w/o versions
            dbName += storeName;

            var iDB = storage[dbName + storeName];
            if (!iDB) {
                storage[dbName + storeName] = iDB = new IDB(dbName, storeName);
            }
            return iDB;
        }
    })(),

    /**
     * Convert and group array to object.
     *
     * @param {Array} arr
     * @param {String} arrKey
     * @param {Function} objKeyFn
     * @returns {Array}
     */
    _group: function(arr, arrKey, objKeyFn) {
        var obj = {},
            _objTpl = {
                // children: {},
                amount: 0,
                v: 0,
                h: -Infinity,
                l: Infinity
            };

        arr.map(function(date) {
            let objKey = objKeyFn(date[arrKey]);

            if (!obj[objKey]) {
                obj[objKey] = utils.copyObj(_objTpl);
            }

            obj[objKey].h = Math.max(+date.h || +date.v, obj[objKey].h);
            obj[objKey].l = Math.min(+date.l || +date.v, obj[objKey].l);
            obj[objKey].v += +date.v;
            obj[objKey].amount++;
            // obj[objKey].children[date[arrKey]] = date.v;
        });

        Object.keys(obj).map(function(objKey) {
            obj[objKey][arrKey] = objKey;
            //averaging
            obj[objKey].v = obj[objKey].v / obj[objKey].amount;

        });

        if (Object.values) {
            return Object.values(obj);
        }

        return Object.keys(obj).map(function(e) {
            return obj[e]
        });
    },

    /**
     * Convert data to indexedDB format.
     * Group by mounths.
     *
     * @param {Array} arr
     * @returns {Array}
     */
    groupByMounths: function(arr) {
        return Data._group(arr, 't', utils.ym);
    },

    saveDataLocal: function(data, dbName) {
        var datam = Data.groupByMounths(data),
            messageM = 'iDB ' + dbName + ' mounts data inserted ' + datam.length + ' rows',
            messageD = 'iDB ' + dbName + ' days data inserted ' + data.length + ' rows';


        setTimeout(function() {
            console.time(messageM);
            Data.iDBs(dbName, 'mounths')
                .insert(datam, function() {
                    console.timeEnd(messageM);

                console.time(messageD);
                Data.iDBs(dbName, 'days')
                    .insert(data, function() {
                        console.timeEnd(messageD);
                    });
            });
        }, 100);
    },

    /**
     * Select period from full data array
     *
     * @param {Array} data
     * @param {String} fromDate
     * @param {String} toDate
     * @returns {Array}
     */
    select: function(data, fromDate, toDate) {

        if (!fromDate || !toDate) {
            console.error('Slice data period error');
            return data;
        }

        var min = data[0].t,
            max = data[data.length - 1].t,
            sliceFrom = Math.max(0, utils.daysBetween(fromDate, min)),
            sliceTo = fromDate + utils.daysBetween(toDate, fromDate);


        // while (data[sliceFrom].t && from != data[sliceFrom].t) {
        //     sliceFrom += from > data[sliceFrom].t ? 1 : -1;
        // }
        // while (data[sliceTo - 1].t && to != data[sliceTo - 1].t) {
        //     sliceTo += to > data[sliceTo - 1].t ? 1 : -1;
        // }

        return data.slice(sliceFrom, sliceTo);
    },

    getSliceData: function(data, params) {

        var min = data[0].t,
            max = data.slice(-1)[0].t,
            sliceFrom = Math.max(0, utils.daysBetween(params.from, min)),
            sliceTo = from + (params.quantity || utils.daysBetween(to, from));

        while (data[sliceFrom].t && from != data[sliceFrom].t) {
            sliceFrom += from > data[sliceFrom].t ? 1 : -1;
        }

        // while (data[sliceTo - 1].t && to != data[sliceTo - 1].t) {
        //     sliceTo += to > data[sliceTo - 1].t ? 1 : -1;
        // }

        return data.slice(sliceFrom, sliceTo);
    },

    /**
     * Convert data to indexedDB format. Group by Mounths.
     *
     * @param {Object} params
     * @returns {Object}
     */
    get: function(params, cb) {

        var dbName = params.url.split('.json')[0].split('/').pop(),
            storeName = 'mounths',
            iDB;

        if (!params.from || params.from.length >= 10) {
            storeName = 'days';
        }

        console.time('iDB data select');
        Data.iDBs(dbName, storeName)
            .select(params, cb, function(data) {
                console.timeEnd('iDB data select');

                if (data === 'done') {
                    return;
                }

                //iDB data not found, try to download them from server
                console.time('XHR data load');
                utils.xhr(params, function(data) {
                    console.timeEnd('XHR data load');

                    Data.saveDataLocal(data, dbName);
                    // Slowly then partial data save:
                    // saveDataLocalWishWorker(data, dbName, storeName);

                    // return cb.call(this, data);
                });
            });
    }
}


/**
 * IndexedDB objects constructor
 *
  * @param {String} dbName
 * @param {String} storeName
 */
var IDB = function(dbName, storeName) {
    var self = this,
        open = window.indexedDB.open(dbName, 1),
        storeName = 'data', //because cant create multiple stores in once opened database
        store,
        db;

    this.open = open;

    open.onupgradeneeded = function() {
        db = open.result;
        store = db.createObjectStore(storeName, {keyPath: 't'});
    }
    open.onsuccess = function() {
        db = open.result;
    }

    this.insert = function(data, completedFn, startingPosition) {
        var args = [].slice.call(arguments),
            startingPosition = startingPosition || 0;

        if (open.readyState !== 'done') {
            return setTimeout(function() {
                self.insert.apply(self, args);
            }, 10);
        }

        try {
            var transaction = db.transaction(storeName, 'readwrite');
        } catch(e) {
            return setTimeout(function() {
                self.insert.apply(self, args);
            }, 10);
        }
        var objectStore = transaction.objectStore(storeName);

        for (var i = startingPosition; i < data.length; i++) {
            objectStore.put(data[i]);

            //partial execution for defreeze ui
            if (i && i % 100 === 0) {
                args[2] = i + 1;
                return setTimeout(function() {
                    self.insert.apply(self, args);
                }, 10);
            }
        }

        transaction.oncomplete = completedFn;
    };


    this.select = function(params, streamFn, completedFn) {
        var args = arguments;
        
        if (open.readyState !== 'done') {
            return setTimeout(function() {
                self.select.apply(self, args);
            }, 10);
        }


        try {
            var transaction = db.transaction(storeName, 'readonly');
        } catch(e) {
            return setTimeout(function() {
                self.select.apply(self, args);
            }, 10);
        }

        var keyRangeValue = null,
            objectStore = transaction.objectStore(storeName),
            dataWasSended = false,
            counter = 0;

        if (params.from && params.to) {
            keyRangeValue = IDBKeyRange.bound(params.from, params.to, false, false)
        } else if (params.from) {
            keyRangeValue = IDBKeyRange.lowerBound(params.from);
        } else if (params.to) {
            keyRangeValue = IDBKeyRange.upperBound(params.to);
        }

        objectStore.openCursor(keyRangeValue).onsuccess = function(event) {
            var cursor = event.target.result;
            if (params.quantity && counter++ >= params.quantity || !cursor) {
                streamFn('done');
                completedFn(dataWasSended ? 'done' : null);
                return;
            } else {
                dataWasSended = true;
                streamFn({stream: cursor.value});
                cursor.continue();
            }
        };

    };
}


/**
 * Test function
 * Save data with Web Worker
 *
 * @param {Array} data
 * @param {String} dbName
 * @param {String} storeName
 */
function saveDataLocalWishWorker(data, dbName, storeName) {
    function _savingWorker() {
        self.addEventListener('message', function(e) {

            var dbName = e.data.dbName,
                storeName = e.data.storeName,
                data = e.data.data,
                open = indexedDB.open(dbName, 1);

            open.onupgradeneeded = function() {
                var db = open.result;
                db.createObjectStore(storeName, {keyPath: 't'});
            }
            open.onsuccess = function() {
                var db = open.result,
                    transaction = db.transaction(storeName, 'readwrite'),
                    objectStore = transaction.objectStore(storeName);
                
                data.map(function(row) {
                    objectStore.put(row);
                });
                self.postMessage('successfully upgraded db');
            }
        }, false);
    }
    // Build a worker from an anonymous function body
    var blobURL = URL.createObjectURL(
        new Blob([ '(', _savingWorker.toString(), ')()'],
            {type: 'application/javascript'}
        ));

    worker = new Worker(blobURL);
    worker.onmessage = function(event) {
        console.log('successfully',event.data);
    };
    worker.postMessage({
        data: data,
        dbName: dbName,
        storeName: storeName
    });
}