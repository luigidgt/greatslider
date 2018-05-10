(function($){
	
	$.fn.greatSlider = function(options){

		let _this = this;
		
		if (!_this.length) return console.error('* Great Slider [Logger] : No existe el contenedor maestro para hacer el slider.');

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
				log = [];

		let actions = {

			init: function(configs){

				// Constructor de los Items
				this.items(configs);

				// Constructor de Bullets y anidación de eventos click
				this.bullets(configs); 

				// Anidando evento click a los Arrows
				this.navs(configs);

				// Setiemos los breakPoints
				if (_this.hasClass(attachedClass)) return false;

				//
				this.log({
					type: 'not',
					text: 'Slider Inicializandoce.'
				});
				// ejecutando evento nativo de inicialización
				let onInit = settings.onInit;
				if (onInit !== undefined) onInit();
				//

				_this.addClass(attachedClass);
				let _objThis = this;
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
						}, 1000);
					});
				}

				// Sistema inicializado
				let onInited = settings.onInited;
				if (onInited !== undefined) onInited();

				this.log({
					type: 'not',
					text: 'Slider Inicializandoce.'
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
						if ($wrapperItems.hasClass('gs-transition-swipe')) return false;
						$wrapperItems.addClass('gs-transition-swipe');

						// items
						let wrapperWidth, itemsWidth,
								initItems = configs.items;
						if (initItems == 1) { // si no se determinó , es de uno
							wrapperWidth = nItems * 100;
							itemsWidth = 100 / nItems;
						} else { // si de determinó, así que será relativo
							wrapperWidth = (nItems * 100) / 2;
							itemsWidth = 100 / nItems;
						}

						$wrapperItems.css('width', wrapperWidth + '%');
						items.css('width', itemsWidth + '%');

						let i = 0;
						while (i < initItems) {
							_thisActions.loadImage($theItems.eq(i));
							i++;
						};

						$theItems.eq(initItems - 1).addClass(iActivePure);
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
						let maxBullets = nItems - (configs.items - 1); // calculando de acuerdo a los items a mostrar.
						let $theBullets = $wrapperBullets.find(sLayout.bullet);
						if ($theBullets.length == maxBullets) return false; // ya tiene los bullets creados, no continuo.
						let bulletTag = $theBullets.prop('tagName').toLowerCase();
						let bulletsHtml = '';
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

							let bulletIndex = $(this).index(),
									$itemActivating = items.eq(bulletIndex),
									itemClassActive = sLayout.itemActive.substr(1);
							
							let typesSlider = {

								fade: function($this){
									$itemActivating.addClass(itemClassActive).siblings().removeClass(itemClassActive);
									
								},

								swipe: function($this) {
									let cItems = configs.items;
									if (cItems == 1) { // si no se determinó , es de uno
										$itemActivating.addClass(itemClassActive).siblings().removeClass(itemClassActive);
										_this.find(sLayout.wrapperItems).css('margin-left', '-' + (bulletIndex * 100) + '%');
										_objThis.loadImage($itemActivating);
									}
								}

							}

							typesSlider[configs.type]($(this));

						});

					},

					init: function() {
						this.constructor();
						this.nav();
					}

				}

				actions['init']();	
			},

			navs: function(configs) {
				let _objThis = this,
				itemClassActive = sLayout.itemActive.substr(1),
				itemConfigs = configs.items;

				// verificación
				let $wrapperArrows = _this.find(sLayout.wrapperArrows);
				if (!configs.nav) {
					if (!$wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.addClass(displayNodeClass);
				} else {
					if ($wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.removeClass(displayNodeClass);
				}

				if ($wrapperArrows.hasClass(attachedClass)) return false; // ya se adjunto el evento click
				$wrapperArrows.addClass(attachedClass);

				// haciendo click en PREV o NEXT
				_this.find(sLayout.arrow).on('click', function() {
					_objThis._goTo(($(this).hasClass(sLayout.arrowNext.substr(1))) ? 'next' : 'prev', configs);
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

			_swipeTo: ()=> {

			},

			_goTo: function(to, configs){
				let activeItem = _this.find(sLayout.wrapperItems + ' ' + sLayout.itemActive), // obteniendo el item activado
						activeItemIndex = activeItem.index(),
						itemToActive;

				if (typeof to == 'string') { // puede ser next o prev, veamos

					if (to == 'next') { // vamos al siguiente item

						if (configs.slideBy == 1) {
							itemToActive = (activeItemIndex == (items.length - 1)) ? configs.items - 1 : activeItemIndex + 1
						}
					} else { // es prev

						if (configs.slideBy == 1) {
							itemToActive = (activeItemIndex == (configs.items - 1)) ? items.length - 1 : activeItemIndex - 1;
						}

					}

					// el tipo de pase
					let typesSlide = {

						swipe: () => {
							let mLeft = ((100 / configs.items) * (itemToActive + 1)) - 100;
							if (mLeft < 0) mLeft = 0; // si el numero es negativo, significa que yá llegó al último.
							_this.find(sLayout.wrapperItems).css('margin-left', '-' +  mLeft + '%');
						},

						fade: () => {

						},

						default: () => {
							return console.log('No existe ese tipo de Slider');
						}

					}

					typesSlide[configs.type]();

					// El item a activar
					let itemActivating = items.eq(itemToActive),
							itemClassActive = sLayout.itemActive.substr(1);
							itemActivating.addClass(itemClassActive).siblings().removeClass(itemClassActive);

					// Cargando la imagen
					this.loadImage(itemActivating);

					// Activando el Bullet correspondiente
					if(!configs.bullets) return false;
					let bulletItemActive = sLayout.bulletActive.substr(1);
					itemToActive = itemToActive - 1;
					if (itemToActive < 0) itemToActive = 0;
					_this.find(sLayout.bullet).eq(itemToActive).addClass(bulletItemActive).siblings().removeClass(bulletItemActive);

					

				} else if(typeof to == 'number') { // es un index, (number)
					// go to
				}

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
		actions.init(settings);
		return actions;
	}

})(jQuery);