$('#example1').greatSlider({
	type: 'fade',
	//nav: false,
	autoplay: true,
	transitionSpeed: 6500,
	navSpeed: 1000,
	breakPoints: {

		820: {
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
	onLoadingItem: ($img, index) => {
		console.log('Está cargando... ', $img, index)
	},
	onLoadedItem: ($img, index, status) => {
		console.log('Yá cargó:', $img, index, status)
	}
	*/
});