/*
 * ddpanorama - jQuery plugin version 1.01
 * Copyright (c) Tiny Studio (http://tinystudio.dyndns.org/)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Date: Mon Mar 26 10:17:47 KST 2012
 */

(function( $ ) {
 var ddpanoramas={animations:[], timerId:-1, max_speed:43000, drag_constant:1.6,cursorX:0, cursorY:0, currentTime:(new Date()).getTime() }
// ddpanoramas.timerIdCursor=window.setInterval(function()
//                                           {
//                                           }, 1000/10
//                                           );
 ddpanoramas.timerId=window.setInterval(function()
                                     {
                                         for (var i=0; i < ddpanoramas.animations.length; ++i)
                                         {
                                            ddpanoramas.animations[i].update();
                                         }
                                         
                                     }, 1000/30);
 
 ddpanoramas.mousedown=function(x,y)
 {
     ddpanoramas.cursorXOld=ddpanoramas.cursorX=x;
     ddpanoramas.cursorYOld=ddpanoramas.cursorY=y;
     ddpanoramas.speedX=0;
 }
 
 ddpanoramas.mousemove=function(x,y)
 {
     ddpanoramas.cursorXOld=ddpanoramas.cursorX;
     ddpanoramas.cursorYOld=ddpanoramas.cursorY;
     ddpanoramas.cursorX=x;
     ddpanoramas.cursorY=y;
     var currentTime=(new Date()).getTime();
     var dt=(currentTime-ddpanoramas.currentTime)/1000;
     ddpanoramas.currentTime = currentTime;
     ddpanoramas.speedX = (ddpanoramas.cursorX-ddpanoramas.cursorXOld)/dt;
     if (ddpanoramas.speedX > ddpanoramas.max_speed)
        ddpanoramas.speedX = ddpanoramas.max_speed
     if (ddpanoramas.speedX < - ddpanoramas.max_speed)
        ddpanoramas.speedX = -ddpanoramas.max_speed
     
 }
 
 $(document).bind("mousemove", function(event){
                  ddpanoramas.mousemove(event.pageX, event.pageY);

                  });
 
 $(document).bind("touchmove", function(event){
                  ddpanoramas.mousemove(event.originalEvent.touches[0].pageX, event.originalEvent.touches[0].pageY);
                  });
 
 $(document).bind("touchstart", function(event)
                {
                  ddpanoramas.mousedown(event.originalEvent.touches[0].pageX, event.originalEvent.touches[0].pageY);
                  });
 $(document).bind("mousedown", function(event)
                  {
                  ddpanoramas.mousedown(event.pageX, event.pageY);
                  });

 $.fn.ddpanorama = function(params) 
 {//ddpanorama
 return this.each(function() {
     if ($(this).data("ddpanorama")!=null) return;
     var img=$(this);//document.createElement("img");
     var parent=$(this).parent();
     var canvas=document.createElement("canvas");
     var o={img:img,canvas:canvas,mousedown:false};
     o.params=params;
     o.remove=function() {
         var index=ddpanoramas.animations.indexOf(this);
         if (index >= 0)
         {
            ddpanoramas.animations.splice(index, 1);
         }
     }

     o.scrollTo=function(pageX){

      var mousedownScrollX=$(this.canvas).prop("mousedownScrollX");
      if (mousedownScrollX==null) return;
      var width=$(img).get()[0].naturalWidth;
      var scrollX=mousedownScrollX+pageX-$(this.canvas).prop("mousedownPageX");
      while (scrollX >= width)
          scrollX -= width;
      while (scrollX < 0)
          scrollX += width;
      $(this.canvas).prop("scrollX", scrollX);
     }
   
     o.update=function(){
         var currentTime=(new Date()).getTime();
         var oldTime=$(this.canvas).prop("mousemoveTime");
         $(this.canvas).prop("mousemoveTime", currentTime);
         var dt=(currentTime-oldTime)/1000;
         var scrollX=$(this.canvas).prop("scrollX", scrollX);
         var speedX=$(this.canvas).prop("speedX");
         var ctx=this.canvas.getContext('2d');
         var width=$(this.img).get()[0].naturalWidth;//width();
                      
         scrollX += dt * speedX;
         while (scrollX >= width)
             scrollX -= width;
         while (scrollX < 0)
             scrollX += width;
         //linear drag
         speedX += - ddpanoramas.drag_constant * speedX * dt;
         $(this.canvas).prop("speedX",speedX);
         $(this.canvas).prop("scrollX",scrollX);
         this.redraw();
         if (Math.abs(speedX) < 1)
         {
             this.stop();
             this.remove();
         }
     }
     o.stop=function(){
        $(this.canvas).prop("speedX", 0);
        //console.log("o.stop");
     }
 
     o.redraw = function(){
         var width=$(this.img).get()[0].naturalWidth;//width();
         var ctx=this.canvas.getContext('2d');
         var scrollX=$(this.canvas).prop("scrollX");
         
         var imgDOM=this.img.get()[0];
         ctx.drawImage(imgDOM, scrollX,0);
         ctx.drawImage(imgDOM, scrollX+width,0);
         ctx.drawImage(imgDOM, scrollX-width,0);
         $(this.img).trigger(jQuery.Event("ddpanorama_redraw", {canvas:this.canvas,speed:$(this.canvas).prop("speedX")/ddpanoramas.max_speed}));
     }

     o.onmousedown=function(pageX){
         //console.log("mousedown");
         var o= this;
         var canvas=this.canvas;
         this.mousedown=true;
         $(canvas).prop("speedX",0);
         var currentTime=(new Date()).getTime();
         this.remove();
         this.stop();
         $(canvas).prop("mousedownPageX", pageX);
         $(canvas).prop("mousedownScrollX", $(canvas).prop("scrollX"));
         $(canvas).prop("mousemoveTime", currentTime);
     }

     o.resize=function(){
         var img=this.img;
         var canvas=this.canvas;
         var width=img.get()[0].naturalWidth;//width();
         var height=img.get()[0].naturalHeight; //height();
         if (o.params.hasOwnProperty("ratio"))
         {
             width=height/o.params.ratio;
         }
         else if (o.params.hasOwnProperty("width"))
         {
             width=params.width;
         }
         //console.log('width:'+width);
         $(canvas).attr('width', width);
         $(canvas).attr('height', height);
     
     }

    $(this).data('ddpanorama', o);
    $(canvas).data('ddpanorama', o);
    $(canvas).prop("scrollX",0);
    $(canvas).prop("speedX",0);
    $(canvas).mousedown(function(event){
                          var o= $(this).data('ddpanorama');
                          o.onmousedown(event.pageX);
                      });

    var mouseup=function(event){
      var o= $(this).data('ddpanorama');
      if (o.mousedown==false) return;
      o.mousedown=false;
      ddpanoramas.animations.push(o);
      var currentTime=(new Date()).getTime();
      var mousemoveTimeOld=$(this).prop("mousemoveTime");
      $(this).prop("mousemoveTime", currentTime);
      
      $(canvas).prop("speedX", ddpanoramas.speedX );
      $(canvas).prop("mousedownScrollX", null);
      //console.log("mouseup:speedX:"+speedX);
    };
    $(canvas).bind("mouseup",mouseup)
    $(canvas).bind("mouseupoutside",mouseup);
                  
    $(canvas).bind("mousemove", function(event){
                          var pageX=event.pageX;
                          var o= $(this).data('ddpanorama');
                          if (o.mousedown==false) return;
                          o.scrollTo(pageX);
                          o.redraw();
                      });
    $(canvas).bind("contextmenu", function(event){
                 e.preventDefault();
                 return false;                 
                 });                
    $(canvas).bind("touchstart", function(event) {
                 var o= $(this).data('ddpanorama');
                 o.onmousedown(event.originalEvent.touches[0].pageX);
                 });
    $(canvas).bind("touchmove", function(event){
                 //document.write();
                 //console.log("touchmove");
                 event.preventDefault();
                 var o= $(this).data('ddpanorama');
                 if (o.mousedown==false) return false;
                 var pageX = event.originalEvent.touches[0].pageX;
                 o.scrollTo(pageX);
                 o.redraw();
                 });
    $(canvas).bind("touchend",mouseup);
    o.resize();
    o.redraw();
    $(this).css('display','none');
    parent.append(canvas);
    $(this).load(function (){
               o.resize();
               o.redraw();
             });//load
    });
 }//ddpanorama;
 
 })( jQuery );


