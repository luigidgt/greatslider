
let $miSlider = $('#example1').greatSlider({
	type: 'fade',
	//items: 2,
	//slideBy: 2,
	nav: true,
	//bullets: true,
	//fullscreen: true,
	//preLoad: true,
	autoHeight: true,
	/*
	breakPoints: {

		768: {
			items: 2,
			slideBy: 2
		},

		1366: {
			items: 3,
			slideBy: 3
		},

		1600: {
			items: 4,
			slideBy: 4
		},

		1850: {
			items: 5,
			slideBy: 1
		}

	},
	*/
	onInit: ()=> {
		console.log('Iniciando el slider maestro');
	},
	onInited: ()=> {
		console.log('Slider iniciado!');
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
