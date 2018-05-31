
let $miSlider = $('#breakpoints').greatSlider({
	type: 'swipe',
	nav: false,
	navSpeed: 500,
	lazyLoad: true,
	bullets: true,
	items: 1,
	breakPoints: {
		768: {
			items: 2
		},
		1280: {
			items: 3,
			bullets: false,
			nav: true
		},
		1366: {
			items: 4,
			bullets: true
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

// Slider de testimonios
let $losTestimonios = $('.lostestimonios').greatSlider({
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

// Slider de fotos no uniformes
$('#fotosb').greatSlider({
	type: 'swipe',
	nav: true,
	autoHeight: true
});

// Slider de fotos no uniformes
$('#fotosc').greatSlider({
	type: 'swipe',
	nav: true,
	lazyLoad: true,
	fullscreen: true
});

// Slider de videos con lazy
$('#videos').greatSlider({
	type: 'swipe',
	nav: true,
	lazyLoad: true
});