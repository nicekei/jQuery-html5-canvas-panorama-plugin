/*
 * ddpanorama - jQuery plugin version 1.11
 * Copyright (c) Tiny Studio (http://tinystudio.dyndns.org/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Date: Wed Apr  4 09:42:51 KST 2012
 */

(function($) {
	var ddpanoramas = {
		animations : [],
		timerId : -1,
		max_speed : 43000,
		drag_constant : 1.6,
		cursorX : 0,
		cursorY : 0,
		currentTime : (new Date()).getTime()
	}
	// ddpanoramas.timerIdCursor=window.setInterval(function()
	//                                           {
	//                                           }, 1000/10
	//                                           );
	ddpanoramas.timerId = window.setInterval(function() {
		for ( var i = 0; i < ddpanoramas.animations.length; ++i) {
			ddpanoramas.animations[i].update();
		}

	}, 1000 / 30);

	ddpanoramas.mousedown = function(x, y) {
		ddpanoramas.cursorXOld = ddpanoramas.cursorX = x;
		ddpanoramas.cursorYOld = ddpanoramas.cursorY = y;
		ddpanoramas.speedX = 0;
	}

	ddpanoramas.mousemove = function(x, y) {
		ddpanoramas.cursorXOld = ddpanoramas.cursorX;
		ddpanoramas.cursorYOld = ddpanoramas.cursorY;
		ddpanoramas.cursorX = x;
		ddpanoramas.cursorY = y;
		var currentTime = (new Date()).getTime();
		var dt = (currentTime - ddpanoramas.currentTime) / 1000;
		ddpanoramas.currentTime = currentTime;
		ddpanoramas.speedX = (ddpanoramas.cursorX - ddpanoramas.cursorXOld)
				/ dt;
		if (ddpanoramas.speedX > ddpanoramas.max_speed)
			ddpanoramas.speedX = ddpanoramas.max_speed
		if (ddpanoramas.speedX < -ddpanoramas.max_speed)
			ddpanoramas.speedX = -ddpanoramas.max_speed

	}
    
	ddpanoramas.event_prefix="ddpanorama_";
	
	$(document).bind("mousemove", function(event) {
		ddpanoramas.mousemove(event.pageX, event.pageY);

	});

	$(document).bind(
			"touchmove",
			function(event) {
				ddpanoramas.mousemove(event.originalEvent.touches[0].pageX,
						event.originalEvent.touches[0].pageY);
			});

	$(document).bind(
			"touchstart",
			function(event) {
				ddpanoramas.mousedown(event.originalEvent.touches[0].pageX,
						event.originalEvent.touches[0].pageY);
			});
	$(document).bind("mousedown", function(event) {
		ddpanoramas.mousedown(event.pageX, event.pageY);
	});

	$.fn.ddpanorama = function(params) {//ddpanorama
		return this.each(function() {
					if ($(this).data("ddpanorama") != null)
						return;
					var img = $(this);//document.createElement("img");
					var parent = $(this).parent();
					var canvas = document.createElement("canvas");
					var o = {
						img : img,
						canvas : canvas,
						mousedown : false,
						draw_scale : 1.0
					};
					$(this).css('display', 'none');
					o.params = params;
					if (o.params == null)
						o.params = {};
					//console.log("o.params:" + o.params);
					o.remove = function() {
						var index = ddpanoramas.animations.indexOf(this);
						if (index >= 0) {
							ddpanoramas.animations.splice(index, 1);
						}
					}
					o.setScrollX = function(scrollX) {
//						var width = $(this.img).get()[0].naturalWidth / this.draw_scale;
//						while (scrollX >= width)
//							scrollX -= width;
//						while (scrollX < -width)
//							scrollX += width;

						$(this.canvas).prop("scrollX", scrollX);
						return scrollX;
					}
					o.scrollTo = function(pageX) {

						var mousedownScrollX = $(this.canvas).prop("mousedownScrollX");
						if (mousedownScrollX == null) return;
						var width = $(img).get()[0].naturalWidth;
						this.setScrollX(mousedownScrollX + pageX - $(this.canvas).prop("mousedownPageX"));
					}

					o.update = function() {

						var currentTime = (new Date()).getTime();
						var oldTime = $(this.canvas).prop("mousemoveTime");
						$(this.canvas).prop("mousemoveTime", currentTime);
						var dt = (currentTime - oldTime) / 1000;
						var scrollX = $(this.canvas).prop("scrollX");
						var speedX = $(this.canvas).prop("speedX");
						var ctx = this.canvas.getContext('2d');
						var width = $(this.img).get()[0].naturalWidth;//width();

						this.setScrollX(scrollX + dt * speedX);
						//linear drag
						speedX += -ddpanoramas.drag_constant * speedX * dt;
						$(this.canvas).prop("speedX", speedX);

						this.redraw();
						if (Math.abs(speedX) < 1) {
							this.stop();
							this.remove();
						}
					}
					o.stop = function() {
						$(this.canvas).prop("speedX", 0);
						//console.log("o.stop");
					}

					o.redraw = function() {
						var width = $(this.img).get()[0].naturalWidth;//width();
						var ctx = this.canvas.getContext('2d');
						var scrollX = $(this.canvas).prop("scrollX");
						var scrollXtemp=scrollX;
						scrollX /= this.draw_scale;
//						console.log("width:"+width);
//						console.log("scrollX:"+scrollXtemp);
//						console.log("scaled scrollX:"+scrollX);
						
						var loaded=false;
						if (isNaN(width) == false && width != 0) {
							while (scrollX < -width)
								scrollX += width;
							while (scrollX >= width)
								scrollX -= width;
//							console.log("conv scrollX:"+scrollX);
							var imgDOM = this.img.get()[0];
							ctx.setTransform(this.draw_scale, 0, 0, this.draw_scale, 0, 0);
							ctx.drawImage(imgDOM, (scrollX), 0);
							ctx.drawImage(imgDOM, (scrollX + width), 0);
							ctx.drawImage(imgDOM, (scrollX - width), 0);
							loaded=true;
						} else {
							ctx.setTransform(1, 0, 0, 1, 0, 0);
							ctx.fillStyle="#000000";
							ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
						}
						$(this.img).trigger(
								jQuery.Event(ddpanoramas.event_prefix+"redraw", {
									canvas : this.canvas,
									speed : $(this.canvas).prop("speedX") / ddpanoramas.max_speed,
									loaded : loaded
								}));
					}

					o.onmousedown = function(pageX) {
						//console.log("mousedown");
						var o = this;
						var canvas = this.canvas;
						this.mousedown = true;
						$(canvas).prop("speedX", 0);
						var currentTime = (new Date()).getTime();
						this.remove();
						this.stop();
						$(canvas).prop("mousedownPageX", pageX);
						$(canvas).prop("mousedownScrollX",
								$(canvas).prop("scrollX"));
						$(canvas).prop("mousemoveTime", currentTime);
					}

					o.resize = function() {
						var img = this.img;
						var canvas = this.canvas;
						var width = img.get()[0].naturalWidth;//width();
						var height = img.get()[0].naturalHeight; //height();
						if (this.params.hasOwnProperty("height")) {
							height = this.params.height;
							this.draw_scale = height
									/ img.get()[0].naturalHeight;

						} else {
							this.params.draw_scale = 1;
						}
						if (this.params.hasOwnProperty("ratio")) {
							width = height / this.params.ratio;
						} else if (this.params.hasOwnProperty("width")) {
							width = this.params.width;
						}
						//console.log('width:'+width);
						$(canvas).attr('width', width);
						$(canvas).attr('height', height);

					}

					$(this).data('ddpanorama', o);
					$(canvas).data('ddpanorama', o);
					$(canvas).prop("scrollX", 0);
					$(canvas).prop("speedX", 0);
					$(canvas).mousedown(function(event) {
						var o = $(this).data('ddpanorama');
						o.onmousedown(event.pageX);
					});

					var mouseup = function(event) {
						var o = $(this).data('ddpanorama');
						if (o.mousedown == false)
							return;
						o.mousedown = false;
						ddpanoramas.animations.push(o);
						var currentTime = (new Date()).getTime();
						var mousemoveTimeOld = $(this).prop("mousemoveTime");
						$(this).prop("mousemoveTime", currentTime);

						$(canvas).prop("speedX", ddpanoramas.speedX);
						$(canvas).prop("mousedownScrollX", null);
						//console.log("mouseup:speedX:"+speedX);
					};
					$(canvas).bind("mouseup", mouseup)
					$(canvas).bind("mouseupoutside", mouseup);

					$(canvas).bind("mousemove", function(event) {
						var pageX = event.pageX;
						var o = $(this).data('ddpanorama');
						if (o.mousedown == false)
							return;
						o.scrollTo(pageX);
						o.redraw();
					});
					$(canvas).bind("contextmenu", function(event) {
						event.preventDefault();
						return false;
					});
					$(canvas).bind("touchstart", function(event) {
						var o = $(this).data('ddpanorama');
						o.onmousedown(event.originalEvent.touches[0].pageX);
					});
					$(canvas).bind("touchmove", function(event) {
						//document.write();
						//console.log("touchmove");
						event.preventDefault();
						var o = $(this).data('ddpanorama');
						if (o.mousedown == false)
							return false;
						var pageX = event.originalEvent.touches[0].pageX;
						o.scrollTo(pageX);
						o.redraw();
					});
					$(canvas).bind("touchend", mouseup);
					o.resize();
					o.redraw();
					
					parent.append(canvas);
					$(this).load(function() {
						o.resize();
						o.redraw();
					});//load
				});
	}//ddpanorama;

})(jQuery);
