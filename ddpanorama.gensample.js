var panoIndex=0;
function addSamplePano(options)
{
    var optionStr;
    var src="night3.jpeg";
    if (arguments.length == 2)
    {
        src=arguments[0];
        options=arguments[1];
        optionStr=JSON.stringify(options);
    }
    else if (arguments.length == 3)
    {
        src=arguments[0];
        options=arguments[1];
        optionStr=arguments[2];
    }
    else
    {
        optionStr=JSON.stringify(options);
    }
    
    
    var panoId="pano"+panoIndex;
    document.write("<h2>"+ optionStr + "</h2>");
    document.write('<img id="'+panoId+'" src="'+ src+ '" alt="" />');
    jQuery(function(){jQuery("#"+panoId).ddpanorama(options);});
    ++panoIndex;
}
