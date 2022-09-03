# GPX_Reader
forked from [iosphere/Leaflet.hotline](https://github.com/iosphere/Leaflet.hotline)

GPXファイルを読み込んでLeaflet地図上にホットラインを表示します。
ホットラインとは値によって色が変化するポリラインです、
このライブラりは「Leaflet」の地図、および「Leaflet.hotline」のライブラリがインストールされていることが前提です。

GPXファイルは、ローカルPCにあるGPXファイルを読込、またはサーバ上のGPXファイルをURL指定して読込、の両方が可能です。

使い方

1. gpxMap.jsライブラリを読み込みます。
	<script src="./scripts/gpxMap.js" ></script>

2. 「gpxMap」というIDのDIVを用意します。ここに地図が展開されます。
	<div id="gpxMap"></div>

  表示領域の大きさは「gpxMap」のDIVのCSSで規定してください。
  例：
	#gpxMap{
    	width:50%;
    	height:calc( 100% - 60px );
    }

3. サーバ上のGPXファイルを読み込む方法
	下記のようにURLを引数に指定して「loadGPX()」を呼びます
	例：
	　loadGPX('./sampleData/route_2021-12-09_12.48pm.gpx');

4. ローカルのGPXファイルを読み込む方法
	下記のようにファイル型のinputタグから、イベントを引数にして「loadLocalGPX()」を呼びます。
	デモではこちらを使っています。
	
	<input type="file" accept=".gpx" onchange="loadLocalGPX(event)" />
	

以上

