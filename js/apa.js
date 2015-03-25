/*-----------------------------
Advanced Path Animation v1.1.0
(c) 2015 <http://vrnehot.ru>
------------------------------*/
function APA(opt){
	this.offset = 0; // 0..1
	this.duration = 1000;
	this.loop = Infinity;
	this.easing = null; // function(p){ return p; }
	this.fps = 60;
	this.path = ''; // svg path element || svg path string
	this.checkpoints = {}; // { "p":function(){} } where p = 0..1
	this.speed = 1;

	if(opt){ for(var i in opt)if(opt.hasOwnProperty(i)){ this[i] = opt[i]; } }
	this.init();
}
APA.prototype.init = function(){
	if( this.path ) this.updatePath(this.path);
	this.setFPS(this.fps || 60);
	this.timer = null;
}
APA.prototype.start = function(opt){
	this.stop();
	this.progress = this.offset || 0;

	if(!this.duration) return false;
	this.lastFrame = new Date();
	this.running = true;
	this.elapsed = 0;

	this.update();
}
APA.prototype.update = function(){
	var z = this, now = new Date(), tslf = now - this.lastFrame, lp; this.lastFrame = now;
	this.timer = setTimeout(function(){ z.update(); },this.dbf);
	if(!this.running) return;

	this.elapsed += (tslf * this.speed);
	lp = this.progress;
	this.progress = this.elapsed / this.duration;

	if( typeof this.easing == 'function' ) this.progress = this.easing(this.progress);
	if(this.reverse) this.progress = this.offset - this.progress;
	else this.progress += this.offset;

	if(this.progress < 0 || this.progress > 1){
		if(this.loop){
			if(typeof this.lap == 'function'){ this.lap.call( this ); }
			if(this.loop != Infinity){ this.loop--; }
		}
		else{
			this.stop();
			if(typeof this.finish == 'function'){ return this.finish.call( this ); }
		}
	}
	this.angle = this.angleAt(this.progress);
	this.point = this.pointAt(this.progress);
	this.checkPoints(Math.min(this.progress,lp),Math.max(this.progress,lp));
	if(typeof this.step == 'function'){ this.step.call(this); }
}
APA.prototype.pause = function(){ this.running = false; }
APA.prototype.resume = function(){ this.running = true; }
APA.prototype.toggle = function(){ this.running = !this.running; }
APA.prototype.stop = function(){
	clearTimeout( this.timer );
	this.timer = null;
	this.running = false;
}
APA.prototype.checkPoints = function(min,max){
	var point;
	for(var i in this.checkpoints)if(this.checkpoints.hasOwnProperty(i)){
		point = this.checkpoints[i];
		if(i > min && i < max && typeof point == 'function'){ point.call( this ); }
	}
}
APA.prototype.pointAt = function(progress){ return this.path.getPointAtLength( this.len * progress ); }
APA.prototype.angleAt = function(progress){
	var p = [this.pointAt(progress - 0.01),this.pointAt(progress + 0.01)];
	return Math.atan2(p[1].y-p[0].y,p[1].x-p[0].x)*180 / Math.PI;
}

APA.prototype.updatePath = function(path){
	if(typeof path == 'string'){
		this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		this.path.setAttribute('d', path);
	}
	else{ this.path = path; }
	this.len = this.path.getTotalLength();
}
APA.prototype.addCheckpoint = function(p,fn){ this.checkpoints[p] = fn; }
APA.prototype.setFPS = function(fps){
	fps = parseInt(fps);
	if(fps){ this.fps = fps; this.dbf = 1000 / fps; }
}
APA.prototype.setSpeed = function(spd){
	this.speed = parseFloat(spd);
}
