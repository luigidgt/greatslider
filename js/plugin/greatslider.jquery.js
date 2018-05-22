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

		let _this = this;
		
		if (!_this.length) return console.error('* Great Slider [Logger] : No existe el contenedor maestro para hacer el slider.');

		let settings = {
			type: 'fade', // fade, swipe

			nav: true, // true, false
			navSpeed: 300, // en milisegundos

			items: 1,
			slideBy: 1,

			bullets: false, // true, false

			autoplay: false, // true, false
			autoplaySpeed: 5000,

			log: false,
			
			//startPosition: 0, parametro fantasma, solo si es solicitado
			fullscreen: false,

			lazyLoad: true,
			lazyClass: 'gs-lazy',
			lazyAttr: 'data-lazy',
			lazyAttrFs : 'data-lazyfs',

			preLoad: false,

			autoHeight: false,

			layout: {

				containerItems: '.gs-container-items',
				wrapperItems: '.gs-wrapper-items',
				transitionClass: 'gs-in-transition',

				itemClass: 'gs-item-slider',
				itemWrapperClass: 'gs-wrapper-content',
				itemActiveClass: 'gs-item-active',
				itemLoadingClass: 'gs-item-loading',
				itemLoadedClass: 'gs-item-loaded',

				containerNavs: '.gs-container-navs',

				wrapperArrows: '.gs-wrapper-arrows',
				arrowPrev: '.gs-prev-arrow',
				arrowNext: '.gs-next-arrow',

				wrapperBullets: '.gs-wrapper-bullets',
				bulletClass: 'gs-bullet',
				bulletActiveClass: 'gs-bullet-active',

				fsButton: '.gs-fs',
				fsInClass: 'gs-infs',
				fsOutClass: 'gs-outfs',

				noneClass: 'gs-none',
				attachedClass: 'gs-attached'

			}
		};
		if (options !== undefined) $.extend(settings, options);
		if (settings.type == 'fade') delete settings['breakPoints']; // si el slider es fade no debe a ver breakpoints

		let settingsBk = $.extend({}, settings);
		delete settingsBk['breakPoints'];
		delete settingsBk['layout'];

		// variables globales
		let breakPoint = 0,
				greatSliderInterval,
				greatSliderBreakPoint,
				sLayout = settings.layout,
				$wrapperItems = _this.find(sLayout.wrapperItems),
				items = _this.find('.' + sLayout.itemClass),
				nItems = items.length,
				attachedClass = sLayout.attachedClass,
				displayNodeClass = sLayout.noneClass,
				log = [],
				configsBk;

		if (!nItems) return console.error('* Great Slider [Logger] : No existen items para crear el slider :V');

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
				//console.log('no está en FS, si se activó el autoheight de parametro y los items son 1');
				let $altoContent = $item.find('.' + sLayout.itemWrapperClass).height(),
						$altoWrapperSlider = $wrapperItems.height();
				//if($altoWrapperSlider !== $altoContent) {
					//if ($altoContent > $altoWrapperSlider) {
						//$wrapperItems.height($altoContent);
						$wrapperItems.animate({height: $altoContent + 'px'}, 250);
					//}
				//}
			}	else {
				//console.log('no comple para el autoheight');
			}
		}

		// Acciones disponibles
		let actions = {

			init: function(configs){
				let _objThis = this;
				configsBk = configs; // relleno para consumirlo globalmente

				if (!_this.hasClass(attachedClass)) {
					let onInit = settings.onInit;
					if (onInit !== undefined) onInit();
					this.log({
						type: 'not',
						text: 'Slider Inicializandoce.'
					});
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
				//

				// Constructor de los Items
				this.items(configs);

				// Constructor de Bullets y anidación de eventos click
				this.bullets(configs); 

				// Anidando evento click a los Arrows
				this.navs(configs);

				// Full Screen
				this.fullscreen(configs);

				// Solo una vez
				if (_this.hasClass(attachedClass)) return false;
				_this.addClass(attachedClass);
				
				let theBreakPoints = configs.breakPoints;
				if(theBreakPoints !== undefined) {
					_objThis.breakPoints(theBreakPoints, window.innerWidth)
					greatSliderBreakPoint = false;
					// para los breakpoints
					$(window).resize(() => {
						if (greatSliderBreakPoint !== false) clearTimeout(greatSliderBreakPoint);
						greatSliderBreakPoint = setTimeout(() => {
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

				// Si se determinó un auto pase del slider
				if(configs.autoplay) {
					this.play(configs);
				}
			},

			items: function(configs) {
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
						let transStyle = '';
						transPrefix.forEach(thePrefix => {
							transStyle += thePrefix + ': opacity ' + (configs.navSpeed / 1000) + 's linear 0s;';
						});
						gsStyles = '.' + sLayout.itemClass + '{' + transStyle + '}';
						if (configs.lazyLoad) this.loadLazy($firstItem);
					},

					swipe: () => { // arrastre
						if (!$wrapperItems.hasClass('gs-transition-swipe')) $wrapperItems.addClass('gs-transition-swipe');

						// items
						let initItems = configs.items;
						let transStyle = 'width: ' + ((nItems * 100) / initItems) + '%;';
						transPrefix.forEach(thePrefix => {
							transStyle += thePrefix + ': margin-left ' + (configs.navSpeed / 1000) + 's linear 0s;';
						});
						gsStyles += sLayout.wrapperItems + '{' + transStyle + '}';
						gsStyles += '.' + sLayout.itemClass + '{width: ' + (100 / nItems) + '%}';

						// cargando los elementos 'lazy'
						if (configs.lazyLoad) {
							let i = 0;
							while (i < initItems) {
								this.loadLazy($theItems.eq(i));
								i++;
							};
						} else {
							// setear el alto del UL
							//$wrapperItems.height($item.find('.' + sLayout.itemWrapperClass).height());// SEGUIR TRABAJANDO EN ESTA PARTE.
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
						setTimeout(()=>{
							autoHeight(this.getActive().item);
						}, 500);
					}
				}

				let typeRun = sliderType[configs.type];
				if (typeRun !== undefined) {
					typeRun(configs);

					$('body').append('<style id="gs-styles">' + gsStyles + '</style>');

				} else {
					this.log({type: 'err', text: 'el tipo de slider determinado no es válido', required: true});
				}

			},

			bullets: function(configs, action) {
				let _objThis = this;

				let $wrapperBullets = _this.find(sLayout.wrapperBullets)
				if (!configs.bullets) {
					if (!$wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.addClass(displayNodeClass);
					return false;	
				} else {
					if ($wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.removeClass(displayNodeClass)
				}

				let classBulletActive = sLayout.bulletActiveClass;

				let actions = {

					constructor: function(){
						// calculando de acuerdo a los items a mostrar.
						let $theBullets = $wrapperBullets.find('.' + sLayout.bulletClass).eq(0),
								bulletTag = $theBullets.prop('tagName').toLowerCase(),
								bulletsHtml = '';


						let maxBullets = (configs.type == 'fade') ? nItems : nItems / configs.items;
						//maxBullets = ((nItems - configs.items) / configs.slideBy) + 1;
						if (maxBullets % 1 !== 0) maxBullets = Math.floor(maxBullets) + 1; // si sale decimal, aumento 1

						if ($theBullets.length == maxBullets) {
							// activando el item correspondiente
							this.active();
							return false;
						}

						// Creo los bullets que faltan
						let i = 0,
								itemToActive = this.active(true);

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

							//if (configs.type == 'swipe') {
								let suma = ($(this).index() + 1) * configsBk.items;
								//let suma = configsBk.items + (configsBk.slideBy * $(this).index());
								if (suma > nItems) suma = nItems;
								_objThis.goTo(suma);
							//}
						});
					},

					init: function() {
						this.constructor();
						this.nav();
					}

				}

				let theAction = (action == undefined) ? 'init' : action;
				actions[theAction]();	
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

				// haciendo click PREV
				_this.find(sLayout.arrowPrev).on('click', function(){
					_objThis.goTo('prev', configsBk);
				});

				// haciendo click NEXT
				_this.find(sLayout.arrowNext).on('click', function(){
					_objThis.goTo('next', configsBk);
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

				// alto temporal
				//autoHeight($item);

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
							if(fullScreenApi.isFullScreen()) {
								if(dataLazyFs !== undefined) dataLazy = dataLazyFs;
							}

							// se determinó cargar un tipo de lazy en específico
							if (type !== undefined) {
								if (type == 'normal') {
									dataLazy = _element.attr(settings.lazyAttr);
								} else if (type == 'fs') {
									dataLazy = dataLazyFs;
								}
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
									lazyTypes.script('https://player.vimeo.com/api/player.js', ()=>{
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

						script: function(theSrc, done){
							let r = false,
									s = document.createElement('script');
									s.type = 'text/javascript';
									s.src = theSrc;
									s.onload = s.onreadystatechange = function() {
										if ( !r && (!this.readyState || this.readyState == 'complete') ) {
											r = true;
											let theDone = done;
											if (typeof theDone == 'function') theDone(done);
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

				setTimeout(()=>{

					_this.removeClass(sLayout.transitionClass);

					let onStep = configs.onStep;
					if(onStep !== undefined) onStepEnd($itemActivating, itemToActive + 1);

					if(this.fullscreen('check')) this.loadLazy($activeItem, 'normal');

				}, configs.navSpeed);

				// OnLlega al último XD
				if(itemToActive == (nItems - 1)) {
					let lastItem = settings.onLastItem;
					if (lastItem !== undefined) lastItem($itemActivating, itemToActive);
				};

				// Cargando los elements 'lazy'
				if (configs.lazyLoad) {
					let indexsToLoad = itemToActive;
					while(indexsToLoad > (itemToActive - configs.items)) {
						this.loadLazy(items.eq(indexsToLoad));
						indexsToLoad--;
					}
				}

				// Activando el Bullet correspondiente
				if(!configs.bullets) return false;
				this.bullets(configs, 'active');
			},

			play: function(configs) {
				if (configs == undefined) configs = configsBk;
				if (typeof greatSliderInterval == 'undefined' || typeof greatSliderInterval == 'number') {
					greatSliderInterval = setInterval(()=>{
						this.goTo('next');
					}, configs.autoplaySpeed);
				}
				let playAP = configsBk.onPlay;
				if (playAP !== undefined) playAP();
			},

			stop: () => {
				clearInterval(greatSliderInterval);
				let stopAP = configsBk.onStop;
				if (stopAP !== undefined) stopAP();
			},

			fullscreen: function(configs) {
				let _objThis = this,
						$fsElement = _this.find(sLayout.fsButton);

				// es la invocación del metodo desde una acción
				if (typeof configs == 'string') { 
					if (fullScreenApi.supportsFullScreen) {
						let actionsFs = {
							in: ()=> {
								if(_objThis.fullscreen('check')) {
									_objThis.log({type: 'not', text: 'Ya nos encontramos en fullscreen.', required: true});
								} else {
									_this.addClass(sLayout.fsInClass);
									$fsElement.addClass(sLayout.fsInClass)
									fullScreenApi.requestFullScreen(_this.get(0));
								}
							},
							out: ()=> {
								if(_objThis.fullscreen('check')) {
									$fsElement.removeClass(sLayout.fsInClass);
									fullScreenApi.cancelFullScreen(_this.get(0));
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
					if ($fsElement.hasClass(displayNodeClass)) $fsElement.removeClass(displayNodeClass)
				} else {
					if (!$fsElement.hasClass(displayNodeClass)) $fsElement.addClass(displayNodeClass);
				}

				if ($fsElement.hasClass(attachedClass)) return false; // ya se adjunto el evento click
				$fsElement.addClass(attachedClass);

				$fsElement.on('click', e => {
					e.preventDefault();
					this.fullscreen((!this.fullscreen('check')) ? 'in' : 'out');
				});

				// Anidación de navegación por teclas de flechas
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
					}*/
				}

				// adición y sustracción de clase indicativa y ejecución de evento interno onFullscreen
				$(document).on(fullScreenApi.fullScreenEventName, ()=>{
					if (fullScreenApi.isFullScreen()){ // in

						if (_this.hasClass(sLayout.fsInClass)) {
							let inFs = configs.onFullscreenIn;
							if(inFs !== undefined) inFs();
							$(document).on('keyup', navByArrow);
							this.loadLazy(this.getActive().item);
						}

						/*
						$(document).on({
							'keyup': navByArrow,
							'mousewheel': navByArrow;
						});
						*/
						
					} else { // out
						if (_this.hasClass(sLayout.fsInClass)) {
							let outFs = configs.onFullscreenOut;
							if(outFs !== undefined) outFs();
							$(document).off('keyup', navByArrow);
							// para dar tiempo al navegador en la transición desde cuando se canceló el Fs y se completó
							setTimeout(()=>{ //
								//this.loadLazy(this.getActive().item);
								let i = 0;
								while (i <= nItems) {
									let theItem = items.eq(i);
									if(theItem.hasClass(sLayout.itemLoadedClass)) this.loadLazy(theItem);
									i++;
								};

							},500);
							//
							_this.removeClass(sLayout.fsInClass);
							$fsElement.removeClass(sLayout.fsInClass);
						}
					}
				});
			}

		}

		// Inicializando
		actions.init(settings);
		return actions;
	}

})(jQuery);