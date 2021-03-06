/*
The MIT License (MIT)

Copyright (c) 2014 Chris Ross , crossproduct iNc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * Creates an instance of a progress circle
 * @constructor
 */
function ProgressCircle() {
    // .. do something?
}

/**
 * Initialize the component with the descriptive data
 * @param  {Object} data - The configuration properties for the instance
 */
ProgressCircle.prototype.init = function(data) {
    this.data = data;
    if(!this.data.hasOwnProperty('circle')) return;//circle = document.getElementById("arc");
    if(!this.data.hasOwnProperty('stroke')) this.data.stroke = '#EFEFEF';
    if(!this.data.startAngle) this.data.startAngle = 0;
    if(!this.data.hasOwnProperty('stopValue')) this.data.stopValue = 1;
    if(!this.data.hasOwnProperty('strokeWidth')) this.data.strokeWidth = 1;
    if(!this.data.hasOwnProperty('useLabel')) this.data.useLabel = false;
    if(!this.data.hasOwnProperty('scaleFont')) this.data.scaleFont = false;
    if(!this.data.hasOwnProperty('maxLabelValue')) this.data.maxLabelValue = 100.00;
    if(!this.data.hasOwnProperty('direction')) this.data.direction = 1;
    if(this.data.direction < 0 ) this.data.direction = -1;
    else this.data.direction = 1;
    if(!this.data.hasOwnProperty('countdown')) this.data.countdown = false;
    if(!this.data.hasOwnProperty('strokeLinecap')) this.data.strokeLinecap = "";

    if(this.data.stopValue != 1) this.data.fill = "none";

    // init the attr on the path
    this.data.circle.setAttribute('d','M0,0');
    this.data.circle.setAttribute('fill', 'none');
    this.data.circle.setAttribute('stroke', this.data.stroke);
    this.data.circle.setAttribute('stroke-width', this.data.strokeWidth);
    this.data.circle.setAttribute('stroke-linecap', this.data.strokeLinecap);

    // produce a track :)
    if(this.data.trackColor) {
        this.data.circle.parentElement.style.boxShadow = 'inset 0 0 0 '+ this.data.strokeWidth+ 'px '+this.data.trackColor;
        this.data.circle.parentElement.style.webkitBoxShadow = 'inset 0 0 0 '+ this.data.strokeWidth+ 'px '+this.data.trackColor;
        this.data.circle.parentElement.style.mozBoxShadow = 'inset 0 0 0 '+ this.data.strokeWidth+ 'px '+this.data.trackColor;
        this.data.circle.parentElement.style.borderRadius = "50%";
    }

    this.data.startAngle %= 360; // normalize input
    this.data.stopValue = +this.data.stopValue.toFixed(2);
    this.deltaValue = this.data.stopValue;

    // calculate the adjusted radius
    var circleParent = this.data.circle.parentNode;
    this.radius = ((circleParent.offsetWidth <= circleParent.offsetHeight ? circleParent.offsetWidth : circleParent.offsetHeight)/2) - (this.data.strokeWidth/2);

    // init the label
    var label = this.data.circle.parentElement.parentElement.children[this.data.circle.parentElement.parentElement.childElementCount-1];
    label.innerHTML = "";
    label.style.fontSize = this.radius/2 + 'px';
    label.style.width = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
    label.style.height = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
    label.style.lineHeight = ((this.radius+this.data.strokeWidth/2) * 2)+'px';

    this.i = 0;
    this.framerate = 17;
    this.angle = 0 + this.data.startAngle;
    this.finalAngle = 360 + this.data.startAngle;
    this.circumference = 2 * Math.PI * (this.radius + this.data.strokeWidth/2);
    this.stepSize = 1.0;
    this.velocity = 1;
    this.stopAngle = this.data.startAngle + (this.data.stopValue * 360);

    this.i_max = +((360/this.stepSize)*this.data.stopValue).toFixed(0);

    // reset some things
    this.data.circle.style.transition = "";
    this.data.circle.setAttribute('fill', 'none');

    // resolve the path data
    this.data.circle.setAttribute("d", this.calculatePath(1.0));

    // calculate the length of the path, we use this later for setting the stroke-dasharray and stroke-dashoffset
    this.pathLength = this.data.circle.getTotalLength();
    this.data.circle.style.strokeDasharray = this.pathLength + ' ' + this.pathLength;
    this.data.circle.style.strokeDashoffset = this.pathLength;

    // force a layout so the browser can get certain initial values calculated
    this.data.circle.getBoundingClientRect();

    this.previous_offset = this.pathLength;
};

