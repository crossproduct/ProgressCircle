function ProgressCircle() {
    // init what you need
    this.data = [];
}

ProgressCircle.prototype.init = function(circle, duration, startAngle, stroke, strokeWidth, fill, useLabel, stopValue, unit, scaleFont, callback) {
    this.cleanup();
    this.data = [];

    if(!circle) return;//circle = document.getElementById("arc");
    if(!stroke) stroke = '#EFEFEF';
    if(!startAngle) startAngle = 0;
    if(!stopValue) stopValue = 1;
    if(!strokeWidth) strokeWidth = 1;
    if(!useLabel) useLabel = false;
    if(!scaleFont) scaleFont = false;
    
    if(stopValue != 1) fill = "none";

    // init the attr on the path
    circle.setAttribute('d','M0,0');
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', stroke);
    circle.setAttribute('stroke-width', strokeWidth);
    

    startAngle %= 360; // normalize input
    stopValue = +stopValue.toFixed(2);

    var obj = {};
    obj.circle = circle;
    obj.duration = duration;
    obj.startAngle = startAngle;
    obj.stroke = stroke;
    obj.strokeWidth = strokeWidth;
    obj.fill = fill;
    obj.useLabel = useLabel;
    obj.stopValue = stopValue;
    obj.unit = unit;
    obj.scaleFont = scaleFont;
    obj.callback = callback;
    obj.timer = null;
    this.data.push(obj);

    this.radius = ((circle.parentNode.offsetWidth <= circle.parentNode.offsetHeight ? circle.parentNode.offsetWidth : circle.parentNode.offsetHeight)/2) - (strokeWidth/2);

    // init the label
    circle.parentElement.parentElement.children[circle.parentElement.parentElement.childElementCount-1].innerHTML = "";
    circle.parentElement.parentElement.children[circle.parentElement.parentElement.childElementCount-1].style.fontSize = this.radius/2 + 'px';
    circle.parentElement.parentElement.children[circle.parentElement.parentElement.childElementCount-1].style.width = ((this.radius+strokeWidth/2) * 2)+'px';
    circle.parentElement.parentElement.children[circle.parentElement.parentElement.childElementCount-1].style.height = ((this.radius+strokeWidth/2) * 2)+'px';
    circle.parentElement.parentElement.children[circle.parentElement.parentElement.childElementCount-1].style.lineHeight = ((this.radius+strokeWidth/2) * 2)+'px';

    this.i = 0;
    this.framerate = 17;
    this.angle = 0 + startAngle;
    this.finalAngle = 360 + startAngle;
    this.circumference = 2 * Math.PI * (this.radius + strokeWidth/2);
    this.stepSize = 0.1;
    this.velocity = 1;
    this.stopAngle = startAngle + (stopValue * 360);

    this.i_max = +((360/this.stepSize)*stopValue).toFixed(0);//console.log(this.i_max);

};

ProgressCircle.prototype.cleanup = function() {
    for(var n=0; n<this.data.length; n++){
        this.data[n].circle.parentNode.removeChild(this.data[n].circle);
    }
    this.data = null;
};

ProgressCircle.prototype.reset = function() {
    // stop any rAF loops
    window.cancelAnimationFrame(this.requestId);
    // reset the d and fill attr
    this.data[0].circle.setAttribute('d','M0,0');
    this.data[0].circle.setAttribute('fill', 'none');

    // reset the label
    this.data[0].circle.parentElement.parentElement.children[this.data[0].circle.parentElement.parentElement.childElementCount-1].innerHTML = "";

    this.i = 0;
    this.angle = 0 + this.data[0].startAngle;
    this.time = -1;
    this.velocity = 1;
};

ProgressCircle.prototype.start = function() {
    this.reset();
    this.start_time = Date.now();
    this.animate();
};

ProgressCircle.prototype.animate = function() {
    var self = this;
    this.requestId = window.requestAnimationFrame(function() {
        //if( +((self.stepSize*100*self.i)/360).toFixed(2) >= self.data[0].stopValue*100 ) {
        if( self.i >= self.i_max ) {
            self.render();
        } else {
            self.render();
            self.animate();
        }
    });
    //this.render();
};

