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
 * @return {null}
 */
ProgressCircle.prototype.init = function(data) {
    this.data = data;
    if(!this.data.circle) return;//circle = document.getElementById("arc");
    if(!this.data.stroke) this.data.stroke = '#EFEFEF';
    if(!this.data.startAngle) this.data.startAngle = 0;
    if(!this.data.stopValue) this.data.stopValue = 1;
    if(!this.data.strokeWidth) this.data.strokeWidth = 1;
    if(!this.data.useLabel) this.data.useLabel = false;
    if(!this.data.scaleFont) this.data.scaleFont = false;
    if(!this.data.direction) this.data.direction = 1;
    if(this.data.direction < 0 ) this.data.direction = -1;
    else this.data.direction = 1;
    
    if(this.data.stopValue != 1) this.data.fill = "none";

    // init the attr on the path
    this.data.circle.setAttribute('d','M0,0');
    this.data.circle.setAttribute('fill', 'none');
    this.data.circle.setAttribute('stroke', this.data.stroke);
    this.data.circle.setAttribute('stroke-width', this.data.strokeWidth);

    this.data.startAngle %= 360; // normalize input
    this.data.stopValue = +this.data.stopValue.toFixed(2);

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
    this.stepSize = 0.1;
    this.velocity = 1;
    this.stopAngle = this.data.startAngle + (this.data.stopValue * 360);

    this.i_max = +((360/this.stepSize)*this.data.stopValue).toFixed(0);//console.log(this.i_max);
};

/**
 * Cleans up anything necessary before it destroys the path element
 * @return {null}
 */
ProgressCircle.prototype.destroy = function() {
    if(!this.data) return;
    this.data.circle.parentNode.removeChild(this.data.circle);
    this.data = null;};
/**
 * Resets the instance data that relates to drawing
 * @return {null}
 */
ProgressCircle.prototype.reset = function() {
    // stop any rAF loops
    window.cancelAnimationFrame(this.requestId);
    // reset the d and fill attr
    this.data.circle.setAttribute('d','M0,0');
    this.data.circle.setAttribute('fill', 'none');

    // reset the label
    this.data.circle.parentElement.parentElement.children[this.data.circle.parentElement.parentElement.childElementCount-1].innerHTML = "";

    this.i = 0;
    this.angle = 0 + this.data.startAngle;
    this.time = -1;
    this.velocity = 1;
};

/**
 * Starts the animation loop
 * @return {null}
 */
ProgressCircle.prototype.start = function() {
    this.reset();
    this.start_time = Date.now();
    this.animate();
};

/**
 * This is the animation callback / entry point for the rAF implmentation  
 * @return {null}
 */
ProgressCircle.prototype.animate = function() {
    var self = this;
    this.requestId = window.requestAnimationFrame(function() {
        if( self.i >= self.i_max ) {
            self.render();
            if(self.data.callback) self.data.callback();
        } else {
            self.render();
            self.animate();
        }
    });
};

/**
 * Calculates the current deltas to add to the path's d attribute and appends them based on the delta of time.
 * @return {null}
 */
ProgressCircle.prototype.render = function() {
    var label = this.data.circle.parentElement.parentElement.children[this.data.circle.parentElement.parentElement.childElementCount-1];
    var now = Date.now();
    var dTime =  now - this.start_time;
    var to_i = +((dTime / this.data.duration) * this.i_max).toFixed(0);
    if(to_i > this.i_max) to_i = this.i_max;  // normalize within bounds
    this.velocity = to_i - this.i;
    
    var d;
    d = this.data.circle.getAttribute("d");
    if( this.i >= this.i_max || this.i === 0 && this.velocity === 0 ) {
        this.velocity = 1;
    }
    for(var n=0; n < this.velocity; n++) {
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
        if( this.i >= this.i_max ) {
            this.angle %= 360;
            radians= (this.angle/180) * Math.PI;
            x = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
            y = (this.radius+parseInt(this.data.strokeWidth, 10)/2) + Math.sin(radians) * this.radius;
            e = this.data.circle.getAttribute("d");
            d = e+ " L "+x + " " + y;

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