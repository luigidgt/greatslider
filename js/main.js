$('#example1').greatSlider({
	type: 'swipe',
	items: 2,
	nav: false,
	autoplay: true,
	transitionSpeed: 6500,
	navSpeed: 1000,
	//log: true,
	breakPoints: {

		825: {
			nav: true
		},

		1024: {
			bullets: false
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
	}

	*/
});

/* A trabajar:
	
	Configuracion:

		 - startPosition

*/