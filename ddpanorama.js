/*
 * ddpanorama - jQuery plugin version 1.43
 * Copyright (c) Tiny Studio (http://tinystudio.iptime.org/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Date: 2014/09/17 11:57:29 KST 
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
    
	ddpanoramas.event_prefix="dd";
	
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
		//clone input parameters to prevent not intended side effects eg. overwritting user parameters
		params = $.extend( true, {}, $.fn.ddpanorama.defaults, params );
		var hasSizeParameter=false;
		for (var key in params)
		{
			//console.log("key:"+key);
			if (key=="width" || key=="height" || key=="ratio")
			{
				hasSizeParameter=true;
				break;
			}
		}
		return this.each(function() {
					if ($(this).data('ddpanorama') != null)
					{
						if (params != null)
						{
							var o=$(this).data('ddpanorama');
							if (hasSizeParameter)
							{
								if (o.params.hasOwnProperty("width"))
								{
									delete o.params.width;
									//console.log("remove width");
								}
								if (o.params.hasOwnProperty("height"))
								{
									delete o.params.height;
									//console.log("remove height");
								}
								if (o.params.hasOwnProperty("ratio"))
								{
									delete o.params.ratio;
									//console.log("remove ratio");
								}
								//console.log("hasSizeParameter");
							}
							for (var key in params)
							{
								o.params[key]=params[key];
								//console.log("copying key "+key);
							}
							//check if one of the size parameter is specified
							//if this is the case, we need to drop old size parameters
							
							if (o.params.minSpeed != 0)
							{
								o.add();
							}
							o.bindevent();
							o.resize();
						}
						
						return;
					}
						 
					var img = $(this);//document.createElement("img");
					
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
					o.notifyStartMove=function()
					{
						if (this.startmovecalled != true)
						{
							this.startmovecalled=true;
							var scrollX = $(this.canvas).prop("scrollX");
							var width = $(this.img).get()[0].naturalWidth;
							$(this.img).trigger(
									jQuery.Event(ddpanoramas.event_prefix+"startmove", {
										canvas : this.canvas,
										scrollX : scrollX,
										width : width
									}));
						}
					}

					o.add = function() {
						$(canvas).prop("updateTime", (new Date()).getTime());
						var index = ddpanoramas.animations.indexOf(this);
						if (index < 0) {
							ddpanoramas.animations.push(this);
							this.notifyStartMove();
						}
					}
					o.remove = function() {
						var index = ddpanoramas.animations.indexOf(this);
						if (index >= 0)
						{
							var scrollX = $(this.canvas).prop("scrollX");
							var width = $(this.img).get()[0].naturalWidth;
							
							$(this.img).trigger(
									jQuery.Event(ddpanoramas.event_prefix+"stopmove", {
										canvas : this.canvas,
										scrollX : scrollX,
										width : width
									}));
							this.startmovecalled=false;
							ddpanoramas.animations.splice(index, 1);
						}
					}
					o.setScrollX = function(scrollX) {
						//console.log("setScrollX:"+scrollX);
                        var width = $(this.img).get()[0].naturalWidth;
						//console.log("setScrollX - width:"+width);
                        if (isNaN(width) == false && width != 0)
                        {
                            var scrollXScale=scrollX / this.draw_scale;
                            if (this.params.loop)
                            {
                                while (scrollXScale < -width)
                                    scrollXScale += width;
                                while (scrollXScale >= width)
                                    scrollXScale -= width;
                                    
                                if (Math.abs(scrollXScale + width) < Math.abs(scrollXScale))
                                {
                                	scrollXScale += width;
                                }
                                if (Math.abs(scrollXScale - width) < Math.abs(scrollXScale))
                                {
                                	scrollXScale -= width;
                                }
                                
                            }     
                            else
                            {
                                 if (scrollXScale > this.bounceBorder) scrollXScale = this.bounceBorder;
                                 if (scrollXScale < this.widthScaled-width-this.bounceBorder) scrollXScale = this.widthScaled-width-this.bounceBorder;
                            }
                            scrollX=scrollXScale * this.draw_scale;
                            $(this.canvas).prop("scrollX", scrollX);
                        }
//                         console.log("scrollX:"+scrollX+",width:"+width);
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
                        if (this.params.loop==false)
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
                                     bounceForce=-scrollXScale*this.params.bounceSpringConst;
                                }
                                else if (scrollXScale < this.widthScaled-width)
                                {
                                    if (speedX < 0)
                                    {
                                        speedX=0;
                                    }
                                    bounceForce=(this.widthScaled-width-scrollXScale) * this.params.bounceSpringConst;
                                 }
                             }
                         }
                         
						
						//linear drag
                         
						
                         
                         
                         //out of bound speed decay
                         if (this.params.loop == false && this.params.bounce)
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
                         speedX += ddpanoramas.drag_constant * (this.params.minSpeed-speedX) * dt;
						$(this.canvas).prop("speedX", speedX);
						

						this.redraw();
						if (Math.abs(speedX) < 1 && this.params.minSpeed == 0 && Math.abs(bounceForce) < 3) {
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

                         
                        //console.log("scrollX:"+scrollX);
						//console.log("this.draw_scale:"+this.draw_scale);
                         var speedX = $(this.canvas).prop("speedX");
                         
						
						scrollX /= this.draw_scale;
						var loaded=false;
						if (isNaN(width) == false && width != 0) 
                         {
                          $(this.canvas).prop("forceX", 0);
                             var imgDOM = this.img.get()[0];
						 //console.log("this.draw_scale:"+this.draw_scale);
                             ctx.setTransform(this.draw_scale, 0, 0, this.draw_scale, 0, 0);
                         
                            if (this.params.loop)
                            {
                                ctx.drawImage(imgDOM, (scrollX), 0);
                                ctx.drawImage(imgDOM, (scrollX + width), 0);
                                ctx.drawImage(imgDOM, (scrollX - width), 0);
								//console.log("imgDOM(1):"+imgDOM);
								//console.log("scrollX(1):"+scrollX);
								//console.log("scrollX + width(1):"+scrollX + width);
                             }
                             else
                             {
                                 
                                 ctx.drawImage(imgDOM, (scrollX), 0);
                                 ctx.fillStyle=this.params.bounceEdgeColor;
                                 ctx.fillRect(0,0,scrollX, this.canvas.height/this.draw_scale);
                                 ctx.fillRect(width + scrollX ,0,this.bounceBorder, this.canvas.height/this.draw_scale);
								//console.log("scrollX(2):"+scrollX);
								//console.log("scrollX + width(2):"+scrollX + width);
						 
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
									scrollX : scrollX,
									width : width,
									speed : $(this.canvas).prop("speedX") / ddpanoramas.max_speed,
									loaded : loaded
								}));
					}

					o.onmousedown = function(pageX) {
//						console.log("mousedown");
						var o = this;
						var canvas = this.canvas;
						this.mousedown = true;
						var scrollX = $(this.canvas).prop("scrollX");
						$(canvas).prop("speedX", 0);
						$(canvas).focus();
						this.remove();
						this.stop();
						$(canvas).prop("mousedownPageX", pageX);
						$(canvas).prop("mousedownScrollX", $(canvas).prop("scrollX"));
						$(canvas).prop("updateTime", (new Date()).getTime());
                        this.old_onselectstart=document.onselectstart;
						document.onselectstart=function(){return false;};
						var scrollX = $(this.canvas).prop("scrollX");
						var width = $(this.img).get()[0].naturalWidth;
						
						$(this.img).trigger(
								jQuery.Event(ddpanoramas.event_prefix+"mousedown", {
									canvas : this.canvas,
									scrollX : scrollX,
									width : width
								}));
						 
						this.notifyStartMove();
					}

					o.resize = function() {
						var img = this.img;
						var canvas = this.canvas;
                        var naturalWidth=img.get()[0].naturalWidth;
                        var naturalHeight=img.get()[0].naturalHeight;
                        var width = naturalWidth;
						var height = naturalHeight; //height();
						console.log("resize.naturalWidth:"+naturalWidth);
						console.log("resize.naturalHeight:"+naturalHeight);
						if (this.params.hasOwnProperty("height")) 
                        {
							//console.log("height:"+this.params.height);
							height = this.params.height;
						}
                         
						if (this.params.hasOwnProperty("ratio")) 
                        {
							//console.log("ratio:"+this.params.ratio);
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
						 //console.log("width:"+width);
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
                        this.bounceActive=this.params.bounce;
                        if (this.params.bounce)
                        {
                             var bounceEdge=this.params.bounceEdge;
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
						//console.log("this.bounceBorder:"+this.bounceBorder);
						$(img).trigger(jQuery.Event(ddpanoramas.event_prefix+"resize", {canvas : canvas, width:naturalWidth}));
						//console.log("this:"+this);
						//calling immediately after size event is sometimes problematic in chrome
						//this.add();
						if (this.loaded) this.redraw();
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
						$(canvas).prop("updateTime", (new Date()).getTime());
						$(canvas).prop("speedX", ddpanoramas.speedX);
						$(canvas).prop("mousedownScrollX", null);
                        document.onselectstart=this.old_onselectstart;
						//console.log("mouseup:speedX:"+speedX);
						var scrollX = $(canvas).prop("scrollX");
						var width = $(o.img).get()[0].naturalWidth;
						
						$(o.img).trigger(
								jQuery.Event(ddpanoramas.event_prefix+"mouseup", {
									canvas : canvas,
									scrollX : scrollX,
									width : width
								}));
						 
					};
					
					o.bindevent = function()
					{
						var o = this;
						var canvas = this.canvas;
						$(canvas).unbind("mousedown");
						$(canvas).unbind("mouseup");
						$(canvas).unbind("mouseupoutside")
						$(canvas).unbind("mousemove");
						$(canvas).unbind("contextmenu");
						$(canvas).unbind("touchstart");
						$(canvas).unbind("touchmove");
						$(canvas).unbind("touchend");
						if (this.params.interactive)
						{
							$(canvas).bind("mousedown", function(event) {
								var o = $(this).data('ddpanorama');
								o.onmousedown(event.pageX);
							});
						 
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
								return true;
							});
							$(canvas).bind("touchend", mouseup);
						}
						else
						{
							var mouseupdummy=function(event){
											if (o.mousedown == false) return;
											o.mousedown = false;
											document.onselectstart=this.old_onselectstart;
										}
							$(canvas).bind("mousedown",function(event){
											this.old_onselectstart=document.onselectstart;
											document.onselectstart=function(){return false;};
											o.mousedown=true;
										});
							$(canvas).bind("mouseup",mouseupdummy);
							$(canvas).bind("mouseupoutside",mouseupdummy)
							
						}
					}
					
						 

                    
                    o.bindevent();
					//o.resize();
					$(canvas).addClass("ddpanorama");
                    o.loaded=false;
                    
                    
						 
					$(this).imagesLoaded(function(){
						var width = $(img).get()[0].naturalWidth;
						img.after(canvas);
						$(img).trigger(jQuery.Event(ddpanoramas.event_prefix+"init", {canvas : canvas, width:width}));
                        o.resize();
						o.redraw();
						o.loaded=true;
                         if (params.minSpeed != 0)
                         {
                                         o.add();
                         }
                                         
						
						});
				});
	}//ddpanorama;
	
	$.fn.ddpanorama.defaults = {
		interactive:true,
		minSpeed:0,
		loop:true,
		bounce:true,
		bounceEdge:0.8,
		bounceEdgeColor:"#000000",
		bounceSpringConst:15
	};
})(jQuery);
