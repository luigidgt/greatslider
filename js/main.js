
let $miSlider = $('#example1').greatSlider({
	type: 'swipe',
	//items: 2,
	//slideBy: 2,
	nav: true,
	//navSpeed: 500,
	bullets: true,
	fullscreen: true,
	onFullscreenIn: ()=> {
		console.log('entré a fullScreen');
	},
	onFullscreenOut: ()=>{
		console.log('salí de fullScreen');
	}
	//log: true,
	/*
	breakPoints: {
		825: {
			//nav: true
			items: 2,
			slideBy: 2
		},
		1024: {
			//bullets: false,
			items: 3,
			slideBy: 3
		},
		1280: {
			items: 4,
			slideBy: 2
		},
		1600: {
			items: 5,
			slideBy: 5
		}
	}
	*/
	
});


$('#go').click(()=>{
	$miSlider.goTo(5);
});

$('#play').click(()=>{
	$miSlider.play();
});

$('#stop').click(()=>{
	$miSlider.stop();
});

$('#next').click(()=>{
	$miSlider.goTo('next');
});

$('#prev').click(()=>{
	$miSlider.goTo('prev');
});

$('#fs').click(()=>{
	fullScreenApi.requestFullScreen($('.cualquiera').get(0));
});


/*
let $example2 = $('#example2').greatSlider({
	type: 'swipe',
	nav: false,
	bullets: true
});
*/
