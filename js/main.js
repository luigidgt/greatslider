
let $miSlider = $('#example1').greatSlider({
	type: 'swipe',
	nav: true,
	navSpeed: 500,
	lazyLoad: true
});


$('#go').click(()=>{
	$miSlider.goTo(5);
});

$('#play').click(()=>{
	$miSlider.autoPlay('play');
});

$('#stop').click(()=>{
	$miSlider.autoPlay('stop');
});

$('#next').click(()=>{
	$miSlider.goTo('next');
});

$('#prev').click(()=>{
	$miSlider.goTo('prev');
});

$('#fs').click(()=>{
	//fullScreenApi.requestFullScreen($('.cualquiera').get(0));
	$miSlider.fullscreen('in');
});


/*
let $example2 = $('#example2').greatSlider({
	type: 'swipe',
	nav: false,
	bullets: true
});
*/
