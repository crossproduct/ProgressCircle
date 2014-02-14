#ProgressCircle.js is a javascript class for animating circular progress bars via SVG
ProgressCircle makes generating circular progress meters in your HTML easy without relying on any extra frameworks.

##How it works
Setup:

```
<!-- Cirlular Progress JS -->
		<script src="ProgressCircle.js"></script>
```
Example:

```
<div style="position:relative; width:450px; height:450px; float:left; -webkit-filter:drop-shadow(0px 8px 10px rgba(0,0,0,0.5))">
	<svg	id="progress-canvas1" xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
	    <path id="progress1" d="M0,0" fill="none"></path>
	</svg>
	<div style="color:#FFFFFF; text-align: center; position:absolute;top:0; font-family:sans-serif"></div>
</div>

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
		callback: null
	});

	// start the animation
	progressCircle1.start();
};
</script>
```