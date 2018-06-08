// Slider Swipe de testimonios
$('.lostestimonios').greatSlider({
	type: 'swipe',
	nav: false,
	bullets: true,
	autoHeight: true,
	layout: {
		bulletDefaultStyles: false
	}
});

// Slider Swipe de Fotos uniformes con Full Screen
$('#fotoswipe').greatSlider({
	type: 'swipe',
	nav: true,
	bullets: false,
	fullscreen: true
});

//Slider Fade de Fotos uniformes
$('#fotos').greatSlider({
	type: 'fade',
	nav: true,
	bullets: false
});

// Slider Swipe de Fotos no uniformes
$('#fotosb').greatSlider({
	type: 'swipe',
	nav: true,
	autoHeight: true
});

// Slider Swipe de Fotos uniformes con fullscreen y lazy diferente en fullscreen
$('#fotosc').greatSlider({
	type: 'swipe',
	nav: true,
	lazyLoad: true,
	fullscreen: true
});

// Slider Swipe de foto y Videos con lazy
$('#videos').greatSlider({
	type: 'swipe',
	nav: true,
	lazyLoad: true
});

// Slider de fotos con breakpoints y botones de acción
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