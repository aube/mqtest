# График погоды и осадков

**NativeJS, IndexedDB, Canvas**


## Описание интерфейса и логики работы

UI адаптивный, отображение данных управляется мышью или с экрана.

Графики из полученных данных отрисовываются в Canvas.

График данных по месяцам выводится в барах, график по дням - линенйный


## Получение, хранение, обработка данных

При первом открытии интерфейса производится попытка получения данных из IndexedDB.

В случае отсутствия локально сохраненных данных, производится XHR запрос с последующей записью в IndexedDB.
При записи для каждого источника данных содаётся две базы: days & months, для хранения данных по дням и месяцам соответственно.
База months содержит минимальные и максимальные показатели значений за месяц.

Данные кэшируются и при изменении периода выбираются из кэша.


## Пример интерфейса

> <a href='https://aube.github.io/mqtest/'>https://aube.github.io/mqtest</a>


## Установка и Сборка

Gulp + Nodemon + Browsersync

```
git clone git@github.com:aube/mqtest.git
cd ./mqtest
npm i
gulp
```


# Weather and precipitation graph

**NativeJS, IndexedDB, Canvas**


## User Interface and Logic

UI adaptive, data controlled from mouse and touchscreen.

The graphs from the received data are drawn in Canvas.

The monthly data plot is displayed in bars, the graph by days is linear


## Receiving, storing, processing data

The first time the interface is opened, an attempt is made to retrieve the data from IndexedDB.

If there is no locally stored data, the XHR query is executed, and then written to IndexedDB.
When recording for each data source, two databases are issued: days and months to store data by day and month, respectively.
The months database contains the minimum and maximum values for the month.

The data is cached, and when the period changes, it is selected from the cache.

## Example

> <a href='https://aube.github.io/mqtest/'>https://aube.github.io/mqtest</a>


## Installation and Building

Gulp + Nodemon + Browsersync

```
git clone git@github.com:aube/mqtest.git
cd ./mqtest
npm i
gulp
```