/*

	let $miSlider = $('#example1').greatSlider({
		type: 'swipe',
		nav: true,
		navSpeed: 500,
		lazyLoad: true,
		bullets: true,
		items: 3,
		breakPoints: {
			1280: {
				items: 1
			}
		}
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
*/

// Slider de testimonios
$('.lostestimonios').greatSlider({
	type: 'swipe',
	nav: false,
	bullets: true,
	autoHeight: true,
	layout: {
		bulletDefaultStyles: false
	}
});

// Slider de fotos

$('#fotos').greatSlider({
	type: 'swipe',
	nav: true,
	bullets: false,
	fullscreen: true
});