/**
 * Cleans up anything necessary before it destroys the path element
 */
ProgressCircle.prototype.destroy = function() {
    window.cancelAnimationFrame(this.requestId);
    if(!this.data) return;
    this.data.circle.parentNode.removeChild(this.data.circle);
    this.data = null;
};

/**
 * Resets the instance data that relates to drawing
 */
ProgressCircle.prototype.reset = function() {
    // stop any rAF loops
    window.cancelAnimationFrame(this.requestId);

    // reset the d and fill attr
    this.data.circle.setAttribute('fill', 'none');

    // reset some things
    this.data.circle.style.transition = "";
    this.data.circle.setAttribute('fill', 'none');

    // resolve the path data
    this.data.circle.setAttribute("d", this.calculatePath(1.0));

    // calculate the length of the path, we use this later for setting the stroke-dasharray and stroke-dashoffset
    this.pathLength = this.data.circle.getTotalLength();
    this.data.circle.style.strokeDasharray = this.pathLength + ' ' + this.pathLength;
    this.data.circle.style.strokeDashoffset = this.pathLength;

    // force a layout so the browser can get certain initial values calculated
    this.data.circle.getBoundingClientRect();

    // reset the label
    this.data.circle.parentElement.parentElement.children[this.data.circle.parentElement.parentElement.childElementCount-1].innerHTML = "";

    this.i = 0;
    this.previous_offset = this.pathLength;
    this.angle = 0 + this.data.startAngle;
    this.velocity = 1;
    this.stopAngle = this.data.startAngle + (this.data.stopValue * 360);
    this.i_max = +((360/this.stepSize)*this.data.stopValue).toFixed(0);

    this.data.circle.style.transition = "";
};

/**
 * Set the value of the circle without an animation
 * @param {integer} value A value between [0,1] indicating what percentage from startAngle to stop.
 */
ProgressCircle.prototype.set = function(value) {
    if(value > 1) value = 1;
    this.reset();
    if(value < 0) value = 0;

    var to_i = +((360/this.stepSize)*value).toFixed(2);

    this.velocity = to_i;

    var label = this.data.circle.parentElement.parentElement.children[this.data.circle.parentElement.parentElement.childElementCount-1];

    if( value === 1 )
        this.data.circle.setAttribute('fill', this.data.fill);
  
    // update the label only once since there really is no animation
    if(this.data.useLabel === true) {
        label.innerHTML = +((value*this.data.maxLabelValue).toFixed(((''+this.data.maxLabelValue).split('.')[1] || []).length)) + this.data.unit;
        label.style.width = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
        label.style.height = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
    }

    this.data.circle.style.strokeDashoffset = (1 - value) * this.data.circle.getTotalLength();
};

/**
 * Animate the progress from to the passed value from the current position.
 * @param {integer} value A value between [0,1] indicating what percentage from startAngle to stop.
 */
ProgressCircle.prototype.animateTo = function(value) {
    this.deltaValue = value - ((this.pathLength - parseInt(this.data.circle.style.strokeDashoffset, 10))/this.pathLength);
    this.data.stopValue = value;

    if(this.data.stopValue != 1) {
        this.data.fillTemp = this.data.fill;
        this.data.fill = "none";
    } else {
        this.data.fill = this.data.fillTemp;
    }

    // get our new stop angle and i_max values
    this.stopAngle = this.data.startAngle +(value * 360);
    this.i_max = +((360/this.stepSize)*value);
    this.start_time = Date.now();
    this.previous_offset = this.data.circle.style.strokeDashoffset;

    this.animate();
};

/**
 * Set the value of the circle without an animation
 * @param {integer} value A value between [0,1] indicating what percentage from startAngle to stop.
 */
