(function($){
	
	$.fn.greatSlider = function(options){

		let _this = this;
		
		if (!_this.length) return console.error('* Great Slider [Logger] : No existe el contenedor maestro para hacer el slider.');

		let settings = {
			type: 'fade', // fade, swipe

			nav: true, // true, false
			navSpeed: 500, // en milisegundos

			items: 1,
			slideBy: 1,

			bullets: true, // true, false

			autoplay: false, // true, false
			autoplaySpeed: 5000,

			log: false,
			
			//startPosition: 0, parametro fantasma, solo si es solicitado

			lazyLoad: true,
			lazyClass: 'gs-lazy',
			lazyAttr: 'data-lazy',

			layout: {

				containerItems: '.gs-container-items',
				wrapperItems: '.gs-wrapper-items',
				item: '.gs-item-slider',
				itemActive: '.gs-item-active',
				itemLoading: '.gs-item-loading',
				itemLoaded: '.gs-item-loaded',

				containerNavs: '.gs-container-navs',

				wrapperArrows: '.gs-wrapper-arrows',
				arrow: '.gs-arrow-nav',
				arrowPrev: '.gs-prev-arrow',
				arrowNext: '.gs-next-arrow',

				wrapperBullets: '.gs-wrapper-bullets',
				bullet: '.gs-bullet',
				bulletActive: '.gs-bullet-active',

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
				items = _this.find(sLayout.item),
				nItems = items.length,
				attachedClass = sLayout.attachedClass.substr(1),
				displayNodeClass = sLayout.noneClass,
				log = [],
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
			$item.addClass(sLayout.itemLoaded.substr(1));
			setTimeout(() => {
				$item.removeClass(sLayout.itemLoading.substr(1));
			}, 500);
		}

		// Acciones disponibles
		let actions = {

			init: function(configs){
				let _objThis = this;
				configsBk = configs; // relleno para consumirlo globalmente

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
						if (configs.lazyLoad) _thisActions.loadLazy($firstItem);
					},

					swipe: () => { // arrastre
						if (!$wrapperItems.hasClass('gs-transition-swipe')) $wrapperItems.addClass('gs-transition-swipe');

						// items
						let initItems = configs.items;
						$wrapperItems.css('width', ((nItems * 100) / initItems) + '%');
						items.css('width', (100 / nItems) + '%');

						// cargando los elementos 'lazy'
						if (configs.lazyLoad) {
							let i = 0;
							while (i < initItems) {
								_thisActions.loadLazy($theItems.eq(i));
								i++;
							};
						}

						// busca si ya se tiene activo un item
						let $activeItem = $wrapperItems.find(sLayout.itemActive);
						if (!$activeItem.length) { // no lo hay, activo el determinado por configs.items
							$theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
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
				(typeRun !== undefined) ? typeRun(configs) : this.log({type: 'err', text: 'el tipo de slider determinado no es válido', required: true});
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

				let classBulletActive = sLayout.bulletActive.substr(1);

				let actions = {

					constructor: function(){
						// calculando de acuerdo a los items a mostrar.
						let $theBullets = $wrapperBullets.find(sLayout.bullet),
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
							bulletsHtml += '<' + bulletTag + ' class="' + sLayout.bullet.substr(1) + bulletClassActive + '"></' + bulletTag + '>';
							i++;
						}

						$wrapperBullets.html(bulletsHtml);
					},

					active: getIndex => {
						let itemActive = _this.find(sLayout.wrapperItems + ' ' + sLayout.itemActive).index(),
								classBulletActive = sLayout.bulletActive.substr(1);

						let bulletToActive = (itemActive + 1) / configs.items;
						if (bulletToActive % 1 !== 0) bulletToActive = Math.floor(bulletToActive) + 1;
						bulletToActive -= 1;

						if (getIndex) return bulletToActive; // si es que se solicita
						let $bulletActiving = _this.find(sLayout.bullet).eq(bulletToActive);
						if (!$bulletActiving.hasClass(classBulletActive)) $bulletActiving.addClass(classBulletActive).siblings().removeClass(classBulletActive);
					},

					nav: () => {
						if ($wrapperBullets.hasClass(attachedClass)) return false; // ya adjuntó el click a los bullets, no continuo.
						$wrapperBullets.addClass(attachedClass); 

						$wrapperBullets.on('click', sLayout.bullet, function(){
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

				// haciendo click en PREV o NEXT
				_this.find(sLayout.arrow).on('click', function(){
					_objThis.goTo(($(this).hasClass(sLayout.arrowNext.substr(1))) ? 'next' : 'prev', configsBk);
				});
			},

			loadLazy: $item => {
				let $lazyElements = $item.find('.' + settings.lazyClass);
				if (!$lazyElements.length) return false;

				let $itemIndex = $item.index(),
						onLoadingItem = settings.onLoadingItem,
						onLoadedItem = settings.onLoadedItem,
						itemClassLoaded = sLayout.itemLoaded.substr(1);
				
				$lazyElements.each(function(){
					let _element = $(this),
							dataLazy = _element.attr(settings.lazyAttr);

					let lazyTypes = {

						img: ()=> {
							if(dataLazy !== undefined) {

								$item.addClass(sLayout.itemLoading.substr(1));
								if (onLoadingItem !== undefined) onLoadingItem(_element, $itemIndex);

								_element.attr('src', dataLazy).one({
									load: () => {
										if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'success');
										_cleanClass($item);
									},
									error: () => {
										if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'error');
										_cleanClass($item);
									}
								}).removeAttr(settings.lazyAttr);
							}
						},

						video: ()=> {
							if (!$item.hasClass(itemClassLoaded)) {
								$item.addClass(sLayout.itemLoading.substr(1));
								if (onLoadingItem !== undefined) onLoadingItem(_element, $itemIndex);

								if(dataLazy !== undefined) {
									_element.attr('src', dataLazy).removeAttr(settings.lazyAttr);
								} else {
									_element.find('source').each(function(){
										$(this).attr('src', $(this).attr(settings.lazyAttr)).removeAttr(settings.lazyAttr);
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
									$item.addClass(sLayout.itemLoaded.substr(1));
								
								} else if (dataLazy.indexOf('vimeo')){

									$item.addClass(sLayout.itemLoading.substr(1));

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

			goTo: function(to, configs){
				let $activeItem = _this.find(sLayout.wrapperItems + ' ' + sLayout.itemActive),
						activeItemIndex = $activeItem.index(),
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
				let itemActivating = items.eq(itemToActive),
						itemClassActive = sLayout.itemActive.substr(1);
						itemActivating.addClass(itemClassActive).siblings().removeClass(itemClassActive);

				// el tipo de pase
				if (configs.type == 'swipe') {
					let mLeft = ( (100 / configs.items) * (itemToActive + 1) ) - 100;
					if (mLeft < 0) mLeft = 0; // si el numero es negativo, significa que yá llegó al último.
					//_this.find(sLayout.wrapperItems).css('margin-left', '-' +  mLeft + '%');
					_this.find(sLayout.wrapperItems).animate({
						'margin-left' : '-' +  mLeft + '%'
					}, configs.navSpeed, () => {
						let onStep = configs.onStep;
						if(onStep !== undefined) onStep(itemToActive + 1);
					});
				}

				// OnLlega al último XD
				if(itemToActive == (nItems - 1)) {
					let lastItem = settings.onLastItem;
					if (lastItem !== undefined) lastItem();
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
			}

		}

		// Inicializando
		actions.init(settings);
		return actions;
	}

})(jQuery);