ProgressCircle.prototype.render = function() {
    var now = Date.now();
    var dTime =  now - this.start_time;
    var to_i = +((dTime / this.data[0].duration) * this.i_max).toFixed(0);
    this.velocity = to_i - this.i;
    var d;
    d = this.data[0].circle.getAttribute("d");
    if( this.i >= this.i_max || this.i === 0 && this.velocity === 0 ) {
        this.velocity = 1;
    }
    for(var n=0; n < this.velocity; n++) {
        this.angle %= 360;
        var radians= (this.angle/180) * Math.PI;
        var x = (this.radius+parseInt(this.data[0].strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
        var y = (this.radius+parseInt(this.data[0].strokeWidth, 10)/2) + Math.sin(radians) * this.radius;
        //var e = this.data[0].circle.getAttribute("d");
        
        if(this.i === 0 || d == "M0,0")
            d = "M "+x + " " + y;
        else
            d = d + " L "+x + " " + y;//d = e+ " L "+x + " " + y;
        
        this.angle += this.stepSize;

        // if at the end, close the circle and stop the timer
        if( this.i >= this.i_max ) {
            //angle +=stepSize; 
            this.angle %= 360;
            radians= (this.angle/180) * Math.PI;
            x = (this.radius+parseInt(this.data[0].strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
            y = (this.radius+parseInt(this.data[0].strokeWidth, 10)/2) + Math.sin(radians) * this.radius;
            e = this.data[0].circle.getAttribute("d");
            d = e+ " L "+x + " " + y;
            //if(this.data[0].stopValue === 1) d += ' Z'; 

            this.angle +=this.stepSize;
            this.angle %= 360;
            radians= (this.angle/180) * Math.PI;
            x = (this.radius+parseInt(this.data[0].strokeWidth, 10)/2) + Math.cos(radians) * this.radius;
            y = (this.radius+parseInt(this.data[0].strokeWidth, 10)/2) + Math.sin(radians) * this.radius;
            e = this.data[0].circle.getAttribute("d");
            d = e+ " L "+x + " " + y;
            if(this.data[0].stopValue === 1) d += ' Z';
      
            // set the fill
            this.data[0].circle.setAttribute('fill', this.data[0].fill);

            // update the label
            if(this.data[0].useLabel === true) {
                this.data[0].circle.parentElement.parentElement.children[this.data[0].circle.parentElement.parentElement.childElementCount-1].innerHTML = (+((this.stepSize*100*this.i)/360).toFixed(0)) + this.data[0].unit;
                this.data[0].circle.parentElement.parentElement.children[this.data[0].circle.parentElement.parentElement.childElementCount-1].style.width = ((this.radius+this.data[0].strokeWidth/2) * 2)+'px';
                this.data[0].circle.parentElement.parentElement.children[this.data[0].circle.parentElement.parentElement.childElementCount-1].style.height = ((this.radius+this.data[0].strokeWidth/2) * 2)+'px';
            }
            circle = null; // unnecessary?
            break;
        }

        // update the label
        if(this.data[0].useLabel === true) {
            this.data[0].circle.parentElement.parentElement.children[this.data[0].circle.parentElement.parentElement.childElementCount-1].innerHTML = (+((this.stepSize*100*this.i)/360).toFixed(0)) + this.data[0].unit;
            this.data[0].circle.parentElement.parentElement.children[this.data[0].circle.parentElement.parentElement.childElementCount-1].style.width = ((this.radius+this.data[0].strokeWidth/2) * 2)+'px';
            this.data[0].circle.parentElement.parentElement.children[this.data[0].circle.parentElement.parentElement.childElementCount-1].style.height = ((this.radius+this.data[0].strokeWidth/2) * 2)+'px';
        }
        this.i++;
    }
    if(this.velocity > 0) this.data[0].circle.setAttribute("d", d);
};