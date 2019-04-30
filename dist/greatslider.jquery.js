// Full Screen API
(function() {
	let fullScreenApi = {
			supportsFullScreen: false,
			isFullScreen: function() { return false; },
			requestFullScreen: function() {},
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
 
	// check for native support
	if (typeof document.cancelFullScreen !== 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {
		// check for fullscreen support by vendor prefix
		let il = browserPrefixes.length;
		for (var i = 0; i < il; i++ ) {
			let thePrefix = browserPrefixes[i];
			if (typeof document[thePrefix + 'CancelFullScreen' ] !== 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;
				fullScreenApi.prefix = thePrefix;
				break;
			}
		}
	}
 
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
 
		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}

		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		}

		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		}
	}
 
	// export api
	window.fullScreenApi = fullScreenApi;
})();

// Great Slider Plugin
(function($){

	// funciones útiles
	let checkVideoTimes = 0;
	let _tools = {
		makeid: ()=> {
			let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", text = "";
			for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
			return text.toLowerCase();
		},
		cleanClass: ($item, sLayout) => {
			$item.addClass(sLayout.itemLoadedClass);
			setTimeout(() => {
				$item.removeClass(sLayout.itemLoadingClass);
			}, 500);
		},
		checkVideoLoaded: function($item, $video, settings) {
			let onLoadedItem = settings.onLoadedItem;
			checkVideoTimes += 0.25;
			if(checkVideoTimes >= 20) {
				if (onLoadedItem !== undefined) onLoadedItem($video, $item.index(), 'error');
				this.cleanClass($item, settings.layout);
				return false;
			}
			let theVideo = $video.get(0);
			if (theVideo.readyState == 4) {
				theVideo.play();
				this.cleanClass($item, settings.layout);
				checkVideoTimes = 0;
				if (onLoadedItem !== undefined) onLoadedItem($video, $item.index(), 'success');
			} else {
				setTimeout(()=> {
					this.checkVideoLoaded($item, $video, settings);
				}, 250);
			}
		}
	}

	// seteando info para comprobaciones posteriores
	window.gs = {
		info: {
			name: 'Great Slider',
			version: 'Alfa 1.3.0.1',
		},
		slider: {}
	}

	//Returns constructor
	function Returns(theActions){

		this.getItems = theActions.getItems;
		this.getActive = theActions.getActive;

		this.bullets = theActions.bullets;
		this.navs = theActions.navs;

		this.items = theActions.items;
		this.goTo = theActions.goTo;
		this.loadLazy = theActions.loadLazy;
		this.preLoad = theActions.preLoad;
		this.drag = theActions.drag;

		this.autoPlay = theActions.autoPlay;

		this.fullscreen = theActions.fullscreen;

		this.destroy = theActions.destroy;
		this.touch = theActions.touch;

		this.log = theActions.log;
	}

	// el plugin
	$.fn.greatSlider = function(options){

		let selections = this.length,
				returns = [],
				optionsBk = options,
				sliderInFs;

		this.each(function(){ // para el tratado de multiples slider con la misma clase
			let _this = $(this);
			if (!selections) return console.error('* Great Slider [Logger] : No existe el contenedor maestro para hacer el slider.');

			let settings = {
				type: 'fade', // fade, swipe

				nav: true, 
				navSpeed: 500, // en milisegundos

				touch: true,
				touchClass: 'gs-touch',

				drag: true,
				dragClass: 'gs-drag',
				dragIn: 4,
				dragHand: true,
				dragHandClass: 'gs-drag--hand',

				items: 1,
				itemsInFs: 1,
				slideBy: 1,

				bullets: false, 

				autoplay: false, 
				autoplaySpeed: 5000, // en milisegundos
				autoplayClass: 'gs-autoplay',

				log: false,

				dataParam : 'data-gs',
				
				//startPosition: 0, parametro fantasma, solo si es solicitado
				fullscreen: false,

				lazyLoad: false,
				lazyClass: 'gs-lazy',
				lazyAttr: 'data-lazy',
				lazyAttrFs : 'data-lazyfs',
				lazyLoadOnDestroy: true,

				preLoad: false,
				//preLoadBy: 1, parametro tácito, tomando de el numero de items a mostrar	

				autoHeight: false,
				autoDestroy: false,

				layout: {

					containerItemsTag: 'div',
					containerItemsClass: 'gs-container-items',
					wrapperItemsTag: 'ul',
					wrapperItemsClass: 'gs-wrapper-items',
					wrapperMouseEnterClass: 'gs-mouse-enter',
					wrapperMouseDownClass: 'gs-mouse-down',
					transitionClass: 'gs-in-transition',
					transitionMode: 'ease',

					itemTag: 'li',
					itemClass: 'gs-item-slider',
					itemWrapperTag: 'div',
					itemWrapperClass: 'gs-wrapper-content',
					itemActiveClass: 'gs-item-active',
					itemLoadingClass: 'gs-item-loading',
					itemLoadedClass: 'gs-item-loaded',

					containerNavsTag: 'div',
					containerNavsClass: 'gs-container-navs',

					wrapperArrowsClass: 'gs-wrapper-arrows',
					wrapperArrowsTag: 'div',
					arrowsTag: 'button',
					arrowPrevClass: 'gs-prev-arrow',
					arrowPrevContent: '',
					arrowNextClass: 'gs-next-arrow',
					arrowNextContent: '',
					arrowDefaultStyles: true,

					wrapperBulletsTag: 'div',
					wrapperBulletsClass: 'gs-wrapper-bullets',
					bulletTag: 'button',
					bulletClass: 'gs-bullet',
					bulletActiveClass: 'gs-bullet-active',
					bulletDefaultStyles: true,

					fsButtonTag: 'button',
					fsButtonClass: 'gs-fs',
					fsButtonDefaultStyles: true,
					fsInClass: 'gs-infs',

					noneClass: 'gs-none',
					attachedClass: 'gs-attached',
					builtClass: 'gs-builded',
					resizeClass: 'gs-resize',
					resizedClass: 'gs-resized'
				}
			};

			// extendiendo los parametros de configuración desde objeto pasado
			if (options !== undefined) $.extend(true, settings, options);

			// extendiendo los parametros de configuración desde parametro data
			let $dataGs = _this.attr(settings.dataParam);
			if($dataGs !== undefined) $.extend(true, settings, JSON.parse($dataGs));

			//if (settings.type == 'fade') delete settings['breakPoints']; // si el slider es fade no debe a ver breakpoints

			let settingsBk = $.extend(true, {}, settings);
			delete settingsBk['breakPoints'];
			delete settingsBk['layout'];

			// variables globales
			let $existingItems = _this.find('> *'),
					breakPoint = 0,
					gsInterval,
					gsBreakPoint,
					gsAutoHeight,
					gsIntervalSet,
					$wrapperItems,
					items,
					nItems,
					currentItems,
					sLayout = settings.layout,
					attachedClass = sLayout.attachedClass,
					displayNodeClass = sLayout.noneClass,
					log = [],
					$idThis,
					configsBk;

			function autoHeight($item){
				if(!actions.fullscreen('check') && configsBk.autoHeight && (configsBk.items == 1)) {
					let $altoContent = $item.find('> .' + sLayout.itemWrapperClass).height();
					$wrapperItems.css('height', $altoContent + 'px');
				}
			}

			// Acciones disponibles
			let actions = {

				init: function(configs){
					
					let _objThis = this;
					configsBk = configs; // relleno para consumirlo globalmente

					// verificamos si se desea destruir (por BreakPoint)
					if (configs.destroy) {
						this.destroy();
						return false;
					}

					// Si aun no se construye el slider
					if (!_this.hasClass(sLayout.builtClass)) {

						// Evento de inicialización
						let onInit = settings.onInit;
						if (onInit !== undefined) onInit();
						this.log({
							type: 'not',
							text: 'Slider Inicializandoce.'
						});

						// Asignandole un ID si no lo tiene
						$idThis = _this.attr('id');
						if($idThis == undefined) {
							$idThis = 'gs-slider-' + _tools.makeid();
							_this.attr('id', $idThis);
						}

						// anidando functión autoHeight en redimencionamiento de ventana si el slider es fade o se definió el autoheight
						if(configs.autoHeight || configs.type =='fade') {
							gsAutoHeight = false;
							$(window).resize(() => {

								if (gsAutoHeight !== false) clearTimeout(gsAutoHeight);
								gsAutoHeight = setTimeout(() => {
									autoHeight(this.getActive().item);
								}, 750);
							});
						}
					}

					// verificaciones de sentido comun
					if (configs.slideBy > configs.items) {
						this.log({
							type: 'err',
							text: 'No es posible determinar que el pase por frame (' + configs.slideBy + ') sea mayor al mostrado de items (' + configs.items +').',
							required: true
						});
						return false;
					}

					// Constructor de los Items
					this.items(configs);

					// Constructor de Bullets y anidación de eventos click
					this.bullets('init', configs);

					// Anidando evento click a los Arrows
					this.navs(configs);

					// Full Screen
					this.fullscreen(configs);

					// Anidando el desplazamiento por touch
					this.touch(configs.touch);

					// Si se determinó un auto pase del slider
					this.autoPlay(configs.autoplay, configs);

					// Solo una vez
					if (_this.hasClass(sLayout.builtClass)) return false;
					_this.addClass(sLayout.builtClass);

					// Break Points
					let theBreakPoints = configs.breakPoints;
					if(theBreakPoints !== undefined) {
						_objThis.breakPoints(theBreakPoints, window.innerWidth)
						gsBreakPoint = false;
						// para los breakpoints
						$(window).resize(() => {

							if (_this.hasClass(sLayout.fsInClass)) return false;
							//para que el reacomodo de los items en resize no sea tan brusco
							if(!_this.hasClass(sLayout.resizeClass)) _this.addClass(sLayout.resizeClass);

							if (gsBreakPoint !== false) clearTimeout(gsBreakPoint);
							gsBreakPoint = setTimeout(() => {
								let wWindow = window.innerWidth;

								//para que el reacomodo de los items en resize no sea tan brusco
								if(!_this.hasClass(sLayout.resizedClass)) {
									setTimeout(()=>{
										 _this.addClass(sLayout.resizedClass);
									}, 500);
								}

								setTimeout(()=>{
									_this.removeClass(sLayout.resizeClass).removeClass(sLayout.resizedClass);
								}, 1000);
								//

								_objThis.breakPoints(theBreakPoints, wWindow);

								// event onResized
								let onResized = settings.onResized;
								if (onResized !== undefined) onResized(wWindow, this.getItems(), this.getActive());
							}, 750);
						});
					}

					// Sistema inicializado
					let onInited = settings.onInited;
					setTimeout(()=>{
						if (onInited !== undefined) onInited(this.getItems(), this.getActive());
					}, 500);

					this.log({
						type: 'not',
						text: 'Slider Inicializado.'
					});

					// Comenzar en un item en específico
					let startPosition = configs.startPosition;
					if (startPosition !== undefined) {
						if (startPosition > nItems) {
							return this.log({
								type: 'err',
								text: 'No es posible iniciar en el item con posición "' + startPosition + '" ya que esa posición sobrepasa el numero total de items existentes.',
								required: true
							});
						}
						this.goTo(startPosition, true);
					}

				},

				items: function(configs, itemToGo2) {

					// si se llama como método indicando un cambio de items a mostrar.
					if (typeof configs == 'number') {
						let itemsToShow = configs;
						configs = configsBk;
						configs.items = itemsToShow
						configs.slideBy = 1;
						this.bullets('refresh');
					}
					//

					// Construcción del slider
					if (!_this.hasClass(sLayout.builtClass)) {

						if(!$existingItems.length) return this.log({type: 'err', text: 'No existen items para crear el slider.', required: true});

						let lis = '';
						$existingItems.each(function(i, e){
							lis += '<' + sLayout.itemTag + ' class="' + sLayout.itemClass + '"><' + sLayout.itemWrapperTag + ' class="' + sLayout.itemWrapperClass + '">' + $(this).get(0).outerHTML + '</' + sLayout.itemWrapperTag + '></' + sLayout.itemTag + '>';
						});

						_this.html('<' + sLayout.containerItemsTag + ' class="' + sLayout.containerItemsClass + '"><' + sLayout.wrapperItemsTag + ' class="' + sLayout.wrapperItemsClass + '">' + lis + '</' + sLayout.wrapperItemsTag + '></' + sLayout.containerItemsTag + '>');

						$wrapperItems = _this.find(`> .${sLayout.containerItemsClass} > .${sLayout.wrapperItemsClass}`);
						items = $wrapperItems.find('> .' + sLayout.itemClass);
						nItems = items.length;
					}

					let $theItems = $wrapperItems.find('> .' + sLayout.itemClass),
							$firstItem = $theItems.eq(0),
							iActivePure = sLayout.itemActiveClass;

					// Los Items
					let gsStyles = '',
							transPrefix = ['-webkit-transition', '-o-transition', 'transition'],
							sliderType = {

						fade: () => { // desaparecimiento
							if ($wrapperItems.hasClass('gs-transition-fade')) return false;

							$wrapperItems.addClass('gs-transition-fade');
							$firstItem.addClass(iActivePure);

							let itemsStyle = '',
									wrapperStyle = '';
							transPrefix.forEach(thePrefix => {
								itemsStyle += thePrefix + ': opacity ' + (configs.navSpeed / 1000) + 's ' + sLayout.transitionMode + ' 0s;';
								wrapperStyle += thePrefix + ': height .3s ' + sLayout.transitionMode + ' 0s;';
							});
							gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + '{' + wrapperStyle + '}';
							gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + ' > .' + sLayout.itemClass + '{' + itemsStyle + '};';

							// para evitar la carga iniciar por determinación de starPosition
							if (configs.startPosition == undefined) {

								// si el lazy está activado
								if (configs.lazyLoad) {
									this.loadLazy($firstItem);

									// para pre cargar elementos lazy
									if (configs.preLoad) {
										let nToPreload = (configs.preLoadBy == undefined) ? configs.slideBy : configs.preLoadBy;
										let preLoadLoaded = 0;
										while(preLoadLoaded <= nToPreload) {
											this.loadLazy($theItems.eq(preLoadLoaded));
											preLoadLoaded++;
										}
									}
								}
							}

							// si no se declaro en las 'opciones' un autoHeight de le asigna automáticamente por la naturaleza del slider
							if(optionsBk.autoHeight == undefined) {
								configs.autoHeight = true;
								setTimeout(()=>{
									autoHeight(this.getActive().item);
								}, 500);
							}
						},

						swipe: () => { // arrastre
							if (!$wrapperItems.hasClass('gs-transition-swipe')) $wrapperItems.addClass('gs-transition-swipe');

							// items
							let initItems = configs.items,
									transStyle = 'width: ' + ((nItems * 100) / initItems) + '%;';
							currentItems = initItems; // para consumir globalmente.
							transPrefix.forEach(thePrefix => {
								transStyle += thePrefix + ': margin-left ' + (configs.navSpeed / 1000) + 's ' + sLayout.transitionMode + ' 0s, height .3s linear 0s;'
							});
							gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + ' {' + transStyle + '}';
							gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + ' > .' + sLayout.itemClass + ' {width: ' + (100 / nItems) + '%}';

							// para evitar la carga iniciar por determinación de starPosition
							if (configs.startPosition == undefined) {

								// cargando los elementos 'lazy'
								if (configs.lazyLoad) {
									let i = 0;
									while (i < initItems) {
										this.loadLazy($theItems.eq(i));
										i++;
									};
								}

								// para pre cargar elementos lazy
								if (configs.preLoad) {
									let nToPreload = (configs.preLoadBy == undefined) ? configs.slideBy : configs.preLoadBy;
									let preLoadLoaded = 0;
									while(preLoadLoaded <= nToPreload) {
										this.loadLazy($theItems.eq(preLoadLoaded));
										preLoadLoaded++;
									}
								}
							}

							// Eliminando el 'height' dado inline porque posiblemente cuando solo era 1 item por vez tenía 'autoHeight'
							if (configs.items >= 2) {
								let $theUl = _this.find(`> .${sLayout.containerItemsClass} > .${sLayout.wrapperItemsClass}`);
								if ($theUl.attr('style') !== undefined) $theUl.removeAttr('style')
							}

							// busca si ya se tiene activo un item
							let $activeItem = $wrapperItems.find('> .' + sLayout.itemActiveClass);
							if (!$activeItem.length) { // no lo hay, activo el determinado por configs.items
								$theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
							} else { // activo el primero

								let $activeItemIndex = $activeItem.index();
								if ($activeItemIndex < (initItems - 1)) { // si el activo es menor
									$theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
									$wrapperItems.removeAttr('style');

									// para pre cargar elementos lazy
									if (configs.preLoad) {
										let nToPreload = (configs.preLoadBy == undefined) ? configs.slideBy : configs.preLoadBy;
										let preLoadLoaded = 0;
										while(preLoadLoaded <= nToPreload) {
											this.loadLazy($theItems.eq((initItems - 1) + preLoadLoaded));
											preLoadLoaded++;
										}
									}

								} else {
									// para ir a un item específico si se acciona un full screen con un item específico
									if(itemToGo2 == undefined) {
										this.goTo($activeItem.index() + 1, true);
									} else {
										this.goTo(itemToGo2, true);
									}
								}

							}

							// auto height
							if (!configs.lazyLoad) {
								setTimeout(()=>{
									autoHeight(this.getActive().item);
								}, 500);
							}
						}
					}

					let typeRun = sliderType[configs.type];
					if (typeRun !== undefined) {
						typeRun(configs);
						// activando o desactivando la navegación por arrastre
						(settings.drag) ? this.drag(true) : this.drag(false);

						// Verificando su estilaje
						let theIdSlider = 'gs-styles-' + $idThis.replace('gs-slider-', ''),
								$stylesSlider = $('#' + theIdSlider);
						($stylesSlider.length) ? $stylesSlider.html(gsStyles) : $('body').append('<style id="' + theIdSlider + '">' + gsStyles + '</style>');
					} else {
						this.log({type: 'err', text: 'el tipo de slider determinado no es válido', required: true});
					}
				},

				drag: function(status) {

					if (status == undefined) return configsBk.drag;

					let _objThis = this;
					let $containerItems = _this.find('> .' + sLayout.containerItemsClass);
					let theContainer = $containerItems.get(0);
					let dragClasses = settings.dragClass;
					if (settings.dragHand)  dragClasses += ' ' + settings.dragHandClass;
					
					if (!status) {
						if (theContainer.classList.contains(settings.dragClass)) {
							dragClasses.split(' ').forEach(e => {
								theContainer.classList.remove(e);
							});
							$containerItems.off('mouseenter mousedown mousemove mouseup mouseleave')
						}
					} else {
						if (!theContainer.classList.contains(settings.dragClass)) {
							let gsMouseX = null,
								$ciWidth = $containerItems.width() / settings.dragIn,
								marginLeft = null,
								itemActiveIndex = null,
								mouseDown = false;

							$containerItems.on({

								mouseenter: function(e){
									$(this).addClass(sLayout.wrapperMouseEnterClass);
								},

								mousedown: function(e) {
									mouseDown = true;
									$(this).get(0).classList.add(sLayout.wrapperMouseDownClass);
									gsMouseX = e.clientX;
									marginLeft = Number($containerItems.find('> .' + sLayout.wrapperItemsClass).css('margin-left').replace('px', '')); // CONTINUAR TRABAJANDO EN ESTO.
									itemActiveIndex = _objThis.getActive().index;
								},

								mousemove: function(e){
									let _theElement = $(this);

									if(mouseDown) {
										let draging = e.pageX - gsMouseX;

										if (e.pageX > gsMouseX) { // se arrastra a la derecha para ir al item ANTERIOR
											let toDrag = marginLeft + draging;

											if (draging >= $ciWidth) {
												$(this).get(0).classList.remove(sLayout.wrapperMouseDownClass);
												(itemActiveIndex !== 1) ? _objThis.goTo('prev') : _objThis.goTo(_objThis.getActive().index, true);
												mouseDown = false;
												marginLeft = null;
											} else {
												if (settings.type == 'swipe') {
													$containerItems.find('> .' + sLayout.wrapperItemsClass).css('margin-left', toDrag + 'px');
												}
											}

										} else { // se arrastra a la izquierda para ir al SIGUIENTE item
											let toDrag = marginLeft + draging;
											if (draging <= Number('-' + $ciWidth)) {
												$(this).get(0).classList.remove(sLayout.wrapperMouseDownClass);
												(itemActiveIndex !== nItems) ? _objThis.goTo('next') : _objThis.goTo(_objThis.getActive().index, true);
												mouseDown = false;
												marginLeft = null;
											} else {
												if (settings.type == 'swipe') {
													$containerItems.find('> .' + sLayout.wrapperItemsClass).css('margin-left', toDrag + 'px');
												}
											}
										}
									}
								},

								mouseup: function(e){
									$(this).removeClass(sLayout.wrapperMouseDownClass);
									gsMouseX = null,
									itemActiveIndex = null,
									mouseDown = false;
									
									if (marginLeft !== null) {
										_objThis.goTo(_objThis.getActive().index, true);
									}
								},

								mouseleave: function(e){
									$(this).removeClass(sLayout.wrapperMouseEnterClass);
									if($(this).hasClass(sLayout.wrapperMouseDownClass)) $(this).removeClass(sLayout.wrapperMouseDownClass);
									if (marginLeft !== null) _objThis.goTo(_objThis.getActive().index, true)
									marginLeft = null;
									gsMouseX = null;
									itemActiveIndex = null,
									mouseDown = false;
								}

							}).addClass(dragClasses);
						}
					}
				},

				getItems: ()=> currentItems,

				bullets: function(action, configs) { // this.bullets('active', configs);

					// si la invocación del método es por una acción.
					if (configs == undefined) configs = configsBk;
					if (typeof action == 'boolean') {
						configs.bullets = action;
						action = 'init';
					}
					//

					let _objThis = this,
							maxBullets,
							$wrapperBullets = _this.find(`> .${sLayout.containerNavsClass} > .${sLayout.wrapperBulletsClass}`);

					let classBulletActive = sLayout.bulletActiveClass;
					let actions = {

						constructor: function(){
							if (configs.bullets) {

								// Verificando si realmente debo crear bullets
								maxBullets = (configs.type == 'fade') ? nItems : nItems / configs.items;
								if (maxBullets % 1 !== 0) maxBullets = Math.floor(maxBullets) + 1; // si sale decimal, aumento 1

								// si solo se mostrará 1 bullet, lo escondo, xq no tiene sentido mostrarlo.
								if (maxBullets == 1) {
									if (!$wrapperBullets.hasClass(displayNodeClass)) {
										$wrapperBullets.addClass(displayNodeClass);									
									}
									_objThis.log({type: 'not', text: 'No es necesario mostrar y/o crear los bullets.'});
									return false;
								}

								// creando el container navs
								if(!_this.find('> .' + sLayout.containerNavsClass).length) { // no existen su wrapper nav,  hay que crearlo
									_this.append('<' + sLayout.containerNavsTag + ' class="' + sLayout.containerNavsClass + '"></' + sLayout.containerNavsTag + '>');
								}
								// creando el wrapper de bullets
								if(!$wrapperBullets.length) {
									_this.find('> .' + sLayout.containerNavsClass).append('<' + sLayout.wrapperBulletsTag + ' class="' + sLayout.wrapperBulletsClass + ((sLayout.bulletDefaultStyles) ? ' gs-style-bullets' : '') + '"></' + sLayout.wrapperBulletsTag + '>');
									$wrapperBullets = _this.find(`> .${sLayout.containerNavsClass} > .${sLayout.wrapperBulletsClass}`);
								} else { // si yá existe, verifico que no esté oculto
									if ($wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.removeClass(displayNodeClass);
								}

								// calculando de acuerdo a los items a mostrar.
								let $theBullets = $wrapperBullets.find('> .' + sLayout.bulletClass),
										bulletsHtml = '';

								// activando el item correspondiente si los bullets existentes son iguales a los que crearemos
								if ($theBullets.length == maxBullets) {
									this.active();
									return false;
								}

								// Creo los bullets que faltan
								let i = 0,
										itemToActive = this.active(true),
										bulletTag = sLayout.bulletTag;
								while(i < maxBullets){
									let bulletClassActive = (i !== itemToActive) ? '' : ' ' + classBulletActive;
									bulletsHtml += '<' + bulletTag + ' class="' + sLayout.bulletClass + bulletClassActive + '"></' + bulletTag + '>';
									i++;
								}
								$wrapperBullets.html(bulletsHtml);

							} else { // se determinó false
								$wrapperBullets = _this.find(`> .${sLayout.containerNavsClass} > .${sLayout.wrapperBulletsClass}`);
								if($wrapperBullets.length) { // verifico si existe
									if (!$wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.addClass(displayNodeClass);
									return false;	
								}
							}
						},

						active: getIndex => {
							let itemActive = $wrapperItems.find('> .' + sLayout.itemActiveClass).index();
							let bulletToActive = (itemActive + 1) / configs.items;
							if (bulletToActive % 1 !== 0) bulletToActive = Math.floor(bulletToActive) + 1;
							bulletToActive -= 1;

							if (getIndex) return bulletToActive; // si es que se solicita
							let $bulletActiving = _this.find('> .' + sLayout.containerNavsClass + ' .' + sLayout.bulletClass).eq(bulletToActive);
							if (!$bulletActiving.hasClass(classBulletActive)) $bulletActiving.addClass(classBulletActive).siblings().removeClass(classBulletActive);
						},

						nav: () => {
							if ($wrapperBullets.hasClass(attachedClass)) return false; // ya adjuntó el click a los bullets, no continuo.
							$wrapperBullets.addClass(attachedClass); 

							$wrapperBullets.on('click', '.' + sLayout.bulletClass, function(){
								if($(this).hasClass(classBulletActive)) return false;
								$(this).addClass(classBulletActive).siblings().removeClass(classBulletActive);

								let suma = ($(this).index() + 1) * configsBk.items;
								if (suma > nItems) suma = nItems;
								_objThis.goTo(suma);
							});
						},

						init: function() {
							this.constructor();
							this.nav();
						}
					}

					let theAction = (action == undefined || action == 'refresh') ? 'init' : action;
					actions[theAction]();	
				},

				navs: function(configs) {
					let _objThis = this;

					// si el metodo se invoca desde una acción
					if (typeof configs == 'boolean') {
						let navStatus = configs;
						configs = configsBk;
						configs.nav = navStatus;
					}
					//

					// verificación
					let $wrapperArrows = _this.find('> .' + sLayout.containerNavsClass +' .' + sLayout.wrapperArrowsClass);
					if (!configs.nav) {
						if($wrapperArrows.length) {
							if (!$wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.addClass(displayNodeClass);
						}
					} else {
						if(!$wrapperArrows.length) { // hay q crearlas
							_objThis.log({type: 'not', text: 'NO existe el NAV, se creará.'});
							let elementContainerNavs = '> .' + sLayout.containerNavsClass,
									$containerNavs = _this.find(elementContainerNavs),
									defaultStylesArrow = (sLayout.arrowDefaultStyles) ? ' gs-style-arrow' : '',
									arrowsHtml = '<' + sLayout.wrapperArrowsTag + ' class="' +  sLayout.wrapperArrowsClass + defaultStylesArrow + '">';
									arrowsHtml += '<' + sLayout.arrowsTag + ' class="' + sLayout.arrowPrevClass + '">' + sLayout.arrowPrevContent + '</' + sLayout.arrowsTag + '>';
									arrowsHtml += '<' + sLayout.arrowsTag + ' class="' + sLayout.arrowNextClass + '">' + sLayout.arrowNextContent + '</' + sLayout.arrowsTag + '>';
									arrowsHtml += '</' + sLayout.wrapperArrowsTag + '>';
							if($containerNavs.length) {
								_objThis.log({type: 'not', text: 'Ya existe el NAV, se crearán las flechas.'});
								_this.find(elementContainerNavs).append(arrowsHtml)
							} else {
								_objThis.log({type: 'not', text: 'NO existe el NAV, creará el contenedor y las flechas.'});
								_this.append('<' + sLayout.containerNavsTag + ' class="' + sLayout.containerNavsClass + '">' + arrowsHtml + '</' + sLayout.containerNavsTag + '>');
							}
							$wrapperArrows = _this.find('.' + sLayout.wrapperArrowsClass); // selección rectificada por creación
						} else {
							_objThis.log({type: 'not', text: 'Ya existe el NAV, no se creará.'});
							if ($wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.removeClass(displayNodeClass);
						}
					}

					if ($wrapperArrows.hasClass(attachedClass)) return false; // ya se adjunto el evento click
					$wrapperArrows.addClass(attachedClass);

					_objThis.log({type: 'not', text: 'Adjuntando eventos click a las flechas del NAV.'});
					// haciendo click PREV
					$wrapperArrows.find('.' + sLayout.arrowPrevClass).on('click', function(){
						_objThis.goTo('prev');
					});

					// haciendo click NEXT
					$wrapperArrows.find('.' + sLayout.arrowNextClass).on('click', function(){
						_objThis.goTo('next');
					});
				},

				loadLazy: function($item, type) {
					let _objThis = this,
							$lazyElements;

					if ($item.hasClass(settings.lazyClass)) {
						$lazyElements = $item;
					} else {
						$lazyElements = $item.find('.' + settings.lazyClass);
						if (!$lazyElements.length) {
							// dando alto relativo al contenido si no exites lazys , y si no se está en fullscreen
							autoHeight($item);
							return false;
						}
					}

					let $itemIndex = $item.index(),
							onLoadingItem = settings.onLoadingItem,
							onLoadedItem = settings.onLoadedItem,
							itemClassLoaded = sLayout.itemLoadedClass;

					$lazyElements.each(function(){
						let _element = $(this),
								dataLazy = _element.attr(settings.lazyAttr);

						let lazyTypes = {

							img: ()=> {

								// si se está en full screen, cargo la imagen en HD
								if(actions.fullscreen('check')) {
									let dataLazyFs = _element.attr(settings.lazyAttrFs);
									if(dataLazyFs !== undefined) dataLazy = dataLazyFs;
								}

								if(dataLazy !== undefined) {

									$item.addClass(sLayout.itemLoadingClass);
									if (onLoadingItem !== undefined) onLoadingItem(_element, $itemIndex);

									let theSrcLoaded = _element.attr('src');
									if (theSrcLoaded == dataLazy) { // si ya se cargó la imagen..
										_tools.cleanClass($item, sLayout);
										autoHeight($item); //.. solo adapto el alto.
										return false;
									}

									_element.attr('src', dataLazy).one({
										load: () => {
											if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'success');
											_tools.cleanClass($item, sLayout);
											autoHeight($item);
											_objThis.log({type: 'not', text: 'recurso lazy "' + dataLazy + '" cargado correctamente desde el item con posición ' + ($itemIndex + 1) + '.'});
										},
										error: () => {
											if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'error');
											_tools.cleanClass($item, sLayout);
											_objThis.log({type: 'err', text: 'No fué posible cargar el recurso lazy "' + dataLazy + '" del item con posición ' + ($itemIndex + 1) + '.'});
										}
									});
								}
							},

							video: ()=> {
								if (!$item.hasClass(itemClassLoaded)) {
									$item.addClass(sLayout.itemLoadingClass);
									if (onLoadingItem !== undefined) onLoadingItem(_element, $itemIndex);

									if(dataLazy !== undefined) {
										_element.attr('src', dataLazy);
									} else {
										_element.find('source').each(function(){
											$(this).attr('src', $(this).attr(settings.lazyAttr));
										});
									}
									_element.get(0).load();
									_tools.checkVideoLoaded($item, _element, settings);
								} else {
									_element.get(0).play();
								}
							},

							iframe: ()=> {
								if (!$item.hasClass(itemClassLoaded)) {

									if (dataLazy.indexOf('youtu') !== -1) { // es un video de youtube

										let parameters, idYt;
										// si el url es https://www.youtube.com/watch?v=4RUGmBxe65U
										if (dataLazy.indexOf('watch') !== -1) {
											idYt = dataLazy.substr(dataLazy.indexOf('=') + 1, 11);
											parameters = dataLazy.substr(dataLazy.indexOf('=') + 12);
										}

										// si el url es https://youtu.be/4RUGmBxe65U
										if (dataLazy.indexOf('youtu.be') !== -1) {
											idYt = dataLazy.substr(dataLazy.lastIndexOf('/') + 1, 11);
											parameters = dataLazy.substr(dataLazy.lastIndexOf('/') + 12);
											parameters = parameters.substr(1);
										}

										// si el url es https://www.youtube.com/embed/4RUGmBxe65U
										if (dataLazy.indexOf('embed') !== -1) {
											idYt = dataLazy.substr(dataLazy.lastIndexOf('/') + 1, 11);
											parameters = dataLazy.substr(dataLazy.lastIndexOf('/') + 12);
											parameters = parameters.substr(1);
										}

										// limpiando del primer caracter
										let firstCaracter = parameters.substring(0, 1);
										if (firstCaracter == '&') parameters = parameters.substr(1);

										// cambio de parametro tiempo de inicio
										if(parameters.indexOf('rt=') == -1 && parameters.indexOf('t=') !== -1) {
											parameters = parameters.replace('t=', 'start=');
											if (parameters.indexOf('&') !== -1) {
												let newParameters = [];
												$.each(parameters.split('&'), function(i, k) {
													let splitParameters = k.split('=');
													if (splitParameters[0] == 'start') {
														let theTime = splitParameters[1],
																minutes = theTime.indexOf('m'),
																seconds = theTime.indexOf('s');
														let minutesNumber = 0,
																secondsNumber = 0;
														if (minutes !== -1) {
															minutesNumber = Number(theTime.substring(0, minutes)) * 60; 
															minutes = minutes + 1;
														} else {
															minutes = 0;
														}
														if(seconds !== -1) secondsNumber = Number(theTime.substring(minutes, seconds));
														newParameters.push('start=' + (minutesNumber + secondsNumber));
													} else {
														newParameters.push(k);
													}
												});
												parameters = newParameters.join('&');
											} else {
												parameters = parameters.substring(0, parameters.length - 1);
											}
										}

										// agregandole finalmente el autoplay si es que no lo tiene
										if(parameters.indexOf('autoplay') == -1) parameters += '&autoplay=1';

										// final url
										dataLazy = 'https://www.youtube.com/embed/' + idYt + '?' + parameters + '&enablejsapi=1';

										_element.attr('src', dataLazy).removeAttr(settings.lazyAttr);
										$item.addClass(sLayout.itemLoadedClass);
									
									} else if (dataLazy.indexOf('vimeo') !== -1){

										$item.addClass(sLayout.itemLoadingClass);

										let idVideo = dataLazy.substr(dataLazy.lastIndexOf('/') + 1, 9);
										let parameters = dataLazy.substring(dataLazy.lastIndexOf('/') + 11, dataLazy.length);

										let newParameters = '';
										$.each({title: 0,api: 1,byline: 0,transparent: 0}, function(k, v){
											if(parameters.indexOf(k) == -1) newParameters += '&' + k + '=' + v;
										});
										parameters = (!parameters.length) ? newParameters.substr(1) : parameters += newParameters.substr(1);
										if (parameters.indexOf('autoplay=1') !== -1) parameters = parameters.replace('autoplay=1','');
										if (parameters.indexOf('&&') !== -1) parameters = parameters.replace('&&','');
										dataLazy = 'https://player.vimeo.com/video/' + idVideo + '#' + parameters;
										_element.attr('src', dataLazy).removeAttr(settings.lazyAttr);
										lazyTypes.script('vimeoplayer', 'https://player.vimeo.com/api/player.js', ()=>{
											_tools.cleanClass($item, sLayout);
											let player = new Vimeo.Player(_element);
	        						player.play();
										});
									}
								} else {
									// si el iframe es de YT
									let theSrcIframe = _element.attr('src');
									if(theSrcIframe.indexOf('youtu') !== -1) {
										_element.get(0).contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
									} else if(theSrcIframe.indexOf('vimeo') !== -1) {
										let player = new Vimeo.Player(_element);
										player.play();
									}
								}
							},

							script: function(id, theSrc, done){
								if($('#' + id).length) { // ya se cargó el script
									if (done !== undefined && typeof done == 'function') done();
								}
								let r = false,
										s = document.createElement('script');
										s.type = 'text/javascript';
										s.src = theSrc;
										s.id = id;
										s.onload = s.onreadystatechange = function() {
											if ( !r && (!this.readyState || this.readyState == 'complete') ) {
												r = true;
												if (done !== undefined && typeof done == 'function') done();
											}
										};
								document.body.appendChild(s);
							}
						}

						let typeLazy = lazyTypes[_element.prop('tagName').toLowerCase()];
						if(typeLazy !== undefined) typeLazy();
					});
				},

				preLoad: status => {
					if (status == undefined) {
						return configsBk.preLoad
					} else {
						configsBk.preLoad = status;
					}
				},
				
				log: obj => {
					if(obj == undefined) {
						return log.forEach(txt => {
							console.log(txt);
						});
					}

					// Types: error (err), warning (war), notification (not).
					let tipo, pro;
					switch(obj.type) {
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
					let textComplete = datetime + ' | ' + tipo + ' : ' + obj.text;
					if (settings.log) {
						console[pro]('Great Slider [Logger] : ' + textComplete);
					} else {
						if (obj.required) console[pro]('Great Slider [Logger] : ' + textComplete);
					}
					log.push(textComplete);
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
							// verificamos si yá no es necesario el slider
							if (settings.autoDestroy) {
								let itemsExits = $existingItems.length;
								if(itemsExits <= bkOptions.items) {
									this.log({type: 'not', text: 'El slider se destruye xq ya no es necesario, la cantidad de items (' + itemsExits + ') es la misma que la de items a mostrar (' + bkOptions.items + ').'});
									this.destroy();
									return false;
								}
							}
							//
							_objThis.init(bkOptions);
						}
					} else {
						if(breakPoint !== 0) {
							breakPoint = 0;
							_objThis.init(settingsBk);
						}
					}
				},

				getActive: function(){
					let $activeItem = $wrapperItems.find('> .' + sLayout.itemActiveClass);
					return {
						item: $activeItem,
						index: $activeItem.index() + 1
					};
				},

				goTo: function(to, configs){
					if (_this.hasClass(sLayout.transitionClass)) return false; // para evitar otro pase con uno yá en curso.

					let $getActive = this.getActive(),
							$activeItem = $getActive.item,
							activeItemIndex = $getActive.index - 1,
							itemToActive;

					if (typeof to == 'string') { // puede ser next o prev, veamos

						if (configs == undefined) configs = configsBk;

						if (to == 'next') { // vamos al siguiente item
							if (activeItemIndex == (items.length - 1)) { // yá llegó al último
								itemToActive = configs.items - 1;
							} else {
								// si es que los items restantes son menores a los que se determinó por cada pase
								let leftItems = items.length - (activeItemIndex + 1);
								itemToActive = (leftItems < configs.slideBy) ? activeItemIndex + leftItems : activeItemIndex + configs.slideBy;
							}	
						} else { // es prev
							if(activeItemIndex == (configs.items - 1)) {
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
						if (to > items.length) return this.log({type: 'err', text: 'No es posible ir a puesto de item mayor al numero de items disponibles.', required: true});
						if (relocation == undefined) { // si no es una relocalización mandada desde la construcción del ancho del wrapper.
							if (to == (activeItemIndex + 1)) this.log({type: 'not', text: 'Ya nos encontramos en ese puesto (' + to + ').', required: true});
						}
						if (configs.type == 'swipe') {
							if (toIndexReal < activeItemIndex && (to - configs.slideBy) < 0) {
								return this.log({type: 'err', text: 'No es posible desplazarce al puesto "' + to + '", debido a que faltarían items a mostrar en pantalla.', required: true});
							}
						}
						//
						itemToActive = toIndexReal;
					}

					// Deteniendo reproducción en items que tienen elementos reproducibles (video, audio y iframes de youtube o vimeo)
					let $videos = $activeItem.find('video, audio');
					if ($videos.length) {
						$videos.each(function(){
							$(this).get(0).pause();
						});
					}

					// pausa a los videos de youtube
					let $iframes = $activeItem.find('iframe');
					if($iframes.length) {
						$iframes.each(function(){
							let $iframeSrc = $(this).attr('src');
							if($iframeSrc.indexOf('youtu') !== -1) {
								$(this).get(0).contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
							} else if ($iframeSrc.indexOf('vimeo') !== -1) {
								let player = new Vimeo.Player($(this));
								player.pause();
							}
						});
					};

					// El item a activar
					let $itemActivating = items.eq(itemToActive),
							itemActiveClass = sLayout.itemActiveClass;
					
					$activeItem.removeClass(itemActiveClass);
					$itemActivating.addClass(itemActiveClass);

					_this.addClass(sLayout.transitionClass);
					let onStepStart = configs.onStepStart;
					if(onStepStart !== undefined) onStepStart($activeItem, $activeItem.index() + 1);

					if(configs.type == 'swipe') {
						let mLeft = ( (100 / configs.items) * (itemToActive + 1) ) - 100;
						if (mLeft < 0) mLeft = 0; 
						$wrapperItems.css('margin-left', '-' +  mLeft + '%')
					}

					// Cargando los elements 'lazy'
					if (configs.lazyLoad) {
						let indexsToLoad = itemToActive;
						while(indexsToLoad > (itemToActive - configs.items)) {
							//console.log('indexsToLoad: ', indexsToLoad)
							let $itemToLoaded = items.eq(indexsToLoad);
							//if (!$itemToLoaded.hasClass(sLayout.itemLoadedClass) && !$itemToLoaded.hasClass(sLayout.itemLoadingClass)) this.loadLazy($itemToLoaded);
							this.loadLazy($itemToLoaded);
							indexsToLoad--;
						}
					
						// para precargar elementos
						if (configs.preLoad) {
							let itemsToPreLoad = (configs.preLoadBy == undefined) ? configs.slideBy : configs.preLoadBy;
							let itemLoaded = 1;
							while(itemLoaded <= itemsToPreLoad) {
								if ((itemToActive + itemLoaded) > nItems) break; // para que no cargue items más allá del numero total de items.
								let $itemToLoaded = items.eq(itemToActive + itemLoaded);
								//if (!$itemToLoaded.hasClass(sLayout.itemLoadedClass) && !$itemToLoaded.hasClass(sLayout.itemLoadingClass)) this.loadLazy($itemToLoaded);
								this.loadLazy($itemToLoaded);
								itemLoaded++;
							}
						}
					}

					// ejecutando evento onStepEnd
					setTimeout( () => {
						_this.removeClass(sLayout.transitionClass);
						let onStepEnd = configs.onStepEnd;
						if(onStepEnd !== undefined) onStepEnd($itemActivating, itemToActive + 1);
						if(!this.fullscreen('check')) {
							if (!configs.lazyLoad) autoHeight($itemActivating)
						}
					}, configs.navSpeed);

					// OnLlega al último XD
					if(itemToActive == (nItems - 1)) {
						let lastItem = settings.onLastItem;
						if (lastItem !== undefined) lastItem($itemActivating, itemToActive);
					};

					// Activando el Bullet correspondiente
					if(_this.hasClass(sLayout.builtClass)) {
						if(configs.bullets) this.bullets('active', configs);
					}
				},

				autoPlay: function(action, configs) {

					if (action == undefined) return configsBk.autoplay;
					if (configs == undefined) configs = configsBk;

					if(action == 'play') {
						action = true;
					} else if (action == 'stop'){
						action = false;
					}

					let $containerItems = _this.find('> .' + sLayout.containerItemsClass);
					let theContainer = $containerItems.get(0);

					if(action) {
						theContainer.classList.add(configs.autoplayClass);
						if(gsIntervalSet !== undefined) return false; // por si se seteó el intervalo previamente
						gsIntervalSet = true;

						if (typeof gsInterval == 'undefined' || typeof gsInterval == 'number') {
							gsInterval = setInterval(()=>{
								this.goTo('next');
							}, configs.autoplaySpeed);
						}
						let playAP = configs.onPlay;
						if (playAP !== undefined) playAP();
						return true;

					} else {
						theContainer.classList.remove(configs.autoplayClass);
						if (gsInterval !== undefined) {
							clearInterval(gsInterval);
							let stopAP = configs.onStop;
							if (stopAP !== undefined) stopAP();
							gsIntervalSet = undefined;
							return false;
						}
					}
				},

				fullscreen: function(configs, itemToGo) {

					let _objThis = this,
							$fsElement = _this.find('> .' + sLayout.fsButtonClass),
							lastItems;
						
					// funciones útiles
					let navByArrow = event => {
						if (event.type == 'keyup') {
							switch(event.which){
								case 37:
								case 40:
									this.goTo('prev');
									break;
								case 38:
								case 39:
									this.goTo('next');
									break;
							}
						} /*else if(event.type == 'mousewheel') {
							this.goTo((event.originalEvent.wheelDelta / 120 > 0) ? 'prev' : 'next');
						}*/ // Navegación por flechas
					}

					let envOnFullScreen = event => {
						configs = configsBk;
						if (fullScreenApi.isFullScreen()){ // in
							if (_this.hasClass(sLayout.fsInClass)) {
								$(document).on('keyup', navByArrow);
								this.loadLazy(this.getActive().item);
								// cambiando a 1 items visibles
								let itemsCurrent = this.getItems();
								if(itemsCurrent !== 1) {
									lastItems = itemsCurrent;
									if (itemToGo !== undefined) {
										this.items(configs.itemsInFs, itemToGo);
									} else {
										this.items(configs.itemsInFs);
									}
								}
								// evento de entrada al FS
								let inFs = configs.onFullscreenIn;
								if(inFs !== undefined) inFs();
								//
							}
						} else { // out
							if (_this.hasClass(sLayout.fsInClass)) {
								//volviendo a los items que tenía
								if(lastItems !== undefined) {
									let itemsCurrent = this.getItems();
									if(itemsCurrent !== lastItems) {
										this.items(lastItems);
										lastItems = undefined;
									}
								}
								//
								$(document).off('keyup', navByArrow);
								setTimeout(()=>{ //
									if (configs.lazyLoad && configs.items == 1) {
										let i = 0;
										while (i <= nItems) {
											let theItem = items.eq(i);
											if(theItem.hasClass(sLayout.itemLoadedClass)) this.loadLazy(theItem);
											i++;
										};
									}
									if (!configs.lazyLoad && configs.autoHeight) autoHeight(this.getActive().item);
								}, 700); // para dar tiempo al navegador en la transición desde cuando se canceló el Fs y se completó
								//
								_this.removeClass(sLayout.fsInClass);
								$fsElement.removeClass(sLayout.fsInClass);

								itemToGo = undefined;
								$(document).off(fullScreenApi.fullScreenEventName, envOnFullScreen); // para evitar doble anidación
								// evento de salida de FS
								let outFs = configs.onFullscreenOut;
								if(outFs !== undefined) outFs();
							}
						} // ejecución de eventos
					}

					// es la invocación del metodo desde una acción
					if (typeof configs == 'string') {

						if (fullScreenApi.supportsFullScreen) {
							let actionsFs = {
								in: ()=> {
									if(!_objThis.fullscreen('check')) {
										_this.addClass(sLayout.fsInClass);
										$fsElement.addClass(sLayout.fsInClass);
										fullScreenApi.requestFullScreen(_this.get(0));
										$(document).on(fullScreenApi.fullScreenEventName, envOnFullScreen);
									} else {
										_objThis.log({type: 'not', text: 'Ya nos encontramos en fullscreen.', required: true});
									}
								},
								out: ()=> {
									if(_objThis.fullscreen('check')) {
										$fsElement.removeClass(sLayout.fsInClass);
										fullScreenApi.cancelFullScreen(_this.get(0));
										$(document).off(fullScreenApi.fullScreenEventName, envOnFullScreen);
									} else {
										_objThis.log({type: 'not', text: 'No nos encontramos en fullscreen.', required: true});
									}
								},
								check: ()=> {
									return fullScreenApi.isFullScreen();
								}
							}
							let theFsAction = actionsFs[configs];
							return (theFsAction !== undefined) ? theFsAction() : this.log({type: 'not', text: 'la orden "' + configs + '" del metodo fullscreen no es valida.', required: true});
						} else {
							return this.log({type: 'war', text: 'El dispositivo actual no soporta Full Screen.', required: true});
						}
						return false; // para asegurarnos de no seguir con el flujo normal
					}

					// no es invocación del metodo con orden, es el flujo normal
					if (configs.fullscreen) {
						if (!fullScreenApi.supportsFullScreen) return this.log({type: 'war', text: 'El dispositivo actual no soporta Full Screen.'});
						// construcción del boton
						if(!$fsElement.length) {
							_this.append('<' + sLayout.fsButtonTag + ' class="' + sLayout.fsButtonClass + ((sLayout.fsButtonDefaultStyles) ? ' gs-style-btnfs' : '') + '"></' + sLayout.fsButtonTag + '>');
							$fsElement = _this.find(sLayout.fsButton);
						} else {
							if ($fsElement.hasClass(displayNodeClass)) $fsElement.removeClass(displayNodeClass)
						}	
					} else {
						if (!$fsElement.hasClass(displayNodeClass)) $fsElement.addClass(displayNodeClass);
						return false;
					}

					// Adjuntado evento click al boton FS
					$fsElement = _this.find('> .' + sLayout.fsButtonClass); // volviendolo a declarar por su creación
					if ($fsElement.hasClass(attachedClass)) return false; // ya se adjunto el evento click
					$fsElement.addClass(attachedClass).on('click', e => {
						e.preventDefault();
						this.fullscreen((!this.fullscreen('check')) ? 'in' : 'out');
					});
				},

				destroy: function() {
					let _objThis = this;
					if(!_this.hasClass(sLayout.builtClass)) return false;
					// devolviendo items como hijos directos de su wrapper inicial
					let htmlPure = '';
					_this.find(`> .${sLayout.containerItemsClass} > .${sLayout.wrapperItemsClass} > .${sLayout.itemClass}`).each( function() {
						htmlPure += $(this).find(`> .${sLayout.itemWrapperClass}`).html();
					});
					_this.html(htmlPure).removeClass(sLayout.builtClass);
					if(_this.attr('id').indexOf('gs-slider-') !== -1) _this.removeAttr('id');
					// destruyendo navegación, si existe.
					let $theNav = _this.find('> .' + sLayout.containerNavsClass);
					if($theNav.length) $theNav.remove();

					// cargando elementos lazy, si existen
					if (settings.lazyLoad && settings.lazyLoadOnDestroy) {
						let $itemsToLoad = _this.find('.' + settings.lazyClass);
						if($itemsToLoad.length) {
							$itemsToLoad.each(function(){
								_objThis.loadLazy($(this));
							});
						}
					}

					// eliminando el estilo inline 'height' si se determinó autoHeight
					let $wrapperUl = _this.find(`> .${sLayout.containerItemsClass} > .${sLayout.wrapperItemsClass}`);
					if ($wrapperUl.attr('style') !== undefined) $wrapperUl.removeAttr('style');
					//

					let eventDestroyed = configsBk.onDestroyed;
					if(eventDestroyed !== undefined) eventDestroyed(configsBk);
				},

				touch: function(estado) {
					if (estado == undefined) return configsBk.touch;

					let $theContainerItems = _this.find('> .' + sLayout.containerItemsClass),
							sliderTouchStart, sliderTouchMove;
					if (!estado) {
						if ($theContainerItems.hasClass(settings.touchClass)) {
							$theContainerItems.off('touchstart', sliderTouchStart);
							$theContainerItems.off('touchmove', sliderTouchMove);
							$theContainerItems.removeClass(settings.touchClass);
						}
					} else {
						if ($theContainerItems.hasClass(settings.touchClass)) return false; // xq yá se anidó
						var xDown = null;
						var yDown = null;
						sliderTouchStart = evt => {
							xDown = evt.originalEvent.touches[0].clientX;
							yDown = evt.originalEvent.touches[0].clientY;
						}
						sliderTouchMove = evt => {
							if (xDown || yDown) {
								var xUp = evt.originalEvent.touches[0].clientX;
								var yUp = evt.originalEvent.touches[0].clientY;
								var xDiff = xDown - xUp;
								var yDiff = yDown - yUp;
								if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
									if (xDiff > 0) {
										evt.preventDefault();
										this.goTo('next')
									} else {
										evt.preventDefault();
										this.goTo('prev');
									}
								}
								xDown = null;
								yDown = null;
							}
						}
						//finalmente anidando el touch
						$theContainerItems.on({
							touchstart : sliderTouchStart,
							touchmove: sliderTouchMove
						}).addClass(settings.touchClass);
					}
				}
			}

			// Inicializando
			actions.init(settings);

			// preparando el return
			let theReturn = new Returns(actions);
			if (selections == 1) {
				returns = theReturn;
			} else {
				returns.push(theReturn);
			}

			// api al slider
			window.gs['slider'][$idThis] = returns;

		});
		
		return returns;
	}

}(jQuery));