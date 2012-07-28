/*
 * ddpanorama - jQuery plugin version 1.24
 * Copyright (c) Tiny Studio (http://tinystudio.dyndns.org/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Date: Sat Jul 28 10:59:36 KST 2012
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
					
					var canvas = document.createElement("canvas");
					var o = {
						img : img,
						canvas : canvas,
						mousedown : false,
						draw_scale : 1.0,
						minSpeed : 0.0
					};
					$(this).css('display', 'none');
					o.params = params;
					if (o.params == null)
						o.params = {};
					//console.log("o.params:" + o.params);
					o.add = function() {
						var index = ddpanoramas.animations.indexOf(this);
						if (index < 0) {
							ddpanoramas.animations.push(this);
						}
					}
					o.remove = function() {
						var index = ddpanoramas.animations.indexOf(this);
						if (index >= 0) {
							ddpanoramas.animations.splice(index, 1);
						}
					}
					o.setScrollX = function(scrollX) {
                        var width = $(this.img).get()[0].naturalWidth;
                        if (isNaN(width) == false && width != 0)
                        {
                            var scrollXScale=scrollX / this.draw_scale;
                            if (this.loop)
                            {
                                while (scrollXScale < -width)
                                    scrollXScale += width;
                                while (scrollXScale >= width)
                                    scrollXScale -= width;
                            }     
                            else
                            {
                                 if (scrollXScale > this.bounceBorder) scrollXScale = this.bounceBorder;
                                 if (scrollXScale < this.widthScaled-width-this.bounceBorder) scrollXScale = this.widthScaled-width-this.bounceBorder;
                            }
                            scrollX=scrollXScale * this.draw_scale;
                            $(this.canvas).prop("scrollX", scrollX);
                        }
                        // console.log("scrollX:"+scrollX);
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
						var oldTime = $(this.canvas).prop("updateTime");
						if (oldTime == null)
							oldTime = currentTime;
						$(this.canvas).prop("updateTime", currentTime);
						var dt = (currentTime - oldTime) / 1000;
                        
						var scrollX = $(this.canvas).prop("scrollX");
                        
						var speedX = $(this.canvas).prop("speedX");
						var ctx = this.canvas.getContext('2d');
						var width = $(this.img).get()[0].naturalWidth;//width();
                        scrollX += dt * speedX;
                        scrollX=this.setScrollX(scrollX);
                        
                        var bounceForce=0;
                        if (this.loop==false)
                        {
                             var scrollXScale=scrollX / this.draw_scale;
                             if (this.bounceActive)
                             {
                                 if (scrollXScale > 0)
                                 {
                                     if (speedX > 0)
                                     {
                                         speedX=0;
                                     }
                                     bounceForce=-scrollXScale*this.bounceSpringConst;
                                }
                                else if (scrollXScale < this.widthScaled-width)
                                {
                                    if (speedX < 0)
                                    {
                                        speedX=0;
                                    }
                                    bounceForce=(this.widthScaled-width-scrollXScale) * this.bounceSpringConst;
                                 }
                             }
                         }
                         
						
						//linear drag
                         
						
                         
                         
                         //out of bound speed decay
                         if (this.loop == false && this.bounce)
                         {
                            //to quickly approach bounce edge line
                             var dt_force=dt*2.5;
                             if (scrollXScale >= 0)
                             {
                                 var s=scrollXScale;
                                 var r=s/this.bounceBorder;
                                
                                 if (s >= 0)
                                 {
                                     if (speedX < 0)
                                     {
                                        speedX *= r;
                                     
                                     }
                                 }
                         
                                 speedX += bounceForce * dt_force;
                             }
                             
                             else if (this.widthScaled-width-scrollXScale >= 0)
                             {
                                 var s=this.widthScaled-width - scrollXScale;
                                 var r=s/this.bounceBorder;
                                
                                 if (s >= 0)
                                 {
                                     if (speedX > 0)
                                     {
                                        speedX *= r;
                                     
                                     }
                                 }
                                 speedX += bounceForce * dt_force;
                             
                             }
                         }
                         speedX += ddpanoramas.drag_constant * (this.minSpeed-speedX) * dt;
						$(this.canvas).prop("speedX", speedX);
						

						this.redraw();
						if (Math.abs(speedX) < 1 && this.minSpeed == 0 && Math.abs(bounceForce) < 3) {
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

                         
                         //console.log("this.draw_scale:"+this.draw_scale);
                         var speedX = $(this.canvas).prop("speedX");
                         
						
						scrollX /= this.draw_scale;
						var loaded=false;
						if (isNaN(width) == false && width != 0) 
                         {
                          $(this.canvas).prop("forceX", 0);
                             var imgDOM = this.img.get()[0];
                             ctx.setTransform(this.draw_scale, 0, 0, this.draw_scale, 0, 0);
                         
                            if (this.loop)
                            {
                                ctx.drawImage(imgDOM, (scrollX), 0);
                                ctx.drawImage(imgDOM, (scrollX + width), 0);
                                ctx.drawImage(imgDOM, (scrollX - width), 0);
                         
                             }
                             else
                             {
                                 
                                 ctx.drawImage(imgDOM, (scrollX), 0);
                                 ctx.fillStyle=this.bounceEdgeColor;
                                 ctx.fillRect(0,0,scrollX, this.canvas.height/this.draw_scale);
                                 ctx.fillRect(width + scrollX ,0,this.bounceBorder, this.canvas.height/this.draw_scale);
                             }
                            // $(this.canvas).prop("scrollX",scrollX * this.draw_scale ); 
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
						$(canvas).prop("mousedownScrollX", $(canvas).prop("scrollX"));
						$(canvas).prop("updateTime", currentTime);
                         this.old_onselectstart=document.onselectstart;
                        document.onselectstart=function(){return false;};
                         
					}

					o.resize = function() {
						var img = this.img;
						var canvas = this.canvas;
                        var naturalWidth=img.get()[0].naturalWidth;
                        var naturalHeight=img.get()[0].naturalHeight;
                        var width = naturalWidth;
						var height = img.get()[0].naturalHeight; //height();
						if (this.params.hasOwnProperty("height")) 
                        {
							height = this.params.height;
						}
                         
						if (this.params.hasOwnProperty("ratio")) 
                        {
                            if (this.params.hasOwnProperty("width"))
                            {
                                width = this.params.width;
                                height = width * this.params.ratio;
                            }
                            else
                            {
                                width = height / this.params.ratio;
                            }
						} 
                        else if (this.params.hasOwnProperty("width")) 
                        {
							width = this.params.width;
						}
                        if (naturalHeight != 0)
		  	  this.draw_scale = height / naturalHeight;
			else
			  this.draw_scale = 1.0;
                        
			if (this.params.hasOwnProperty("startPos"))
                        {
                         //console.log("naturalWidth:"+naturalWidth);
                         //console.log("width:"+width);
                            this.setScrollX( naturalWidth * -this.params.startPos * this.draw_scale + width);
                        }
						
						$(canvas).attr('width', width);
						$(canvas).attr('height', height);
                        this.widthScaled = this.canvas.width / this.draw_scale;
                        this.bounceActive=this.bounce;
                        if (this.bounce)
                        {
                             var bounceEdge=0.8;
                             if (this.params.hasOwnProperty("bounceEdge"))
                             {
                                bounceEdge = this.params.bounceEdge;
                             }
                             this.bounceBorder=this.canvas.width * bounceEdge / this.draw_scale;
                             if ( this.bounceBorder < 1)
                             {
                                this.bounceActive=false;
                             }
                        }
                        else
                        {
                             this.bounceBorder=0;
                        }
                        
					}

					$(this).data('ddpanorama', o);
					$(canvas).data('ddpanorama', o);
					$(canvas).prop("scrollX", 0);
					$(canvas).prop("speedX", 0);

					var mouseup = function(event) {
						var o = $(this).data('ddpanorama');
						if (o.mousedown == false)
							return;
						o.mousedown = false;
						o.add();
						var currentTime = (new Date()).getTime();
						var mousemoveTimeOld = $(this).prop("updateTime");
						$(this).prop("updateTime", currentTime);

						$(canvas).prop("speedX", ddpanoramas.speedX);
						$(canvas).prop("mousedownScrollX", null);
                         document.onselectstart=this.old_onselectstart;
						//console.log("mouseup:speedX:"+speedX);
					};
					
					var minSpeed = 0;
					var interactive=true;
					if (params.hasOwnProperty("minSpeed"))
						minSpeed = params.minSpeed;
					if (params.hasOwnProperty("interactive"))
						interactive = params.interactive;
					
					if (interactive)
					{
						$(canvas).mousedown(function(event) {
							var o = $(this).data('ddpanorama');
							o.onmousedown(event.pageX);
						});
						$(canvas).css("cursor", "pointer");
                        //prevent selection
                        /*
                         disable selection : 
                         -webkit-touch-callout: none;
                         -webkit-user-select: none;
                         -khtml-user-select: none;
                         -moz-user-select: none;
                         -ms-user-select: none;
                         user-select: none;                         
                         */
                         $(canvas).css("-webkit-touch-callout", "none");
                         $(canvas).css("-webkit-user-select", "none");
                         $(canvas).css("-khtml-user-selec", "none");
                         $(canvas).css("-moz-user-select", "none");
                         $(canvas).css("-ms-user-select", "none");
                         $(canvas).css("user-select", "none");
						$(canvas).bind("mouseup", mouseup)
						$(canvas).bind("mouseupoutside", mouseup);
                         //$(canvas).bind("onselectstart", function (){return false;});
                         
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
					}
					o.minSpeed=minSpeed;
					if (minSpeed != 0)
					{
						o.add();
					}

                    o.loop=true;
                    if (params.hasOwnProperty("loop"))
                         o.loop = params.loop;
                         
                    //bounce options
                    o.bounce=true;
                    if (params.hasOwnProperty("bounce"))
                         o.bounce=params.bounce;
                    
                    o.bounceEdgeColor='#000000';
                    if (params.hasOwnProperty("bounceEdgeColor"))
                         o.bounceEdgeColor = params.bounceEdgeColor;
                    
                    o.bounceSpringConst=15;
                    if (params.hasOwnProperty("bounceSpringConst"))
                         o.bounceSpringConst = params.bounceSpringConst;
                    
					o.resize();
                    o.redraw();
                    
                    
                    
					img.after(canvas);
					 $(this).load(function() {
                         o.resize();
                         o.redraw();
					 });//load
				});
	}//ddpanorama;

})(jQuery);