ProgressCircle.prototype.set = function(value) {
    if(value > 1) value = 1;
    this.reset();
    if(value <= 0) return;
    this.angle = 0 + this.data.startAngle;
    this.i = 0;
    var to_i = +((360/this.stepSize)*value).toFixed(2);
   
    this.velocity = to_i;

    var label = this.data.circle.parentElement.parentElement.children[this.data.circle.parentElement.parentElement.childElementCount-1];
    var d;
    d = this.data.circle.getAttribute("d");
    if( this.i > to_i || (this.i === 0 && this.velocity === 0) ) {
        this.velocity = 1;
    }
    for(var n=0; n <= this.velocity; n++) {
        this.angle %= 360;
        var radians= (this.angle/180) * Math.PI;
        var x = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
        var y = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.sin(radians) * this.radius;
        
        if(this.i === 0 || d == "M0,0")
            d = "M "+x + " " + y;
        else
            d = d + " L "+x + " " + y;
        
        this.angle += (this.stepSize * this.data.direction);
        // if at the end, close the circle and stop the timer
        if( this.i >= to_i && value === 1 ) {

            this.angle += (this.stepSize * this.data.direction);
            this.angle %= 360;
            radians= (this.angle/180) * Math.PI;
            x = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
            y = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.sin(radians) * this.radius;
            d = d+ " L "+x + " " + y;
            if(this.data.stopValue === 1) d += ' Z';
      
            // set the fill
            this.data.circle.setAttribute('fill', this.data.fill);

            // update the label
            if(this.data.useLabel === true) {
                label.innerHTML = (+((this.stepSize*100*this.i)/360).toFixed(0)) + this.data.unit;
                label.style.width = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
                label.style.height = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
            }
            break;
        }

        // update the label
        if(this.data.useLabel === true) {
            label.innerHTML = (+((this.stepSize*100*this.i)/360).toFixed(0)) + this.data.unit;
            label.style.width = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
            label.style.height = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
        }
        this.i++;
    }
    if(this.velocity > 0) this.data.circle.setAttribute("d", d);
};

/**
 * Starts the animation loop
 */
ProgressCircle.prototype.start = function() {
    this.reset();
    this.start_time = Date.now();
    this.animate();
};

/**
 * This is the animation callback / entry point for the rAF implmentation
 */
ProgressCircle.prototype.animate = function() {
    var self = this;
    this.requestId = window.requestAnimationFrame(function() {
        if( (Date.now() - self.start_time) >= self.data.duration) {
            self.data.circle.style.strokeDashoffset = ((1 - self.data.stopValue) * self.data.circle.getTotalLength());
            self.data.circle.setAttribute('fill', self.data.fill);
            // update the label
            if(self.data.useLabel === true) {
                var label = self.data.circle.parentElement.parentElement.children[self.data.circle.parentElement.parentElement.childElementCount-1];
                label.innerHTML = +((self.data.stopValue*self.data.maxLabelValue).toFixed(((''+self.data.maxLabelValue).split('.')[1] || []).length)) + self.data.unit;
                label.style.width = ((self.radius+self.data.strokeWidth/2) * 2)+'px';
                label.style.height = ((self.radius+self.data.strokeWidth/2) * 2)+'px';
            }
            if(self.data.callback) self.data.callback();
        } else {
            self.render();
            self.animate();
        }
    });
};

/**
 * Renders the SVG path at the interpolated frame
 */
ProgressCircle.prototype.render = function() {
    var label = this.data.circle.parentElement.parentElement.children[this.data.circle.parentElement.parentElement.childElementCount-1];
    var now = Date.now();
    var dTime =  now - this.start_time;

    this.lerped = (dTime / this.data.duration);

    if(this.data.hasOwnProperty('easing') && ProgressCircle.hasOwnProperty(this.data.easing)) {
        this.lerped = ProgressCircle[this.data.easing](dTime, 0, 1, this.data.duration);
    }

    if(this.lerped > 1) this.lerped = 1;
    if(this.lerped < 0) this.lerped = 0;

    this.lerped = (this.lerped*(this.deltaValue) );

    this.data.circle.style.strokeDashoffset = ( (1 - this.lerped) * (this.data.circle.getTotalLength() ) ) - (this.data.circle.getTotalLength() - parseInt(this.previous_offset, 10));

    // update the label
    if(this.data.useLabel === true) {
        label.innerHTML = +(((this.pathLength - parseInt(this.data.circle.style.strokeDashoffset,10)) * this.data.maxLabelValue / this.pathLength).toFixed(((''+this.data.maxLabelValue).split('.')[1] || []).length)) + this.data.unit;
        label.style.width = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
        label.style.height = ((this.radius+this.data.strokeWidth/2) * 2)+'px';
    }

    // set the fill
    if(parseInt(this.data.circle.style.strokeDashoffset, 10) <= ((1 - this.data.stopValue) * this.data.circle.getTotalLength())) {
        this.data.circle.setAttribute('fill', this.data.fill);
    }
};

