#ProgressCircle.js
ProgressCircle.js is a javascript class for animating circular progress bars via SVG. It makes generating circular progress meters in your HTML easy without relying on any extra frameworks.

![](c1.jpg)![](c2.jpg)![](c3.jpg)

Check out the [Demo](http://crossproduct.github.io/ProgressCircle/)
##How it works
Load the .js ...

```
<script src="ProgressCircle.js"></script>
```
Build a home for a ```<path>``` element in your own styling.

```
<div style="position:relative; width:450px; height:450px; float:left; -webkit-filter:drop-shadow(0px 8px 10px rgba(0,0,0,0.5))">
	<svg	id="progress-canvas1" xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
	    <path id="progress1" d="M0,0" fill="none"></path>
	</svg>
	<div style="color:#FFFFFF; text-align: center; position:absolute;top:0; font-family:sans-serif"></div>
</div>
```
Initialize an instance of ```ProgressCircle``` and call ```start()```

```
<script>
	window.onload = function() {
		(progressCircle1 = new ProgressCircle()).init({
			circle: document.getElementById('progress1'),
			duration: 6000,
			startAngle: 90,
			stroke: '#FF1133',
			strokeWidth: 120,
			fill: '#333333',
			useLabel: true,
			stopValue: 1,
			unit: 'x',
			scaleFont: true,
			direction: -1,
			callback: null
		});
	
		// start the animation
		progressCircle1.start();
	};
</script>
```
##Options
Initialization of a ProgressCircle takes an object that holds properties about the circle to draw. Some are required, some are optional with defaults.

name | type | description
------------- | ------------- | -------------
```circle```  | DOMElement ```<path>``` | A reference to the ```<path>``` DOMElement to which the svg data will append on the 'd' attribute.
```duration``` | integer (optional, default is 1000)| The total time of the animation described in milliseconds
```startAngle``` | integer (optional, default is 0) | The angle at which to start the animation. You can specify any integer and it will be auto modulused by 360
```stroke``` | string (optional, default ```#EFEFEF```) | The color of the progress circle.
```strokeWidth``` | integer (optional, default 1) | The width of the progress circle.
```fill``` | (optional, default 'none') | When the stopValue is set to 1, i.e. a full circle, this value will be used to set the fill attribute. Values are a hex color string or 'none'.
```useLabel``` | boolean (optional, default false) | Whether or not to show the label annotation.
```stopValue``` | integer (optional, default 1) | A value between ```[0,1]``` indicating what percentage from startAngle to stop.
```unit``` | string (optional, default '') | A string representing a unit value to be appened to the label if used.
```scaleFont``` | boolean (optional, default true) | If the label is to be displayed, this value allows the font-size to be autoscaled.
```direction``` | integer (optional, default 1) | Evaluated as an integer, a negative value indicates counter clockwise, else clockwise
```callback``` | function (optional, default null) | A user specified function to be called upon completion of progress circle.