let $miSlider = $('#example1').greatSlider({
	type: 'swipe',
	items: 1,
	//slideBy: 1,
	nav: true,
	autoplay: true,
	navSpeed: 500,
	bullets: true,
	//log: true,
	autoplay: true,
	autoPlaySpeed: 2500,
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
})