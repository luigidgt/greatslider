$('#example1').greatSlider({
	type: 'swipe',
	items: 1,
	//slideBy: 2,
	nav: true,
	autoplay: true,
	transitionSpeed: 6500,
	navSpeed: 1000,
	bullets: false,
	//log: true,
	breakPoints: {

		825: {
			//nav: true
			items: 2,
			slideBy: 2
		},

		1024: {
			bullets: false,
			items: 3,
			slideBy: 3
		},

		1600: {
			items: 4,
			slideBy: 4
		}
	}

	/*

	onInit: function(){
		console.log('Inicializando Slider');
	},

	onInited: () => {
		console.log('Sistema inicializado XD');
	},

	onLoadingItem: ($img, index) => {
		console.log('Está cargando... ', $img, index)
	},

	onLoadedItem: ($img, index, status) => {
		console.log('Yá cargó:', $img, index, status)
	},

	onResized: (width) => {
		console.log('El ancho es: ' + width);
	},

	onLastItem: () => {
		console.log('llegué al último item');
	}

	*/
});

/* A trabajar:
	
	Configuracion:

		 - startPosition

*/