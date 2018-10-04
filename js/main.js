	
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
const $sliderFs = $('#fotoswipe').greatSlider({
	type: 'swipe',
	nav: true,
	bullets: false,
	fullscreen: true
});

$('#fsBtn').click(()=>{
	$sliderFs.fullscreen('in');
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
	autoHeight: true,
	breakPoints: {
		1600: {
			items: 2
		}
	}
});

// Slider Swipe de Fotos uniformes con fullscreen y lazy diferente en fullscreen
const $fotosc = $('#fotosc').greatSlider({
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
	fullscreen: true,
	breakPoints: {
		768: {
			items: 2
		},
		1024: {
			items: 3,
			bullets: false,
			nav: true
		},
		1280: {
			items: 4,
			bullets: true
		},
		1600: {
			bullets: false,
			items: 5
		}
	},
	onInited: ()=>{
		$('#breakpoints').find('.img-slider').click(function(){
			$miSlider.fullscreen('in', $(this).parent().parent().index() + 1);
		});
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

// Break points simples
let $bksimples = $('#bpsimples').greatSlider({
	type: 'swipe',
	nav: true,
	navSpeed: 800,
	lazyLoad: true,
	items: 1,
	fullscreen: true,
	breakPoints: {
		1024: {
			items: 2,
			slideBy: 2
		}
	}
});

// Slider Swipe de Fotos uniformes con parametros de configuración en atributo data
$('#fotosdata').greatSlider();


// Slider con auto Destroy
$('#autodestroy').greatSlider({
	type: 'swipe',
	nav: false,
	navSpeed: 500,
	lazyLoad: true,
	bullets: true,
	items: 1,
	fullscreen: true,
	autoDestroy: true,
	breakPoints: {
		768: {
			items: 2
		},
		1024: {
			items: 3,
			bullets: false,
			nav: true
		},
		1600: {
			items: 4
		}
	}
});


$('#sliderconapi').greatSlider({
	type: 'swipe',
	nav: true,
	items: 1,
	breakPoints: {
		768: {
			items: 2
		},
		1024: {
			items: 3
		}
	}
});


$('#gob').click(()=>{
	gs.slider['sliderconapi'].goTo(6);
});

$('#playb').click(()=>{
	gs.slider['sliderconapi'].autoPlay('play');
});

$('#stopb').click(()=>{
	gs.slider['sliderconapi'].autoPlay('stop');
});

$('#nextb').click(()=>{
	gs.slider['sliderconapi'].goTo('next');
});

$('#prevb').click(()=>{
	gs.slider['sliderconapi'].goTo('prev');
});