/**
 * Based on the current initialization object,
 * @return {String} A string representing the progress circle for the path element
 */
ProgressCircle.prototype.calculatePath = function(stopValue) {

    var value = this.data.stopValue;
    if(stopValue) value = stopValue;

    var i = 0;
    var angle = 0 + this.data.startAngle;

    if(value <= 0) return;
    angle = 0 + this.data.startAngle;
    var to_i = +((360/this.stepSize)*value).toFixed(2);

    velocity = to_i;

    var d, raidans, x, y;
    if( i > to_i || (i === 0 && velocity === 0) ) {
        velocity = 1;
    }
    for(var n=0; n <= velocity; n++) {
        angle %= 360;
        radians= (angle/180) * Math.PI;
        x = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
        y = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.sin(radians) * this.radius;

        if(i === 0 || d == "M0,0")
            d = "M "+x + " " + y;
        else
            d = d + " L "+x + " " + y;

        angle += (this.stepSize * this.data.direction);
        i++;
    }
    angle += (this.stepSize * this.data.direction);
    angle %= 360;
    radians= (angle/180) * Math.PI;
    x = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
    y = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.sin(radians) * this.radius;
    d = d+ " L "+x + " " + y;

    if(this.data.stopValue === 1) d += ' Z';
    return d;
};

/** ----------------
 * EASING FUNCTIONS
 * -----------------
 */

/**
 * Quadratic ease-in
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInQuad = function (t, b, c, d) {
    t /= d;
    return c*t*t + b;
};

/**
 * Quadratic ease-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeOutQuad = function (t, b, c, d) {
    t /= d;
    return -c * t*(t-2) + b;
};

/**
 * Quadratic ease-in-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

/**
 * Cubic ease-in
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInCubic = function (t, b, c, d) {
    t /= d;
    return c*t*t*t + b;
};

/**
 * Cubic ease-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeOutCubic = function (t, b, c, d) {
    t /= d;
    t--;
    return c*(t*t*t + 1) + b;
};

/**
 * Cubic ease-in-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInOutCubic = function(t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t + b;
    t -= 2;
    return c/2*(t*t*t + 2) + b;
};

/**
 * Quartic ease-in
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInQuart = function (t, b, c, d) {
    t /= d;
    return c*t*t*t*t + b;
};

/**
 * Quartic ease-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeOutQuart = function (t, b, c, d) {
    t /= d;
    t--;
    return -c * (t*t*t*t - 1) + b;
};

/**
 * Quartic ease-in-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInOutQuart = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t*t + b;
    t -= 2;
    return -c/2 * (t*t*t*t - 2) + b;
};

/**
 * Quintic ease-in
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInQuint = function (t, b, c, d) {
    t /= d;
    return c*t*t*t*t*t + b;
};

/**
 * Quintic ease-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeOutQuint = function (t, b, c, d) {
    t /= d;
    t--;
    return c*(t*t*t*t*t + 1) + b;
};

/**
 * Quintic ease-in-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInOutQuint = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t*t*t*t + b;
    t -= 2;
    return c/2*(t*t*t*t*t + 2) + b;
};

/**
 * Exponential ease-in
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInExpo = function (t, b, c, d) {
    return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
};

/**
 * Exponential ease-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeOutExpo = function (t, b, c, d) {
    return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
};

/**
 * Exponential Ease-in-out
 * @param  {Integer} t Current frame/time.
 * @param  {Integer} b Start frame/time.
 * @param  {Integer} c Delta / Step size.
 * @param  {Integer} d Total frames/time.
 * @return {Float}     The interpolated value.
 */
ProgressCircle.easeInOutExpo = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
    t--;
    return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
};