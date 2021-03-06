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
     * Group by months.
     *
     * @param {Array} arr
     * @returns {Array}
     */
    groupByMonths: function(arr) {
        return Data._group(arr, 't', utils.ym);
    },

    saveDataLocal: function(data, dbName) {
        var datam = Data.groupByMonths(data),
            messageM = 'iDB ' + dbName + ' mounts data inserted ' + datam.length + ' rows',
            messageD = 'iDB ' + dbName + ' days data inserted ' + data.length + ' rows';


        setTimeout(function() {
            console.time(messageM);
            Data.iDBs(dbName, 'months')
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
     * Get data period from server and pass it to callback
     * @param  {Function} cb
     */
    getMinMaxDates: function(cb) {
        // cb('1881-01-01', '1882-12-31');
        cb('1881', '2006');
    },

    /**
     * Select data from indexedDB, then from
     * @param  {[type]}   params [description]
     * @param  {Function} cb     [description]
     * @return {[type]}          [description]
     */
    get: (function() {
        var activeQueries = {};

        return function(params, cb) {

            var dbName = params.url.split('.json')[0].split('/').pop(),
                storeName = params.store,
                qKey = dbName + storeName + params.from + params.to,
                iDB;

            if (activeQueries[qKey]) {
                return;
            }

            utils.state('Reading IndexedDB data');
            console.time('iDB data select');

            // //select benchmark w/o callbacks and render
            // return Data.iDBs(dbName, storeName)
            //     .select(params, function() {}, function() {
            //         console.timeEnd('iDB data select');
            //     });

            activeQueries[qKey] = true;

            Data.iDBs(dbName, storeName)
                .select(params, cb, function(data) {

                    activeQueries[qKey] = false;

                    console.timeEnd('iDB data select');

                    if (data === 'done') {
                        utils.state();
                        return;
                    }

                    utils.state('IndexedDB data not found, try to download data from server');

                    console.time('XHR data load');
                    utils.xhr(params, function(data) {
                        console.timeEnd('XHR data load');

                        Data.saveDataLocal(data.all, dbName);

                        cb({
                            id: params.id,
                            store: params.store,
                            state: 'done',
                            all: data.all
                        });

                        // // Using Worker slowly then partial data save:
                        // saveDataLocalWishWorker(data, dbName, storeName);

                    });
                });
        }
    })()
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

        for (var i = startingPosition, dl = data.length; i < dl; i++) {
            objectStore.put(data[i]);

            utils.state('IndexedDB: insertion into ' + dbName + '.' + storeName + ': ' + i + '/' + dl);

            //partial execution for defreeze ui
            if (i && i % 100 === 0) {
                args[2] = i + 1;
                return setTimeout(function() {
                    self.insert.apply(self, args);
                }, 10);
            }
        }
        utils.state();
        transaction.oncomplete = completedFn;
    };


    this.select = function(params, streamFn, completedFn) {
        var args = arguments;

        if (params.stop) {
            return;
        }

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
            keyRangeValue = IDBKeyRange.lowerBound(params.from, false);
        } else if (params.to) {
            keyRangeValue = IDBKeyRange.upperBound(params.to, false);
        }

        objectStore.openCursor(keyRangeValue).onsuccess = function(event) {
            var cursor = event.target.result;
            if (!cursor) {
                streamFn({
                    id: params.id,
                    store: params.store,
                    state: 'done'
                });
                completedFn(dataWasSended ? 'done' : null);
                return;
            } else {
                dataWasSended = true;
                streamFn({
                    id: params.id,
                    store: params.store,
                    stream: cursor.value,
                    stop: function() {
                        params.stop = true;
                    }
                });
                cursor.continue();
            }
        };
    };

    this.selectMinMaxKeys = function(cb) {
        var args = arguments;
        
        if (open.readyState !== 'done') {
            return setTimeout(function() {
                self.selectMinMaxKeys.apply(self, args);
            }, 10);
        }

        try {
            var transaction = db.transaction(storeName, 'readonly');
        } catch(e) {
            return setTimeout(function() {
                self.select.apply(self, args);
            }, 10);
        }

        var keyRangeValueMin = IDBKeyRange.lowerBound('', true),
            keyRangeValueMax = IDBKeyRange.upperBound('zzzzzsssssz', true),
            objectStore = transaction.objectStore(storeName);

        objectStore.getKey(keyRangeValueMin).onsuccess = function(min) {
            var min = event.target.result;

            objectStore.openCursor(keyRangeValueMax, 'prev').onsuccess = function(event) {
                var max = (event.target.result || {}).key;
                return cb(min, max);
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