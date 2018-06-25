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

				items: 1,
				itemsInFs: 1,
				slideBy: 1,

				touch: true, 

				bullets: false, 

				autoplay: false, 
				autoplaySpeed: 5000, // en milisegundos

				log: false, 

				dataParam : 'data-gs',
				
				//startPosition: 0, parametro fantasma, solo si es solicitado
				fullscreen: false,

				lazyLoad: false,
				lazyClass: 'gs-lazy',
				lazyAttr: 'data-lazy',
				lazyAttrFs : 'data-lazyfs',

				preLoad: false,

				autoHeight: false,

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
			let breakPoint = 0,
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

			// Funciones útiles
			let checkVideoTimes = 0;
			function checkVideoLoaded($item, $video){
				let onLoadedItem = settings.onLoadedItem;
				checkVideoTimes += 0.25;
				if(checkVideoTimes >= 20) {
					if (onLoadedItem !== undefined) onLoadedItem($video, $item.index(), 'error');
					_cleanClass($item);
					return false;
				}
				let theVideo = $video.get(0);
				if (theVideo.readyState == 4) {
					theVideo.play();
					_cleanClass($item);
					checkVideoTimes = 0;
					if (onLoadedItem !== undefined) onLoadedItem($video, $item.index(), 'success');
				} else {
					setTimeout(()=> {
						checkVideoLoaded($item, $video);
					}, 250);
				}
			}

			function _cleanClass($item){
				$item.addClass(sLayout.itemLoadedClass);
				setTimeout(() => {
					$item.removeClass(sLayout.itemLoadingClass);
				}, 500);
			}

			function autoHeight($item){
				if(!actions.fullscreen('check') && configsBk.autoHeight && (configsBk.items == 1)) {
					let $altoContent = $item.find('.' + sLayout.itemWrapperClass).height();
					//console.log('alto del slider: ' + $altoContent);

					//setTimeout(()=>{
						let $altoWrapperSlider = $wrapperItems.height();
								$wrapperItems.css('height', $altoContent + 'px')
					//}, 1000);
				}
			}

			function makeid() {
				let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
						text = "";
				for (var i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
				return text.toLowerCase();
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

					// Si se determinó un auto pase del slider
					(configs.autoplay) ? this.autoPlay('play', configs) : this.autoPlay('stop', configs);

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
							$idThis = 'gs-slider-' + makeid();
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
								let onResized = settings.onResized;
								if (onResized !== undefined) onResized(wWindow);

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

				items: function(configs) {
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

						let $existingItems = _this.find('> *');
						if(!$existingItems.length) return this.log({type: 'err', text: 'No existen items para crear el slider :V', required: true});

						let lis = '';
						$existingItems.each(function(i, e){
							lis += '<' + sLayout.itemTag + ' class="' + sLayout.itemClass + '"><' + sLayout.itemWrapperTag + ' class="' + sLayout.itemWrapperClass + '">' + $(this).get(0).outerHTML + '</' + sLayout.itemWrapperTag + '></' + sLayout.itemTag + '>';
						});

						_this.html('<' + sLayout.containerItemsTag + ' class="' + sLayout.containerItemsClass + '"><' + sLayout.wrapperItemsTag + ' class="' + sLayout.wrapperItemsClass + '">' + lis + '</' + sLayout.wrapperItemsTag + '></' + sLayout.containerItemsTag + '>');

						$wrapperItems = _this.find('.' + sLayout.wrapperItemsClass);
						items = _this.find('.' + sLayout.itemClass);
						nItems = items.length;
					}

					let $theItems = $wrapperItems.find('.' + sLayout.itemClass),
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
							gsStyles += '#' + $idThis + ' .' + sLayout.wrapperItemsClass + '{' + wrapperStyle + '}';
							gsStyles += '#' + $idThis + ' .' + sLayout.itemClass + '{' + itemsStyle + '};';

							// si el lazy está activado
							if (configs.lazyLoad) this.loadLazy($firstItem);

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
							gsStyles += '#' + $idThis + ' .' + sLayout.wrapperItemsClass + '{' + transStyle + '}';
							gsStyles += '#' + $idThis + ' .' + sLayout.itemClass + '{width: ' + (100 / nItems) + '%}';

							// cargando los elementos 'lazy'
							if (configs.lazyLoad) {
								let i = 0;
								while (i < initItems) {
									this.loadLazy($theItems.eq(i));
									i++;
								};
							}

							// busca si ya se tiene activo un item
							let $activeItem = $wrapperItems.find('.' + sLayout.itemActiveClass);
							if (!$activeItem.length) { // no lo hay, activo el determinado por configs.items
								$theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
							} else { // activo el primero
								let $activeItemIndex = $activeItem.index();
								if ($activeItemIndex < (initItems - 1)) {
									$theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
								} else {
									this.goTo($activeItem.index() + 1, true);
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

						/*
						// Anidando la navegación por mouse
						let $containerItems = _this.find('.' + sLayout.containerItemsClass);
						if (!$containerItems.hasClass(attachedClass)) {
							let gsMouseX = null;
							$containerItems.on({

								mousedown: function(e) {
									//console.log('mouse down');
									$(this).addClass(sLayout.wrapperMouseDownClass);
									gsMouseX = e.clientX;
								},

								mousemove: function(e){
									//msg += e.pageX + ", " + e.pageY;
									let _theElement = $(this);
									if(_theElement.hasClass(sLayout.wrapperMouseDownClass)) {
										let marginLeft = Number(_this.find('.' + sLayout.wrapperItemsClass).css('margin-left').replace('-', '').replace('px', '').replace('%', '')); // CONTINUAR TRABAJANDO EN ESTO.
										if (e.pageX > gsMouseX) { // vas a la derecha
											//console.clear();
											console.log('derecha', (gsMouseX - e.pageX));
											//_this.find('.' + sLayout.wrapperItemsClass).css('margin-left', marginLeft + (gsMouseX - e.pageX));
											gsMouseX = e.pageX;
										} else { // izquierda
											//console.clear();
											console.log('izquierda', (gsMouseX - e.pageX), marginLeft);
											gsMouseX = e.pageX;
										}
									}
								},

								mouseup: function(e){
									//console.log('mouse up')
									$(this).removeClass(sLayout.wrapperMouseDownClass);
									gsMouseX = null;
								},

								mouseenter: function(e){
									$(this).addClass(sLayout.wrapperMouseEnterClass);
								},

								mouseleave: function(e){
									$(this).removeClass(sLayout.wrapperMouseEnterClass);
									if($(this).hasClass(sLayout.wrapperMouseDownClass)) $(this).removeClass(sLayout.wrapperMouseDownClass);
								}

							}).addClass(attachedClass);
						}
						*/

						// Verificando su estilaje
						let theIdSlider = 'gs-styles-' + $idThis.replace('gs-slider-', ''),
								$stylesSlider = $('#' + theIdSlider);
						($stylesSlider.length) ? $stylesSlider.html(gsStyles) : $('body').append('<style id="' + theIdSlider + '">' + gsStyles + '</style>');

					} else {
						this.log({type: 'err', text: 'el tipo de slider determinado no es válido', required: true});
					}
				},

				getItems: ()=>{
					return currentItems;
				},

				bullets: function(action, configs) {
					// si la invocación del método es por una acción.
					if (configs == undefined) configs = configsBk;
					if (typeof action == 'boolean') {
						configs.bullets = action;
						action = 'init';
					}
					//

					let _objThis = this;
					let $wrapperBullets = _this.find('.' + sLayout.wrapperBulletsClass);

					if (configs.bullets) {
						// creando el container navs
						if(!_this.find('.' + sLayout.containerNavsClass).length) { // no existen su wrapper nav,  hay que crearlo
							_this.append('<' + sLayout.containerNavsTag + ' class="' + sLayout.containerNavsClass + '"></' + sLayout.containerNavsTag + '>');
						}
						// creando el wrapper de bullets
						if(!$wrapperBullets.length) {
							_this.find('.' + sLayout.containerNavsClass).append('<' + sLayout.wrapperBulletsTag + ' class="' + sLayout.wrapperBulletsClass + ((sLayout.bulletDefaultStyles) ? ' gs-style-bullets' : '') + '"></' + sLayout.wrapperBulletsTag + '>');
							$wrapperBullets = _this.find('.' + sLayout.wrapperBulletsClass);
						} else { // si yá existe, verifico que no esté oculto
							if ($wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.removeClass(displayNodeClass);
						}
					} else { // se determinó false
						$wrapperBullets = _this.find('.' + sLayout.wrapperBulletsClass);
						if($wrapperBullets.length) { // verifico si existe
							if (!$wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.addClass(displayNodeClass);
							return false;	
						} 
					}

					let classBulletActive = sLayout.bulletActiveClass;
					let actions = {

						constructor: function(){
							// calculando de acuerdo a los items a mostrar.
							let $theBullets = $wrapperBullets.find('.' + sLayout.bulletClass),
									bulletsHtml = '';

							let maxBullets = (configs.type == 'fade') ? nItems : nItems / configs.items;
							if (maxBullets % 1 !== 0) maxBullets = Math.floor(maxBullets) + 1; // si sale decimal, aumento 1

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
						},

						active: getIndex => {
							let itemActive = $wrapperItems.find('.' + sLayout.itemActiveClass).index();

							let bulletToActive = (itemActive + 1) / configs.items;
							if (bulletToActive % 1 !== 0) bulletToActive = Math.floor(bulletToActive) + 1;
							bulletToActive -= 1;

							if (getIndex) return bulletToActive; // si es que se solicita
							let $bulletActiving = _this.find('.' + sLayout.bulletClass).eq(bulletToActive);
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
					let $wrapperArrows = _this.find('.' + sLayout.wrapperArrowsClass);
					if (!configs.nav) {
						if($wrapperArrows.length) {
							if (!$wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.addClass(displayNodeClass);
						}
					} else {
						if(!$wrapperArrows.length) { // hay q crearlas
							let elementContainerNavs = '.' + sLayout.containerNavsClass,
									$containerNavs = _this.find(elementContainerNavs),
									defaultStylesArrow = (sLayout.arrowDefaultStyles) ? ' gs-style-arrow' : '',
									arrowsHtml = '<' + sLayout.wrapperArrowsTag + ' class="' +  sLayout.wrapperArrowsClass + defaultStylesArrow + '">';
									arrowsHtml += '<' + sLayout.arrowsTag + ' class="' + sLayout.arrowPrevClass + '">' + sLayout.arrowPrevContent + '</' + sLayout.arrowsTag + '>';
									arrowsHtml += '<' + sLayout.arrowsTag + ' class="' + sLayout.arrowNextClass + '">' + sLayout.arrowNextContent + '</' + sLayout.arrowsTag + '>';
									arrowsHtml += '</' + sLayout.wrapperArrowsTag + '>';
							if($containerNavs.length) {
								_this.find(elementContainerNavs).append(arrowsHtml)
							} else {
								_this.append('<' + sLayout.containerNavsTag + ' class="' + sLayout.containerNavsClass + '">' + arrowsHtml + '</' + sLayout.containerNavsTag + '>');
							}
							$wrapperArrows = _this.find('.' + sLayout.wrapperArrowsClass); // selección rectificada por creación
						} else {
							if ($wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.removeClass(displayNodeClass);
						}
					}

					if ($wrapperArrows.hasClass(attachedClass)) return false; // ya se adjunto el evento click
					$wrapperArrows.addClass(attachedClass);

					// haciendo click PREV
					_this.find('.' + sLayout.arrowPrevClass).on('click', function(){
						_objThis.goTo('prev');
					});

					// haciendo click NEXT
					_this.find('.' + sLayout.arrowNextClass).on('click', function(){
						_objThis.goTo('next');
					});
				},

				loadLazy: function($item, type) {
					let _objThis = this;

					let $lazyElements = $item.find('.' + settings.lazyClass);
					if (!$lazyElements.length) {
						// dando alto relativo al contenido si no exites lazys , y si no se está en fullscreen
						autoHeight($item);
						return false;
					}

					let $itemIndex = $item.index(),
							onLoadingItem = settings.onLoadingItem,
							onLoadedItem = settings.onLoadedItem,
							itemClassLoaded = sLayout.itemLoadedClass;

					$lazyElements.each(function(){
						let _element = $(this),
								dataLazy = _element.attr(settings.lazyAttr),
								dataLazyFs = _element.attr(settings.lazyAttrFs);

						let lazyTypes = {

							img: ()=> {

								// si se está en full screen, cargo la imagen en HD
								if(actions.fullscreen('check')) {
									if(dataLazyFs !== undefined) dataLazy = dataLazyFs;
								}

								if(dataLazy !== undefined) {

									$item.addClass(sLayout.itemLoadingClass);
									if (onLoadingItem !== undefined) onLoadingItem(_element, $itemIndex);

									let theSrcLoaded = _element.attr('src');
									if (theSrcLoaded == dataLazy) { // si ya se cargó la imagen..
										_cleanClass($item);
										autoHeight($item); //.. solo adapto el alto.
										return false;
									}

									_element.attr('src', dataLazy).one({
										load: () => {
											if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'success');
											_cleanClass($item);
											autoHeight($item);
											_objThis.log({type: 'not', text: 'recurso lazy "' + dataLazy + '" cargado correctamente desde el item con posición ' + ($itemIndex + 1) + '.'});
										},
										error: () => {
											if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'error');
											_cleanClass($item);
											_objThis.log({type: 'err', text: 'No fué posible cargar el recurso lazy "' + dataLazy + '" del item con posición ' + ($itemIndex + 1) + '.', required: true});
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
									checkVideoLoaded($item, _element);
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
									
									} else if (dataLazy.indexOf('vimeo')){

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
											_cleanClass($item);
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
					let $activeItem = $wrapperItems.find('.' + sLayout.itemActiveClass);
					return {item: $activeItem, index: $activeItem.index() + 1};
				},

				goTo: function(to, configs){
					if (_this.hasClass(sLayout.transitionClass)) return false; // para evitar otro pase con uno yá en curso.

					let $getActive = this.getActive(),
							$activeItem = $getActive.item,
							activeItemIndex = $getActive.index - 1,
							itemToActive;

					if (typeof to == 'string') { // puede ser next o prev, veamos
						if (configs == undefined) {
							configs = configsBk;
						}

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
							this.loadLazy(items.eq(indexsToLoad));
							indexsToLoad--;
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
					if(configs.bullets) this.bullets('active', configs);
				},

				autoPlay: function(action, configs) {
					if (configs == undefined) configs = configsBk;
					if(action == 'play') {

						if(gsIntervalSet !== undefined) return false; // por si se seteó el intervalo previamente
						gsIntervalSet = true;

						if (typeof gsInterval == 'undefined' || typeof gsInterval == 'number') {
							gsInterval = setInterval(()=>{
								this.goTo('next');
							}, configs.autoplaySpeed);
						}
						let playAP = configs.onPlay;
						if (playAP !== undefined) playAP();
					} else if (action == 'stop'){
						clearInterval(gsInterval);
						let stopAP = configs.onStop;
						if (stopAP !== undefined) stopAP();
						gsIntervalSet = undefined;
					}
				},

				fullscreen: function(configs) {
					let _objThis = this,
							$fsElement = _this.find('.' + sLayout.fsButtonClass),
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
								// evento
								let inFs = configs.onFullscreenIn;
								if(inFs !== undefined) inFs();
								//
								$(document).on('keyup', navByArrow);
								this.loadLazy(this.getActive().item);
								// cambiando a 1 items visibles
								let itemsCurrent = this.getItems();
								if(itemsCurrent !== 1) {
									lastItems = itemsCurrent;
									this.items(configs.itemsInFs);
								}
							}
						} else { // out
							if (_this.hasClass(sLayout.fsInClass)) {
								let outFs = configs.onFullscreenOut;
								if(outFs !== undefined) outFs();
								//volviendo a los items que tenía
								if(lastItems !== undefined) {
									let itemsCurrent = this.getItems();
									if(itemsCurrent !== lastItems) this.items(lastItems);
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
							}
						} // ejecución de eventos
					}

					// es la invocación del metodo desde una acción
					if (typeof configs == 'string') { 
						if (fullScreenApi.supportsFullScreen) {
							let actionsFs = {
								in: ()=> {
									if(_objThis.fullscreen('check')) {
										_objThis.log({type: 'not', text: 'Ya nos encontramos en fullscreen.', required: true});
									} else {
										_this.addClass(sLayout.fsInClass);
										$fsElement.addClass(sLayout.fsInClass);
										fullScreenApi.requestFullScreen(_this.get(0));
										$(document).on(fullScreenApi.fullScreenEventName, envOnFullScreen);
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
						if (!fullScreenApi.supportsFullScreen) return this.log({type: 'war', text: 'El dispositivo actual no soporta Full Screen.', required: true});
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

					if ($fsElement.hasClass(attachedClass)) return false; // ya se adjunto el evento click
					$fsElement.addClass(attachedClass);

					$fsElement.on('click', e => {
						e.preventDefault();
						this.fullscreen((!this.fullscreen('check')) ? 'in' : 'out');
					});

					// anidación antigua
					//$(document).on(fullScreenApi.fullScreenEventName, envOnFullScreen);
				},

				destroy: () => {
					if(!_this.hasClass(sLayout.builtClass)) return false;
					let htmlPure = '';
					_this.find('.' + sLayout.itemWrapperClass).each( function() {
						htmlPure += $(this).html();
					});
					_this.html(htmlPure).removeClass(sLayout.builtClass);
					if(_this.attr('id').indexOf('gs-slider-') !== -1) _this.removeAttr('id');
					let eventDestroyed = configsBk.onDestroyed;
					if(eventDestroyed !== undefined) eventDestroyed();
				},

				touch: function(estado) {

					let $theContainerItems = _this.find('.' + sLayout.containerItemsClass),
							sliderTouchStart, sliderTouchMove;

					if (!estado) {
						if ($theContainerItems.hasClass(sLayout.attachedClass)) {
							$theContainerItems.off('touchstart', sliderTouchStart);
							$theContainerItems.off('touchmove', sliderTouchMove);
							$theContainerItems.removeClass(sLayout.attachedClass);
						}
					} else {

						if ($theContainerItems.hasClass(sLayout.attachedClass)) return false; // xq yá se anidó
				
						var xDown = null;
						var yDown = null;

						sliderTouchStart = evt => {
							xDown = evt.touches[0].clientX;
							yDown = evt.touches[0].clientY;
						}
						sliderTouchMove = evt => {
							if ( ! xDown || ! yDown ) return false;
							var xUp = evt.touches[0].clientX;
							var yUp = evt.touches[0].clientY;
							var xDiff = xDown - xUp;
							var yDiff = yDown - yUp;
							if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
								evt.preventDefault();
								(xDiff > 0) ? this.goTo('next') : this.goTo('prev');
							}
							xDown = null;
							yDown = null;
						}
						//finalmente anidando el touch
						$theContainerItems.on({
							touchstart : sliderTouchStart,
							touchmove: sliderTouchMove
						}).addClass(sLayout.attachedClass);
					}
				}
			}

			// Inicializando
			actions.init(settings);
			(selections == 1) ? returns = actions : returns.push(actions);

		});
		
		return returns;
	}

}(jQuery));