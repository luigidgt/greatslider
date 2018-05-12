(function($){
	
	$.fn.greatSlider = function(options){

		let _this = this;
		
		if (!_this.length) return _log('err', '* Great Slider [Logger] : No existe el contenedor maestro para hacer el slider.', true);

		let settings = {
			type: 'fade', // fade, swipe
			transitionTime: 1000, // en milisegundos
			nav: true, // true, false
			items: 1,
			slideBy: 1,
			bullets: true, // true, false
			autoplay: false, // true, false
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
		if (options !== undefined) $.extend(settings, options);

		let settingsBk = $.extend({}, settings);
		delete settingsBk['breakPoints'];
		delete settingsBk['layout'];

		let breakPoint = 0;

		// variables globales
		let sLayout = settings.layout,
				items = _this.find(sLayout.item),
				nItems = items.length,
				attachedClass = sLayout.attachedClass.substr(1),
				displayNodeClass = sLayout.noneClass.substr(1),
				log = [],
				configsBk;

		let actions = {

			init: function(configs){
				let _objThis = this;
				configsBk = configs; // relleno para consumirlo globalmente

				// verificaciones de sentido comun
				if (configs.slideBy > configs.items) {
					_log('err', '* Great Slider [Logger] : No es posible determinar que el pase por frame (' + configs.slideBy + ') sea mayor al mostrado de items (' + configs.items +').', true);
					return false;
				}
				//

				// Constructor de los Items
				this.items(configs);

				// Constructor de Bullets y anidación de eventos click
				this.bullets(configs); 

				// Anidando evento click a los Arrows
				this.navs(configs);

				// Solo una vez
				if (_this.hasClass(attachedClass)) return false;
				_this.addClass(attachedClass);
				
				// ejecutando evento nativo de inicialización
				let onInit = settings.onInit;
				if (onInit !== undefined) onInit();
				//

				this.log({
					type: 'not',
					text: 'Slider Inicializandoce.'
				});
				
				let theBreakPoints = configs.breakPoints;
				if(theBreakPoints !== undefined) {
					_objThis.breakPoints(theBreakPoints, window.innerWidth)
					window.greatSliderBP = false;
					// para los breakpoints
					$(window).resize(() => {
						if (greatSliderBP !== false) clearTimeout(greatSliderBP);
						window.greatSliderBP = setTimeout(() => {
							let wWindow = window.innerWidth;
							let onResized = settings.onResized;
							if (onResized !== undefined) onResized(wWindow);
							//
							_objThis.breakPoints(theBreakPoints, wWindow);
						}, 750);
					});
				}

				// Sistema inicializado
				let onInited = settings.onInited;
				if (onInited !== undefined) onInited();

				this.log({
					type: 'not',
					text: 'Slider Inicializado.'
				});
			},

			items: function(configs) {
				let _thisActions = this,
						$wrapperItems = _this.find(sLayout.wrapperItems),
						$theItems = $wrapperItems.find(sLayout.item)
						$firstItem = $theItems.eq(0),
						iActivePure = sLayout.itemActive.substr(1);

				// Los Items
				let sliderType = {

					fade: () => { // desaparecimiento
						if ($wrapperItems.hasClass('gs-transition-fade')) return false;
						$wrapperItems.addClass('gs-transition-fade');
						$firstItem.addClass(iActivePure);
						_thisActions.loadImage($firstItem);
					},

					swipe: () => { // arrastre
						if (!$wrapperItems.hasClass('gs-transition-swipe')) $wrapperItems.addClass('gs-transition-swipe');

						// items
						let initItems = configs.items;
						$wrapperItems.css('width', ((nItems * 100) / initItems) + '%');
						items.css('width', (100 / nItems) + '%');

						let i = 0;
						while (i < initItems) {
							_thisActions.loadImage($theItems.eq(i));
							i++;
						};

						// busca si ya se tiene activo un item
						let $activeItem = $wrapperItems.find(sLayout.itemActive);
						if (!$activeItem.length) { // no lo hay, activo el determinado por configs.items
							$theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
							console.log('entra 1')
						} else { // activo el primero
							let $activeItemIndex = $activeItem.index();
							if ($activeItemIndex < (initItems - 1)) {
								$theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
							} else {
								_thisActions.goTo($activeItem.index() + 1, true);
							}
						}
					}
				}

				let typeRun = sliderType[configs.type];
				(typeRun !== undefined) ? typeRun(configs) : _log('err', 'el tipo de slider determinado no es válido');
			},

			bullets: function(configs) {
				let _objThis = this;

				let $wrapperBullets = _this.find(sLayout.wrapperBullets)
				if (!configs.bullets) {
					if (!$wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.addClass(displayNodeClass);
					return false;	
				} else {
					if ($wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.removeClass(displayNodeClass)
				}

				let classBulletActive = sLayout.bulletActive.substr(1);

				let actions = {

					constructor: () => {
						// calculando de acuerdo a los items a mostrar.
						let $theBullets = $wrapperBullets.find(sLayout.bullet),
								bulletTag = $theBullets.prop('tagName').toLowerCase(),
								bulletsHtml = '',
								maxBullets;

						if(configs.type == 'fade') {
							maxBullets = nItems;
						} else {
							maxBullets = nItems / configs.items;
						}

						if (maxBullets % 1 !== 0) maxBullets = Math.floor(maxBullets) + 1; // si sale decimal, aumento 1
						if ($theBullets.length == maxBullets) return false; // ya tiene los bullets creados, no continuo.

						let i = 0;
						while(i < maxBullets){
							let bulletFirstClass = (i !== 0) ? '' : ' ' + classBulletActive;
							bulletsHtml += '<' + bulletTag + ' class="' + sLayout.bullet.substr(1) + bulletFirstClass + '"></' + bulletTag + '>';
							i++;
						}

						$wrapperBullets.html(bulletsHtml);
	
					},

					nav: () => {
						if ($wrapperBullets.hasClass(attachedClass)) return false; // ya adjuntó el click a los bullets, no continuo.
						$wrapperBullets.addClass(attachedClass); 

						$wrapperBullets.on('click', sLayout.bullet, function(){
							if($(this).hasClass(classBulletActive)) return false;
							$(this).addClass(classBulletActive).siblings().removeClass(classBulletActive);

							if (configs.type == 'swipe') {
								let suma = ($(this).index() + 1) * configsBk.items;
								if (suma > nItems) suma = nItems;
								_objThis.goTo(suma);
							}
						});

					},

					init: function() {
						this.constructor();
						this.nav();
					}

				}

				actions['init']();	
			},

			navs: function() {
				let _objThis = this;

				// verificación
				let $wrapperArrows = _this.find(sLayout.wrapperArrows);
				if (!configsBk.nav) {
					if (!$wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.addClass(displayNodeClass);
				} else {
					if ($wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.removeClass(displayNodeClass);
				}

				if ($wrapperArrows.hasClass(attachedClass)) return false; // ya se adjunto el evento click
				$wrapperArrows.addClass(attachedClass);

				// haciendo click en PREV o NEXT
				_this.find(sLayout.arrow).on('click', function(){
					_objThis.goTo(($(this).hasClass(sLayout.arrowNext.substr(1))) ? 'next' : 'prev', configsBk);
				});
			},

			loadImage: $item => {
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
					let $lazyIndex = $toLazy.parents(sLayout.item).index();
					$toLazy.attr('src', dataSrc).one({
						load: () => {
							if (onLoadedItem !== undefined) onLoadedItem($toLazy, $lazyIndex, 'success');
							_cleanClass($item);
						},
						error: () => {
							if (onLoadedItem !== undefined) onLoadedItem($toLazy, $lazyIndex, 'error');
							_cleanClass($item);
						}
					}).removeAttr('data-src');
				}
			},

			log: obj => {
				if(obj == undefined) {
					return log.forEach(txt => {
						console.log(txt);
					});
				}

				_log(obj.type, obj.text);
			},

			breakPoints: function(breakPoints, widthWindow){
				let _objThis = this;
				let bkOptions = {}, finalBp;
				Object.keys(breakPoints).forEach(medida => {
					if (medida <= widthWindow) {
						$.extend(bkOptions, breakPoints[medida]);
						finalBp = medida;
					}
				});
				let bkOptionsFinales = Object.keys(bkOptions);
				if (bkOptionsFinales.length) {
					if (breakPoint !== finalBp) {
						breakPoint = finalBp;
						bkOptions = $.extend({}, settingsBk, bkOptions);
						_objThis.init(bkOptions);
					}
				} else {
					if(breakPoint !== 0) {
						breakPoint = 0;
						_objThis.init(settingsBk);
					}
				}
			},

			goTo: function(to, configs){
				let activeItem = _this.find(sLayout.wrapperItems + ' ' + sLayout.itemActive), // obteniendo el item activado
						activeItemIndex = activeItem.index(),
						itemToActive;

				if (typeof to == 'string') { // puede ser next o prev, veamos

					if (to == 'next') { // vamos al siguiente item
						if (activeItemIndex == (items.length - 1)) { // yá llegó al último
							itemToActive = configs.items - 1;
						} else {
							// si es que los items restantes son menores a los que se determinó por cada pase
							let leftItems = items.length - (activeItemIndex + 1);
							itemToActive = (leftItems < configs.slideBy) ? activeItemIndex + leftItems : activeItemIndex + configs.slideBy;
						}	
					} else { // es prev
						if(activeItemIndex == (configs.slideBy - 1)) {
							itemToActive = items.length - 1;
						} else {
							let leftItems = (activeItemIndex + 1) - configs.slideBy;
							itemToActive = (leftItems <= configs.slideBy) ? configs.slideBy - 1 : activeItemIndex - configs.slideBy;
						}
					}

				} else if (typeof to == 'number') { // es un index real, (number)
					let relocation = configs,
							toIndexReal = to - 1;
					configs = configsBk;
					// verificaciónes lógicas
					if (to > items.length) return _log('err', 'No es posible ir a puesto de item mayor al numero de items disponibles.', true);
					if (relocation == undefined) { // si no es una relocalización mandada desde la construcción del ancho del wrapper.
						if (to == (activeItemIndex + 1)) return _log('not', 'Ya nos encontramos en ese puesto.', true);
					}
					if (configs.type == 'swipe') {
						if (toIndexReal < activeItemIndex && (to - configs.slideBy) < 0) {
							return _log('err', 'No es posible desplazarce al puesto "' + to + '", debido a que faltarían items a mostrar en pantalla.', true);
						}
					}
					//
					itemToActive = toIndexReal;
				}

				// El item a activar
				let itemActivating = items.eq(itemToActive),
						itemClassActive = sLayout.itemActive.substr(1);
						itemActivating.addClass(itemClassActive).siblings().removeClass(itemClassActive);

				// el tipo de pase
				if (configs.type == 'swipe') {
					let mLeft = ( (100 / configs.items) * (itemToActive + 1) ) - 100;
					if (mLeft < 0) mLeft = 0; // si el numero es negativo, significa que yá llegó al último.
					_this.find(sLayout.wrapperItems).css('margin-left', '-' +  mLeft + '%');
				}

				// OnLlega al último XD
				if(itemToActive == (nItems - 1)) {
					let lastItem = settings.onLastItem;
					if (lastItem !== undefined) lastItem();
				};

				// Cargando la o las imagen correspondientes
				let indexsToLoad = itemToActive;
				while(indexsToLoad > (itemToActive - configs.items)) {
					this.loadImage(items.eq(indexsToLoad));
					indexsToLoad--;
				}

				// Activando el Bullet correspondiente
				/*
				if(!configs.bullets) return false;
				let bulletItemActive = sLayout.bulletActive.substr(1);
				itemToActive = itemToActive - 1;
				if (itemToActive < 0) itemToActive = 0;
				_this.find(sLayout.bullet).eq(itemToActive).addClass(bulletItemActive).siblings().removeClass(bulletItemActive);
				*/
			}

		}

		function _log(type, text, required){
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
			if (settings.log) {
				console[pro]('Great Slider [Logger] : ' + textComplete);
			} else {
				if (required) console[pro]('Great Slider [Logger] : ' + textComplete);
			}
			log.push(textComplete);
		}

		// Inicializando
		actions.init(settings);
		return actions;
	}

})(jQuery);

