(function($){
	
	$.fn.greatSlider = function(options){

		let _this = this;
		
		if (!_this.length) return console.error('* Great Slider [Logger] : No existe el contenedor maestro para hacer el slider.');

		let settings = {
			type: 'fade', // fade, swipe
			transitionTime: 1000, // en milisegundos
			nav: true, // true, false
			bullets: true, // true, false
			autoplay: true, // true, false
			log: false,
			layout: {

				containerItems: '.gs-container-items',
				wrapperItems: '.gs-wrapper-items',
				item: '.gs-item-slider',
				itemActive: '.gs-item-active',
				itemLoading: '.gs-item-loading',
				itemLoaded: '.gs-item-loaded',

				toLazy: '.gs-tolazy',

				containerNavs: '.gs-container-navs',
				wrapperArrows: '.gs-wrapper-arrows',

				arrow: '.gs-arrow-nav',
				arrowPrev: '.gs-prev-arrow',
				arrowNext: '.gs-next-arrow',

				wrapperBullets: '.gs-wrapper-bullets',
				bullet: '.gs-bullet',
				bulletActive: '.gs-bullet-active',

				noneClass: '.gs-none',
				attachedClass: '.gs-attached'
			}
		};
		if (options !== undefined) settings = $.extend(settings, options);

		// variables globales
		let sLayout = settings.layout,
				items = _this.find(sLayout.item),
				nItems = items.length,
				attachedClass = sLayout.attachedClass.substr(1),
				displayNodeClass = sLayout.noneClass.substr(1),
				log = [];

		let actions = {

			init: function(){
				this.log({
					type: 'not',
					text: 'Sistema inicializado.'
				});

				// ejecutando evento nativo de inicialización
				let onInit = settings.onInit;
				if (onInit !== undefined) onInit();

				// Constructor de los Items
				this.items(settings.type);

				// Constructor de Bullets y anidación de eventos click
				this.bullets(); 

				// Anidando evento click a los Arrows
				this.navs();

				// Setiemos los breakPoints
				let _objThis = this;
				let theBreakPoints = settings.breakPoints;
				if(theBreakPoints !== undefined) {
					_objThis.breakPoints(theBreakPoints)
					window.idxSliderBP = false;

					$(window).resize(function(){
						if (idxSliderBP !== false) clearTimeout(idxSliderBP);

						window.idxSliderBP = setTimeout(() => {
							_objThis.breakPoints(theBreakPoints);
						}, 1000);

					});

				}
			},

			items: function(action) {
				let _thisActions = this;
				let $wrapperItems = _this.find(sLayout.wrapperItems);

				// Los Items
				let sliderType = {

					fade: () => { // desaparecimiento
						$wrapperItems.addClass('gs-transition-fade');
						let $firstItem = $wrapperItems.find(sLayout.item).eq(0);
						$firstItem.addClass(sLayout.itemActive.substr(1));
						_thisActions.loadImage($firstItem);
					},

					swipe: () => { // arrastre
						$wrapperItems.addClass('gs-transition-swipe');
					}

				}

				let typeRun = sliderType[settings.type];
				(typeRun !== undefined) ? typeRun(settings) : _log('err', 'el tipo de slider determinado no es válido');
			},

			navs: function() {
				let _objThis = this;

				// verificación
				let $wrapperArrows = _this.find(sLayout.wrapperArrows);
				if (!settings.nav) {
					return $wrapperArrows.addClass(displayNodeClass);
				} else {
					if ($wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.removeClass(displayNodeClass);
				}

				_this.find(sLayout.arrow).on('click', function(){
					let activeItem = _this.find(sLayout.wrapperItems + ' ' + sLayout.itemActive);
					let activeItemIndex = activeItem.index();
					let itemToActive;

					if ($(this).hasClass(sLayout.arrowNext.substr(1))) { // click en next
						itemToActive = (activeItemIndex == (items.length - 1)) ? 0 : activeItemIndex + 1;
					} else { // click en prev
						itemToActive = (activeItemIndex == 0) ? items.length - 1 : activeItemIndex - 1;
					}

					let itemClassActive = sLayout.itemActive.substr(1);
					let itemActivating = items.eq(itemToActive);
					itemActivating.addClass(itemClassActive).siblings().removeClass(itemClassActive);
					_objThis.loadImage(itemActivating);

					// Bullets
					if(!settings.bullets) return false;
					let bulletItemActive = sLayout.bulletActive.substr(1);
					_this.find(sLayout.bullet).eq(itemToActive).addClass(bulletItemActive).siblings().removeClass(bulletItemActive);
				});
			},

			loadImage: function($item){
				let $toLazy = $item.find(sLayout.toLazy);
				if (!$toLazy.length) return false;
				let dataSrc = $toLazy.attr('data-src');
				if(dataSrc !== undefined) {
					let onLoadingItem = settings.onLoadingItem;
					if (onLoadingItem !== undefined) onLoadingItem($toLazy, $toLazy.parents(sLayout.item).index());
					$item.addClass(sLayout.itemLoading.substr(1));
					let onLoadedItem = settings.onLoadedItem;
					function _cleanClass($item){
						$item.addClass(sLayout.itemLoaded.substr(1));
						setTimeout(() => {
							$item.removeClass(sLayout.itemLoading.substr(1));
						}, 500);
					}
					$toLazy.attr('src', dataSrc).one({
						load: () => {
							if (onLoadedItem !== undefined) onLoadedItem($toLazy, $toLazy.parents(sLayout.item).index(), 'success');
							_cleanClass($item);
						},
						error: () => {
							if (onLoadedItem !== undefined) onLoadedItem($toLazy, $toLazy.parents(sLayout.item).index(), 'error');
							_cleanClass($item);
						}
					}).removeAttr('data-src');
				}
			},

			bullets: function(action) {

				let _objThis = this;
				let $wrapperBullets = _this.find(sLayout.wrapperBullets)
				if (!settings.bullets) {
					return $wrapperBullets.addClass(displayNodeClass);
				} else {
					if ($wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.removeClass(displayNodeClass)
				}

				let actions = {

					constructor: () => {
						let bulletTag = $wrapperBullets.find(sLayout.bullet).prop('tagName').toLowerCase();
						let bulletsHtml = '';
						let i = 0;
						while(i < nItems){
							let bulletFirstClass = (i !== 0) ? '' : ' ' + sLayout.bulletActive.substr(1);
							bulletsHtml += '<' + bulletTag + ' class="' + sLayout.bullet.substr(1) + bulletFirstClass + '"></' + bulletTag + '>';
							i++;
						}
						$wrapperBullets.html(bulletsHtml);
					},

					nav: () => {
						if ($wrapperBullets.hasClass(attachedClass)) return false;
						$wrapperBullets.addClass(attachedClass); 
						let bulletItemActiveClass = sLayout.bulletActive.substr(1);
						$wrapperBullets.on('click', sLayout.bullet, function(){

							if($(this).hasClass(bulletItemActiveClass)) return false;
							$(this).addClass(bulletItemActiveClass).siblings().removeClass(bulletItemActiveClass);
							
							let typesSlider = {

								fade: function($this){
									let itemActivating = items.eq($this.index());
									let itemClassActive = sLayout.itemActive.substr(1);
									itemActivating.addClass(itemClassActive).siblings().removeClass(itemClassActive);
									_objThis.loadImage(itemActivating);
								},

								swipe: function(){

								}

							}

							typesSlider[settings.type]($(this));
						});

					},

					init: function() {
						this.constructor();
						this.nav();
					}

				}

				actions[(action == undefined) ? 'init' : action]();	
			},

			breakPoints: function(breakPoints){
				/*
					
					.sort(function(a, b){
					   if (a == b) return 0;
					   return (a < b) ? -1 : 1; 
					})

				*/
				/*
				let _objThis = this;
				let windowWidth = $(window).width();

				let theBreakPoints = Object.keys(breakPoints);

				theBreakPoints.forEach(item => {
					if(Number(item) <= windowWidth) lastMatch = item;
				});

				if(lastMatch) {
					//
					let newOptions = breakPoints[lastMatch];
					$.extend(settings, newOptions);
					let alias = {bullets: 'bullets', nav: 'navs'};
					Object.keys(newOptions).forEach(bp => {
						_objThis[alias['' + bp + '']]();
					});
					//

				}
				*/
			},

			log: obj => {
				if(obj == undefined) {
					return log.forEach(txt => {
						console.log(txt);
					});
				}

				_log(obj.type, obj.text);
			}

		}

		function _log(type, text){
			// Types: error (err), warning (war), notification (not).
			let tipo, pro;
			switch(type) {
				case 'err':
					tipo = 'Error';
					pro = 'error';
					break;
				case 'war':
					tipo = 'Precaución';
					pro = 'warn';
					break;
				case 'not':
					tipo = 'Notificación';
					pro = 'info';
					break;
			}
			let currentdate = new Date(); 
			let datetime = currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds();
			let textComplete = datetime + ' | ' + tipo + ' : ' + text;
			if (settings.log) console[pro]('Great Slider [Logger] : ' + textComplete);
			log.push(textComplete);
		}

		// Inicializando
		actions.init();
		return actions;
	}

})(jQuery);