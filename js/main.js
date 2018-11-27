// Slider Swipe de testimonios
$('.lostestimonios').greatSlider({
	type: 'swipe',
	nav: false,
	bullets: true,
	autoHeight: true,
	dragIn: 2,
	layout: {
		bulletDefaultStyles: false
	}
});

// Slider Swipe de Fotos uniformes con Full Screen
const $sliderFs = $('#fotoswipe').greatSlider({
	type: 'swipe',
	nav: true,
	bullets: false,
	fullscreen: true,
	dragIn: 2
});

$('#fsBtn').click(()=>{
	$sliderFs.fullscreen('in');
});

//Slider Fade de Fotos uniformes
$('#fotos').greatSlider({
	type: 'fade',
	nav: true,
	bullets: false,
	//drag: false,
	preLoad: true,
	preLoadBy: 2,
	lazyLoad: true,
	onStepStart: (activo, index)=> {
		if (index == 3) {
			console.log('llegué a 3')
			gs.slider['fotos'].preLoad(false);
		}
	}
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
	fullscreen: true,
	//preLoad: true,
	drag: false,
	preLoad: true,
	preLoadBy: 3,
	startPosition: 3
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
	dragIn: 4,
	//preLoad: true,
	//preLoadBy: 2,
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
	onInited: (currentItems, itemActive)=>{
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

// Slider con imágenes rotas

$('#sliderroto').greatSlider({
	type: 'swipe',
	nav: true,
	items: 1,
	lazyLoad: true,
	onLoadedItem: (item, index, response)=> {
		if (response == 'error') {
			console.log(`la imagen que está en el item con index ${index} está rota, se sustituirá por otra imagen en 2 segundos...`);
			setTimeout(()=>{
				$('#imagen-rota').attr('src', 'img/naturaleza/720/7.jpg');
			}, 2000)
		}
	}
});


// Slider multiple (con mini sliders interiores)
$('#fotoswipe2').greatSlider({
	type: 'swipe',
	nav: true,
	bullets: true,
	items: 3,
	onInited: ()=>{
		$('.gs-slider').greatSlider({
			type: 'swipe',
			nav: true,
			bullets: true
		});
	}
});