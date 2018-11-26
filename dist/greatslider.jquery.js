"use strict";

// Full Screen API
(function () {
  var fullScreenApi = {
    supportsFullScreen: false,
    isFullScreen: function isFullScreen() {
      return false;
    },
    requestFullScreen: function requestFullScreen() {},
    cancelFullScreen: function cancelFullScreen() {},
    fullScreenEventName: '',
    prefix: ''
  },
      browserPrefixes = 'webkit moz o ms khtml'.split(' '); // check for native support

  if (typeof document.cancelFullScreen !== 'undefined') {
    fullScreenApi.supportsFullScreen = true;
  } else {
    // check for fullscreen support by vendor prefix
    var il = browserPrefixes.length;

    for (var i = 0; i < il; i++) {
      var thePrefix = browserPrefixes[i];

      if (typeof document[thePrefix + 'CancelFullScreen'] !== 'undefined') {
        fullScreenApi.supportsFullScreen = true;
        fullScreenApi.prefix = thePrefix;
        break;
      }
    }
  } // update methods to do something useful


  if (fullScreenApi.supportsFullScreen) {
    fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

    fullScreenApi.isFullScreen = function () {
      switch (this.prefix) {
        case '':
          return document.fullScreen;

        case 'webkit':
          return document.webkitIsFullScreen;

        default:
          return document[this.prefix + 'FullScreen'];
      }
    };

    fullScreenApi.requestFullScreen = function (el) {
      return this.prefix === '' ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
    };

    fullScreenApi.cancelFullScreen = function (el) {
      return this.prefix === '' ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
    };
  } // export api


  window.fullScreenApi = fullScreenApi;
})(); // Great Slider Plugin


(function ($) {
  // funciones útiles
  var checkVideoTimes = 0;
  var _tools = {
    makeid: function makeid() {
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
          text = "";

      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text.toLowerCase();
    },
    cleanClass: function cleanClass($item, sLayout) {
      $item.addClass(sLayout.itemLoadedClass);
      setTimeout(function () {
        $item.removeClass(sLayout.itemLoadingClass);
      }, 500);
    },
    checkVideoLoaded: function checkVideoLoaded($item, $video, settings) {
      var _this2 = this;

      var onLoadedItem = settings.onLoadedItem;
      checkVideoTimes += 0.25;

      if (checkVideoTimes >= 20) {
        if (onLoadedItem !== undefined) onLoadedItem($video, $item.index(), 'error');
        this.cleanClass($item, settings.layout);
        return false;
      }

      var theVideo = $video.get(0);

      if (theVideo.readyState == 4) {
        theVideo.play();
        this.cleanClass($item, settings.layout);
        checkVideoTimes = 0;
        if (onLoadedItem !== undefined) onLoadedItem($video, $item.index(), 'success');
      } else {
        setTimeout(function () {
          _this2.checkVideoLoaded($item, $video, settings);
        }, 250);
      }
    } // seteando info para comprobaciones posteriores

  };
  window.gs = {
    info: {
      name: 'Great Slider',
      version: 'Alfa 1.2.0'
    },
    slider: {} //Returns constructor

  };

  function Returns(theActions) {
    this.getItems = theActions.getItems;
    this.getActive = theActions.getActive;
    this.bullets = theActions.bullets;
    this.navs = theActions.navs;
    this.items = theActions.items;
    this.goTo = theActions.goTo;
    this.loadLazy = theActions.loadLazy;
    this.drag = theActions.drag;
    this.autoPlay = theActions.autoPlay;
    this.fullscreen = theActions.fullscreen;
    this.destroy = theActions.destroy;
    this.touch = theActions.touch;
    this.log = theActions.log;
  } // el plugin


  $.fn.greatSlider = function (options) {
    var selections = this.length,
        returns = [],
        optionsBk = options,
        sliderInFs;
    this.each(function () {
      // para el tratado de multiples slider con la misma clase
      var _this = $(this);

      if (!selections) return console.error('* Great Slider [Logger] : No existe el contenedor maestro para hacer el slider.');
      var settings = {
        type: 'fade',
        // fade, swipe
        nav: true,
        navSpeed: 500,
        // en milisegundos
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
        autoplaySpeed: 5000,
        // en milisegundos
        log: false,
        dataParam: 'data-gs',
        //startPosition: 0, parametro fantasma, solo si es solicitado
        fullscreen: false,
        lazyLoad: false,
        lazyClass: 'gs-lazy',
        lazyAttr: 'data-lazy',
        lazyAttrFs: 'data-lazyfs',
        lazyLoadOnDestroy: true,
        preLoad: false,
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
      }; // extendiendo los parametros de configuración desde objeto pasado

      if (options !== undefined) $.extend(true, settings, options); // extendiendo los parametros de configuración desde parametro data

      var $dataGs = _this.attr(settings.dataParam);

      if ($dataGs !== undefined) $.extend(true, settings, JSON.parse($dataGs)); //if (settings.type == 'fade') delete settings['breakPoints']; // si el slider es fade no debe a ver breakpoints

      var settingsBk = $.extend(true, {}, settings);
      delete settingsBk['breakPoints'];
      delete settingsBk['layout']; // variables globales

      var $existingItems = _this.find('> *'),
          breakPoint = 0,
          gsInterval,
          gsBreakPoint,
          gsAutoHeight,
          gsIntervalSet,
          $wrapperItems,
          _items,
          nItems,
          currentItems,
          sLayout = settings.layout,
          attachedClass = sLayout.attachedClass,
          displayNodeClass = sLayout.noneClass,
          _log = [],
          $idThis,
          configsBk;

      function autoHeight($item) {
        if (!actions.fullscreen('check') && configsBk.autoHeight && configsBk.items == 1) {
          var $altoContent = $item.find('> .' + sLayout.itemWrapperClass).height();
          $wrapperItems.css('height', $altoContent + 'px');
        }
      } // Acciones disponibles


      var actions = {
        init: function init(configs) {
          var _this3 = this;

          var _objThis = this;

          configsBk = configs; // relleno para consumirlo globalmente
          // verificamos si se desea destruir (por BreakPoint)

          if (configs.destroy) {
            this.destroy();
            return false;
          } // Si se determinó un auto pase del er


          configs.autoplay ? this.autoPlay('play', configs) : this.autoPlay('stop', configs); // Si aun no se construye el slider

          if (!_this.hasClass(sLayout.builtClass)) {
            // Evento de inicialización
            var onInit = settings.onInit;
            if (onInit !== undefined) onInit();
            this.log({
              type: 'not',
              text: 'Slider Inicializandoce.'
            }); // Asignandole un ID si no lo tiene

            $idThis = _this.attr('id');

            if ($idThis == undefined) {
              $idThis = 'gs-slider-' + _tools.makeid();

              _this.attr('id', $idThis);
            } // anidando functión autoHeight en redimencionamiento de ventana si el slider es fade o se definió el autoheight


            if (configs.autoHeight || configs.type == 'fade') {
              gsAutoHeight = false;
              $(window).resize(function () {
                if (gsAutoHeight !== false) clearTimeout(gsAutoHeight);
                gsAutoHeight = setTimeout(function () {
                  autoHeight(_this3.getActive().item);
                }, 750);
              });
            }
          } // verificaciones de sentido comun


          if (configs.slideBy > configs.items) {
            this.log({
              type: 'err',
              text: 'No es posible determinar que el pase por frame (' + configs.slideBy + ') sea mayor al mostrado de items (' + configs.items + ').',
              required: true
            });
            return false;
          } // Constructor de los Items


          this.items(configs); // Constructor de Bullets y anidación de eventos click

          this.bullets('init', configs); // Anidando evento click a los Arrows

          this.navs(configs); // Full Screen

          this.fullscreen(configs); // Anidando el desplazamiento por touch

          this.touch(configs.touch); // Solo una vez

          if (_this.hasClass(sLayout.builtClass)) return false;

          _this.addClass(sLayout.builtClass); // Break Points


          var theBreakPoints = configs.breakPoints;

          if (theBreakPoints !== undefined) {
            _objThis.breakPoints(theBreakPoints, window.innerWidth);

            gsBreakPoint = false; // para los breakpoints

            $(window).resize(function () {
              if (_this.hasClass(sLayout.fsInClass)) return false; //para que el reacomodo de los items en resize no sea tan brusco

              if (!_this.hasClass(sLayout.resizeClass)) _this.addClass(sLayout.resizeClass);
              if (gsBreakPoint !== false) clearTimeout(gsBreakPoint);
              gsBreakPoint = setTimeout(function () {
                var wWindow = window.innerWidth; //para que el reacomodo de los items en resize no sea tan brusco

                if (!_this.hasClass(sLayout.resizedClass)) {
                  setTimeout(function () {
                    _this.addClass(sLayout.resizedClass);
                  }, 500);
                }

                setTimeout(function () {
                  _this.removeClass(sLayout.resizeClass).removeClass(sLayout.resizedClass);
                }, 1000); //

                _objThis.breakPoints(theBreakPoints, wWindow); // event onResized


                var onResized = settings.onResized;
                if (onResized !== undefined) onResized(wWindow, _this3.getItems(), _this3.getActive());
              }, 750);
            });
          } // Sistema inicializado


          var onInited = settings.onInited;
          setTimeout(function () {
            if (onInited !== undefined) onInited(_this3.getItems(), _this3.getActive());
          }, 500);
          this.log({
            type: 'not',
            text: 'Slider Inicializado.'
          }); // Comenzar en un item en específico

          var startPosition = configs.startPosition;

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
        items: function items(configs, itemToGo2) {
          var _this4 = this;

          // si se llama como método indicando un cambio de items a mostrar.
          if (typeof configs == 'number') {
            var itemsToShow = configs;
            configs = configsBk;
            configs.items = itemsToShow;
            configs.slideBy = 1;
            this.bullets('refresh');
          } //
          // Construcción del slider


          if (!_this.hasClass(sLayout.builtClass)) {
            if (!$existingItems.length) return this.log({
              type: 'err',
              text: 'No existen items para crear el slider.',
              required: true
            });
            var lis = '';
            $existingItems.each(function (i, e) {
              lis += '<' + sLayout.itemTag + ' class="' + sLayout.itemClass + '"><' + sLayout.itemWrapperTag + ' class="' + sLayout.itemWrapperClass + '">' + $(this).get(0).outerHTML + '</' + sLayout.itemWrapperTag + '></' + sLayout.itemTag + '>';
            });

            _this.html('<' + sLayout.containerItemsTag + ' class="' + sLayout.containerItemsClass + '"><' + sLayout.wrapperItemsTag + ' class="' + sLayout.wrapperItemsClass + '">' + lis + '</' + sLayout.wrapperItemsTag + '></' + sLayout.containerItemsTag + '>');

            $wrapperItems = _this.find("> .".concat(sLayout.containerItemsClass, " > .").concat(sLayout.wrapperItemsClass));
            _items = $wrapperItems.find('> .' + sLayout.itemClass);
            nItems = _items.length;
          }

          var $theItems = $wrapperItems.find('> .' + sLayout.itemClass),
              $firstItem = $theItems.eq(0),
              iActivePure = sLayout.itemActiveClass; // Los Items

          var gsStyles = '',
              transPrefix = ['-webkit-transition', '-o-transition', 'transition'],
              sliderType = {
            fade: function fade() {
              // desaparecimiento
              if ($wrapperItems.hasClass('gs-transition-fade')) return false;
              $wrapperItems.addClass('gs-transition-fade');
              $firstItem.addClass(iActivePure);
              var itemsStyle = '',
                  wrapperStyle = '';
              transPrefix.forEach(function (thePrefix) {
                itemsStyle += thePrefix + ': opacity ' + configs.navSpeed / 1000 + 's ' + sLayout.transitionMode + ' 0s;';
                wrapperStyle += thePrefix + ': height .3s ' + sLayout.transitionMode + ' 0s;';
              });
              gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + '{' + wrapperStyle + '}';
              gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + ' > .' + sLayout.itemClass + '{' + itemsStyle + '};'; // si el lazy está activado

              if (configs.lazyLoad) _this4.loadLazy($firstItem); // si no se declaro en las 'opciones' un autoHeight de le asigna automáticamente por la naturaleza del slider

              if (optionsBk.autoHeight == undefined) {
                configs.autoHeight = true;
                setTimeout(function () {
                  autoHeight(_this4.getActive().item);
                }, 500);
              }
            },
            swipe: function swipe() {
              // arrastre
              if (!$wrapperItems.hasClass('gs-transition-swipe')) $wrapperItems.addClass('gs-transition-swipe'); // items

              var initItems = configs.items,
                  transStyle = 'width: ' + nItems * 100 / initItems + '%;';
              currentItems = initItems; // para consumir globalmente.

              transPrefix.forEach(function (thePrefix) {
                transStyle += thePrefix + ': margin-left ' + configs.navSpeed / 1000 + 's ' + sLayout.transitionMode + ' 0s, height .3s linear 0s;';
              });
              gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + ' {' + transStyle + '}';
              gsStyles += '#' + $idThis + ' > .' + sLayout.containerItemsClass + ' > .' + sLayout.wrapperItemsClass + ' > .' + sLayout.itemClass + ' {width: ' + 100 / nItems + '%}'; // cargando los elementos 'lazy'

              if (configs.lazyLoad) {
                var i = 0;

                while (i < initItems) {
                  _this4.loadLazy($theItems.eq(i));

                  i++;
                }

                ;
              } // Eliminando el 'height' dado inline porque posiblemente cuando solo era 1 item por vez tenía 'autoHeight'


              if (configs.items >= 2) {
                var $theUl = _this.find("> .".concat(sLayout.containerItemsClass, " > .").concat(sLayout.wrapperItemsClass));

                if ($theUl.attr('style') !== undefined) $theUl.removeAttr('style');
              } // busca si ya se tiene activo un item


              var $activeItem = $wrapperItems.find('> .' + sLayout.itemActiveClass);

              if (!$activeItem.length) {
                // no lo hay, activo el determinado por configs.items
                $theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
              } else {
                // activo el primero
                var $activeItemIndex = $activeItem.index();

                if ($activeItemIndex < initItems - 1) {
                  // si el activo es menor
                  $theItems.eq(initItems - 1).addClass(iActivePure).siblings().removeClass(iActivePure);
                  $wrapperItems.removeAttr('style');
                } else {
                  // para ir a un item específico si se acciona un full screen con un item específico
                  if (itemToGo2 == undefined) {
                    _this4.goTo($activeItem.index() + 1, true);
                  } else {
                    _this4.goTo(itemToGo2, true);
                  }
                }
              } // auto height


              if (!configs.lazyLoad) {
                setTimeout(function () {
                  autoHeight(_this4.getActive().item);
                }, 500);
              }
            }
          };
          var typeRun = sliderType[configs.type];

          if (typeRun !== undefined) {
            typeRun(configs); // activando o desactivando la navegación por arrastre

            settings.drag ? this.drag(true) : this.drag(false); // Verificando su estilaje

            var theIdSlider = 'gs-styles-' + $idThis.replace('gs-slider-', ''),
                $stylesSlider = $('#' + theIdSlider);
            $stylesSlider.length ? $stylesSlider.html(gsStyles) : $('body').append('<style id="' + theIdSlider + '">' + gsStyles + '</style>');
          } else {
            this.log({
              type: 'err',
              text: 'el tipo de slider determinado no es válido',
              required: true
            });
          }
        },
        drag: function drag(status) {
          var _objThis = this;

          var $containerItems = _this.find('> .' + sLayout.containerItemsClass);

          var theContainer = $containerItems.get(0);
          var dragClasses = settings.dragClass;
          if (settings.dragHand) dragClasses += ' ' + settings.dragHandClass;

          if (!status) {
            if (theContainer.classList.contains(settings.dragClass)) {
              theContainer.classList.remove(dragClasses);
              $containerItems.off('mouseenter mousedown mousemove mouseup mouseleave');
            }
          } else {
            if (!theContainer.classList.contains(settings.dragClass)) {
              var gsMouseX = null,
                  $ciWidth = $containerItems.width() / settings.dragIn,
                  marginLeft = null,
                  itemActiveIndex = null,
                  mouseDown = false;
              $containerItems.on({
                mouseenter: function mouseenter(e) {
                  $(this).addClass(sLayout.wrapperMouseEnterClass);
                },
                mousedown: function mousedown(e) {
                  mouseDown = true;
                  $(this).get(0).classList.add(sLayout.wrapperMouseDownClass);
                  gsMouseX = e.clientX;
                  marginLeft = Number($containerItems.find('> .' + sLayout.wrapperItemsClass).css('margin-left').replace('px', '')); // CONTINUAR TRABAJANDO EN ESTO.

                  itemActiveIndex = _objThis.getActive().index;
                },
                mousemove: function mousemove(e) {
                  var _theElement = $(this);

                  if (mouseDown) {
                    var draging = e.pageX - gsMouseX;

                    if (e.pageX > gsMouseX) {
                      // se arrastra a la derecha para ir al item ANTERIOR
                      var toDrag = marginLeft + draging;

                      if (draging >= $ciWidth) {
                        $(this).get(0).classList.remove(sLayout.wrapperMouseDownClass);
                        itemActiveIndex !== 1 ? _objThis.goTo('prev') : _objThis.goTo(_objThis.getActive().index, true);
                        mouseDown = false;
                        marginLeft = null;
                      } else {
                        if (settings.type == 'swipe') {
                          $containerItems.find('> .' + sLayout.wrapperItemsClass).css('margin-left', toDrag + 'px');
                        }
                      }
                    } else {
                      // se arrastra a la izquierda para ir al SIGUIENTE item
                      var _toDrag = marginLeft + draging;

                      if (draging <= Number('-' + $ciWidth)) {
                        $(this).get(0).classList.remove(sLayout.wrapperMouseDownClass);
                        itemActiveIndex !== nItems ? _objThis.goTo('next') : _objThis.goTo(_objThis.getActive().index, true);
                        mouseDown = false;
                        marginLeft = null;
                      } else {
                        if (settings.type == 'swipe') {
                          $containerItems.find('> .' + sLayout.wrapperItemsClass).css('margin-left', _toDrag + 'px');
                        }
                      }
                    }
                  }
                },
                mouseup: function mouseup(e) {
                  $(this).removeClass(sLayout.wrapperMouseDownClass);
                  gsMouseX = null, itemActiveIndex = null, mouseDown = false;

                  if (marginLeft !== null) {
                    _objThis.goTo(_objThis.getActive().index, true);
                  }
                },
                mouseleave: function mouseleave(e) {
                  $(this).removeClass(sLayout.wrapperMouseEnterClass);
                  if ($(this).hasClass(sLayout.wrapperMouseDownClass)) $(this).removeClass(sLayout.wrapperMouseDownClass);
                  if (marginLeft !== null) _objThis.goTo(_objThis.getActive().index, true);
                  marginLeft = null;
                  gsMouseX = null;
                  itemActiveIndex = null, mouseDown = false;
                }
              }).addClass(dragClasses);
            }
          }
        },
        getItems: function getItems() {
          return currentItems;
        },
        bullets: function bullets(action, configs) {
          // this.bullets('active', configs);
          // si la invocación del método es por una acción.
          if (configs == undefined) configs = configsBk;

          if (typeof action == 'boolean') {
            configs.bullets = action;
            action = 'init';
          } //


          var _objThis = this,
              maxBullets,
              $wrapperBullets = _this.find("> .".concat(sLayout.containerNavsClass, " > .").concat(sLayout.wrapperBulletsClass));

          var classBulletActive = sLayout.bulletActiveClass;
          var actions = {
            constructor: function constructor() {
              if (configs.bullets) {
                // Verificando si realmente debo crear bullets
                maxBullets = configs.type == 'fade' ? nItems : nItems / configs.items;
                if (maxBullets % 1 !== 0) maxBullets = Math.floor(maxBullets) + 1; // si sale decimal, aumento 1
                // si solo se mostrará 1 bullet, lo escondo, xq no tiene sentido mostrarlo.

                if (maxBullets == 1) {
                  if (!$wrapperBullets.hasClass(displayNodeClass)) {
                    $wrapperBullets.addClass(displayNodeClass);
                  }

                  _objThis.log({
                    type: 'not',
                    text: 'No es necesario mostrar y/o crear los bullets.'
                  });

                  return false;
                } // creando el container navs


                if (!_this.find('> .' + sLayout.containerNavsClass).length) {
                  // no existen su wrapper nav,  hay que crearlo
                  _this.append('<' + sLayout.containerNavsTag + ' class="' + sLayout.containerNavsClass + '"></' + sLayout.containerNavsTag + '>');
                } // creando el wrapper de bullets


                if (!$wrapperBullets.length) {
                  _this.find('> .' + sLayout.containerNavsClass).append('<' + sLayout.wrapperBulletsTag + ' class="' + sLayout.wrapperBulletsClass + (sLayout.bulletDefaultStyles ? ' gs-style-bullets' : '') + '"></' + sLayout.wrapperBulletsTag + '>');

                  $wrapperBullets = _this.find("> .".concat(sLayout.containerNavsClass, " > .").concat(sLayout.wrapperBulletsClass));
                } else {
                  // si yá existe, verifico que no esté oculto
                  if ($wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.removeClass(displayNodeClass);
                } // calculando de acuerdo a los items a mostrar.


                var $theBullets = $wrapperBullets.find('> .' + sLayout.bulletClass),
                    bulletsHtml = ''; // activando el item correspondiente si los bullets existentes son iguales a los que crearemos

                if ($theBullets.length == maxBullets) {
                  this.active();
                  return false;
                } // Creo los bullets que faltan


                var i = 0,
                    itemToActive = this.active(true),
                    bulletTag = sLayout.bulletTag;

                while (i < maxBullets) {
                  var bulletClassActive = i !== itemToActive ? '' : ' ' + classBulletActive;
                  bulletsHtml += '<' + bulletTag + ' class="' + sLayout.bulletClass + bulletClassActive + '"></' + bulletTag + '>';
                  i++;
                }

                $wrapperBullets.html(bulletsHtml);
              } else {
                // se determinó false
                $wrapperBullets = _this.find("> .".concat(sLayout.containerNavsClass, " > .").concat(sLayout.wrapperBulletsClass));

                if ($wrapperBullets.length) {
                  // verifico si existe
                  if (!$wrapperBullets.hasClass(displayNodeClass)) $wrapperBullets.addClass(displayNodeClass);
                  return false;
                }
              }
            },
            active: function active(getIndex) {
              var itemActive = $wrapperItems.find('> .' + sLayout.itemActiveClass).index();
              var bulletToActive = (itemActive + 1) / configs.items;
              if (bulletToActive % 1 !== 0) bulletToActive = Math.floor(bulletToActive) + 1;
              bulletToActive -= 1;
              if (getIndex) return bulletToActive; // si es que se solicita

              var $bulletActiving = _this.find('> .' + sLayout.containerNavsClass + ' .' + sLayout.bulletClass).eq(bulletToActive);

              if (!$bulletActiving.hasClass(classBulletActive)) $bulletActiving.addClass(classBulletActive).siblings().removeClass(classBulletActive);
            },
            nav: function nav() {
              if ($wrapperBullets.hasClass(attachedClass)) return false; // ya adjuntó el click a los bullets, no continuo.

              $wrapperBullets.addClass(attachedClass);
              $wrapperBullets.on('click', '.' + sLayout.bulletClass, function () {
                if ($(this).hasClass(classBulletActive)) return false;
                $(this).addClass(classBulletActive).siblings().removeClass(classBulletActive);
                var suma = ($(this).index() + 1) * configsBk.items;
                if (suma > nItems) suma = nItems;

                _objThis.goTo(suma);
              });
            },
            init: function init() {
              this.constructor();
              this.nav();
            }
          };
          var theAction = action == undefined || action == 'refresh' ? 'init' : action;
          actions[theAction]();
        },
        navs: function navs(configs) {
          var _objThis = this; // si el metodo se invoca desde una acción


          if (typeof configs == 'boolean') {
            var navStatus = configs;
            configs = configsBk;
            configs.nav = navStatus;
          } //
          // verificación


          var $wrapperArrows = _this.find('> .' + sLayout.containerNavsClass + ' .' + sLayout.wrapperArrowsClass);

          if (!configs.nav) {
            if ($wrapperArrows.length) {
              if (!$wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.addClass(displayNodeClass);
            }
          } else {
            if (!$wrapperArrows.length) {
              // hay q crearlas
              _objThis.log({
                type: 'not',
                text: 'NO existe el NAV, se creará.'
              });

              var elementContainerNavs = '> .' + sLayout.containerNavsClass,
                  $containerNavs = _this.find(elementContainerNavs),
                  defaultStylesArrow = sLayout.arrowDefaultStyles ? ' gs-style-arrow' : '',
                  arrowsHtml = '<' + sLayout.wrapperArrowsTag + ' class="' + sLayout.wrapperArrowsClass + defaultStylesArrow + '">';

              arrowsHtml += '<' + sLayout.arrowsTag + ' class="' + sLayout.arrowPrevClass + '">' + sLayout.arrowPrevContent + '</' + sLayout.arrowsTag + '>';
              arrowsHtml += '<' + sLayout.arrowsTag + ' class="' + sLayout.arrowNextClass + '">' + sLayout.arrowNextContent + '</' + sLayout.arrowsTag + '>';
              arrowsHtml += '</' + sLayout.wrapperArrowsTag + '>';

              if ($containerNavs.length) {
                _objThis.log({
                  type: 'not',
                  text: 'Ya existe el NAV, se crearán las flechas.'
                });

                _this.find(elementContainerNavs).append(arrowsHtml);
              } else {
                _objThis.log({
                  type: 'not',
                  text: 'NO existe el NAV, creará el contenedor y las flechas.'
                });

                _this.append('<' + sLayout.containerNavsTag + ' class="' + sLayout.containerNavsClass + '">' + arrowsHtml + '</' + sLayout.containerNavsTag + '>');
              }

              $wrapperArrows = _this.find('.' + sLayout.wrapperArrowsClass); // selección rectificada por creación
            } else {
              _objThis.log({
                type: 'not',
                text: 'Ya existe el NAV, no se creará.'
              });

              if ($wrapperArrows.hasClass(displayNodeClass)) $wrapperArrows.removeClass(displayNodeClass);
            }
          }

          if ($wrapperArrows.hasClass(attachedClass)) return false; // ya se adjunto el evento click

          $wrapperArrows.addClass(attachedClass);

          _objThis.log({
            type: 'not',
            text: 'Adjuntando eventos click a las flechas del NAV.'
          }); // haciendo click PREV


          $wrapperArrows.find('.' + sLayout.arrowPrevClass).on('click', function () {
            _objThis.goTo('prev');
          }); // haciendo click NEXT

          $wrapperArrows.find('.' + sLayout.arrowNextClass).on('click', function () {
            _objThis.goTo('next');
          });
        },
        loadLazy: function loadLazy($item, type) {
          var _objThis = this,
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

          var $itemIndex = $item.index(),
              onLoadingItem = settings.onLoadingItem,
              onLoadedItem = settings.onLoadedItem,
              itemClassLoaded = sLayout.itemLoadedClass;
          $lazyElements.each(function () {
            var _element = $(this),
                dataLazy = _element.attr(settings.lazyAttr);

            var lazyTypes = {
              img: function img() {
                // si se está en full screen, cargo la imagen en HD
                if (actions.fullscreen('check')) {
                  var dataLazyFs = _element.attr(settings.lazyAttrFs);

                  if (dataLazyFs !== undefined) dataLazy = dataLazyFs;
                }

                if (dataLazy !== undefined) {
                  $item.addClass(sLayout.itemLoadingClass);
                  if (onLoadingItem !== undefined) onLoadingItem(_element, $itemIndex);

                  var theSrcLoaded = _element.attr('src');

                  if (theSrcLoaded == dataLazy) {
                    // si ya se cargó la imagen..
                    _tools.cleanClass($item, sLayout);

                    autoHeight($item); //.. solo adapto el alto.

                    return false;
                  }

                  _element.attr('src', dataLazy).one({
                    load: function load() {
                      if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'success');

                      _tools.cleanClass($item, sLayout);

                      autoHeight($item);

                      _objThis.log({
                        type: 'not',
                        text: 'recurso lazy "' + dataLazy + '" cargado correctamente desde el item con posición ' + ($itemIndex + 1) + '.'
                      });
                    },
                    error: function error() {
                      if (onLoadedItem !== undefined) onLoadedItem(_element, $itemIndex, 'error');

                      _tools.cleanClass($item, sLayout);

                      _objThis.log({
                        type: 'err',
                        text: 'No fué posible cargar el recurso lazy "' + dataLazy + '" del item con posición ' + ($itemIndex + 1) + '.'
                      });
                    }
                  });
                }
              },
              video: function video() {
                if (!$item.hasClass(itemClassLoaded)) {
                  $item.addClass(sLayout.itemLoadingClass);
                  if (onLoadingItem !== undefined) onLoadingItem(_element, $itemIndex);

                  if (dataLazy !== undefined) {
                    _element.attr('src', dataLazy);
                  } else {
                    _element.find('source').each(function () {
                      $(this).attr('src', $(this).attr(settings.lazyAttr));
                    });
                  }

                  _element.get(0).load();

                  _tools.checkVideoLoaded($item, _element, settings);
                } else {
                  _element.get(0).play();
                }
              },
              iframe: function iframe() {
                if (!$item.hasClass(itemClassLoaded)) {
                  if (dataLazy.indexOf('youtu') !== -1) {
                    // es un video de youtube
                    var parameters, idYt; // si el url es https://www.youtube.com/watch?v=4RUGmBxe65U

                    if (dataLazy.indexOf('watch') !== -1) {
                      idYt = dataLazy.substr(dataLazy.indexOf('=') + 1, 11);
                      parameters = dataLazy.substr(dataLazy.indexOf('=') + 12);
                    } // si el url es https://youtu.be/4RUGmBxe65U


                    if (dataLazy.indexOf('youtu.be') !== -1) {
                      idYt = dataLazy.substr(dataLazy.lastIndexOf('/') + 1, 11);
                      parameters = dataLazy.substr(dataLazy.lastIndexOf('/') + 12);
                      parameters = parameters.substr(1);
                    } // si el url es https://www.youtube.com/embed/4RUGmBxe65U


                    if (dataLazy.indexOf('embed') !== -1) {
                      idYt = dataLazy.substr(dataLazy.lastIndexOf('/') + 1, 11);
                      parameters = dataLazy.substr(dataLazy.lastIndexOf('/') + 12);
                      parameters = parameters.substr(1);
                    } // limpiando del primer caracter


                    var firstCaracter = parameters.substring(0, 1);
                    if (firstCaracter == '&') parameters = parameters.substr(1); // cambio de parametro tiempo de inicio

                    if (parameters.indexOf('rt=') == -1 && parameters.indexOf('t=') !== -1) {
                      parameters = parameters.replace('t=', 'start=');

                      if (parameters.indexOf('&') !== -1) {
                        var newParameters = [];
                        $.each(parameters.split('&'), function (i, k) {
                          var splitParameters = k.split('=');

                          if (splitParameters[0] == 'start') {
                            var theTime = splitParameters[1],
                                minutes = theTime.indexOf('m'),
                                seconds = theTime.indexOf('s');
                            var minutesNumber = 0,
                                secondsNumber = 0;

                            if (minutes !== -1) {
                              minutesNumber = Number(theTime.substring(0, minutes)) * 60;
                              minutes = minutes + 1;
                            } else {
                              minutes = 0;
                            }

                            if (seconds !== -1) secondsNumber = Number(theTime.substring(minutes, seconds));
                            newParameters.push('start=' + (minutesNumber + secondsNumber));
                          } else {
                            newParameters.push(k);
                          }
                        });
                        parameters = newParameters.join('&');
                      } else {
                        parameters = parameters.substring(0, parameters.length - 1);
                      }
                    } // agregandole finalmente el autoplay si es que no lo tiene


                    if (parameters.indexOf('autoplay') == -1) parameters += '&autoplay=1'; // final url

                    dataLazy = 'https://www.youtube.com/embed/' + idYt + '?' + parameters + '&enablejsapi=1';

                    _element.attr('src', dataLazy).removeAttr(settings.lazyAttr);

                    $item.addClass(sLayout.itemLoadedClass);
                  } else if (dataLazy.indexOf('vimeo') !== -1) {
                    $item.addClass(sLayout.itemLoadingClass);
                    var idVideo = dataLazy.substr(dataLazy.lastIndexOf('/') + 1, 9);

                    var _parameters = dataLazy.substring(dataLazy.lastIndexOf('/') + 11, dataLazy.length);

                    var _newParameters = '';
                    $.each({
                      title: 0,
                      api: 1,
                      byline: 0,
                      transparent: 0
                    }, function (k, v) {
                      if (_parameters.indexOf(k) == -1) _newParameters += '&' + k + '=' + v;
                    });
                    _parameters = !_parameters.length ? _newParameters.substr(1) : _parameters += _newParameters.substr(1);
                    if (_parameters.indexOf('autoplay=1') !== -1) _parameters = _parameters.replace('autoplay=1', '');
                    if (_parameters.indexOf('&&') !== -1) _parameters = _parameters.replace('&&', '');
                    dataLazy = 'https://player.vimeo.com/video/' + idVideo + '#' + _parameters;

                    _element.attr('src', dataLazy).removeAttr(settings.lazyAttr);

                    lazyTypes.script('vimeoplayer', 'https://player.vimeo.com/api/player.js', function () {
                      _tools.cleanClass($item, sLayout);

                      var player = new Vimeo.Player(_element);
                      player.play();
                    });
                  }
                } else {
                  // si el iframe es de YT
                  var theSrcIframe = _element.attr('src');

                  if (theSrcIframe.indexOf('youtu') !== -1) {
                    _element.get(0).contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
                  } else if (theSrcIframe.indexOf('vimeo') !== -1) {
                    var player = new Vimeo.Player(_element);
                    player.play();
                  }
                }
              },
              script: function script(id, theSrc, done) {
                if ($('#' + id).length) {
                  // ya se cargó el script
                  if (done !== undefined && typeof done == 'function') done();
                }

                var r = false,
                    s = document.createElement('script');
                s.type = 'text/javascript';
                s.src = theSrc;
                s.id = id;

                s.onload = s.onreadystatechange = function () {
                  if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true;
                    if (done !== undefined && typeof done == 'function') done();
                  }
                };

                document.body.appendChild(s);
              }
            };

            var typeLazy = lazyTypes[_element.prop('tagName').toLowerCase()];

            if (typeLazy !== undefined) typeLazy();
          });
        },
        log: function log(obj) {
          if (obj == undefined) {
            return _log.forEach(function (txt) {
              console.log(txt);
            });
          } // Types: error (err), warning (war), notification (not).


          var tipo, pro;

          switch (obj.type) {
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

          var currentdate = new Date();
          var datetime = currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds();
          var textComplete = datetime + ' | ' + tipo + ' : ' + obj.text;

          if (settings.log) {
            console[pro]('Great Slider [Logger] : ' + textComplete);
          } else {
            if (obj.required) console[pro]('Great Slider [Logger] : ' + textComplete);
          }

          _log.push(textComplete);
        },
        breakPoints: function breakPoints(_breakPoints, widthWindow) {
          var _objThis = this;

          var bkOptions = {},
              finalBp;
          Object.keys(_breakPoints).forEach(function (medida) {
            if (medida <= widthWindow) {
              $.extend(bkOptions, _breakPoints[medida]);
              finalBp = medida;
            }
          });
          var bkOptionsFinales = Object.keys(bkOptions);

          if (bkOptionsFinales.length) {
            if (breakPoint !== finalBp) {
              breakPoint = finalBp;
              bkOptions = $.extend({}, settingsBk, bkOptions); // verificamos si yá no es necesario el slider

              if (settings.autoDestroy) {
                var itemsExits = $existingItems.length;

                if (itemsExits <= bkOptions.items) {
                  this.log({
                    type: 'not',
                    text: 'El slider se destruye xq ya no es necesario, la cantidad de items (' + itemsExits + ') es la misma que la de items a mostrar (' + bkOptions.items + ').'
                  });
                  this.destroy();
                  return false;
                }
              } //


              _objThis.init(bkOptions);
            }
          } else {
            if (breakPoint !== 0) {
              breakPoint = 0;

              _objThis.init(settingsBk);
            }
          }
        },
        getActive: function getActive() {
          var $activeItem = $wrapperItems.find('> .' + sLayout.itemActiveClass);
          return {
            item: $activeItem,
            index: $activeItem.index() + 1
          };
        },
        goTo: function goTo(to, configs) {
          var _this5 = this;

          if (_this.hasClass(sLayout.transitionClass)) return false; // para evitar otro pase con uno yá en curso.

          var $getActive = this.getActive(),
              $activeItem = $getActive.item,
              activeItemIndex = $getActive.index - 1,
              itemToActive;

          if (typeof to == 'string') {
            // puede ser next o prev, veamos
            if (configs == undefined) configs = configsBk;

            if (to == 'next') {
              // vamos al siguiente item
              if (activeItemIndex == _items.length - 1) {
                // yá llegó al último
                itemToActive = configs.items - 1;
              } else {
                // si es que los items restantes son menores a los que se determinó por cada pase
                var leftItems = _items.length - (activeItemIndex + 1);
                itemToActive = leftItems < configs.slideBy ? activeItemIndex + leftItems : activeItemIndex + configs.slideBy;
              }
            } else {
              // es prev
              if (activeItemIndex == configs.items - 1) {
                itemToActive = _items.length - 1;
              } else {
                var _leftItems = activeItemIndex + 1 - configs.slideBy;

                itemToActive = _leftItems <= configs.slideBy ? configs.slideBy - 1 : activeItemIndex - configs.slideBy;
              }
            }
          } else if (typeof to == 'number') {
            // es un index real, (number)
            var relocation = configs,
                toIndexReal = to - 1;
            configs = configsBk; // verificaciónes lógicas

            if (to > _items.length) return this.log({
              type: 'err',
              text: 'No es posible ir a puesto de item mayor al numero de items disponibles.',
              required: true
            });

            if (relocation == undefined) {
              // si no es una relocalización mandada desde la construcción del ancho del wrapper.
              if (to == activeItemIndex + 1) this.log({
                type: 'not',
                text: 'Ya nos encontramos en ese puesto (' + to + ').',
                required: true
              });
            }

            if (configs.type == 'swipe') {
              if (toIndexReal < activeItemIndex && to - configs.slideBy < 0) {
                return this.log({
                  type: 'err',
                  text: 'No es posible desplazarce al puesto "' + to + '", debido a que faltarían items a mostrar en pantalla.',
                  required: true
                });
              }
            } //


            itemToActive = toIndexReal;
          } // Deteniendo reproducción en items que tienen elementos reproducibles (video, audio y iframes de youtube o vimeo)


          var $videos = $activeItem.find('video, audio');

          if ($videos.length) {
            $videos.each(function () {
              $(this).get(0).pause();
            });
          } // pausa a los videos de youtube


          var $iframes = $activeItem.find('iframe');

          if ($iframes.length) {
            $iframes.each(function () {
              var $iframeSrc = $(this).attr('src');

              if ($iframeSrc.indexOf('youtu') !== -1) {
                $(this).get(0).contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
              } else if ($iframeSrc.indexOf('vimeo') !== -1) {
                var player = new Vimeo.Player($(this));
                player.pause();
              }
            });
          }

          ; // El item a activar

          var $itemActivating = _items.eq(itemToActive),
              itemActiveClass = sLayout.itemActiveClass;

          $activeItem.removeClass(itemActiveClass);
          $itemActivating.addClass(itemActiveClass);

          _this.addClass(sLayout.transitionClass);

          var onStepStart = configs.onStepStart;
          if (onStepStart !== undefined) onStepStart($activeItem, $activeItem.index() + 1);

          if (configs.type == 'swipe') {
            var mLeft = 100 / configs.items * (itemToActive + 1) - 100;
            if (mLeft < 0) mLeft = 0;
            $wrapperItems.css('margin-left', '-' + mLeft + '%');
          } // Cargando los elements 'lazy'


          if (configs.lazyLoad) {
            var indexsToLoad = itemToActive;

            while (indexsToLoad > itemToActive - configs.items) {
              this.loadLazy(_items.eq(indexsToLoad));
              indexsToLoad--;
            }
          } // ejecutando evento onStepEnd


          setTimeout(function () {
            _this.removeClass(sLayout.transitionClass);

            var onStepEnd = configs.onStepEnd;
            if (onStepEnd !== undefined) onStepEnd($itemActivating, itemToActive + 1);

            if (!_this5.fullscreen('check')) {
              if (!configs.lazyLoad) autoHeight($itemActivating);
            }
          }, configs.navSpeed); // OnLlega al último XD

          if (itemToActive == nItems - 1) {
            var lastItem = settings.onLastItem;
            if (lastItem !== undefined) lastItem($itemActivating, itemToActive);
          }

          ; // Activando el Bullet correspondiente

          if (_this.hasClass(sLayout.builtClass)) {
            if (configs.bullets) this.bullets('active', configs);
          }
        },
        autoPlay: function autoPlay() {
          var _this6 = this;

          var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'play';
          var configs = arguments.length > 1 ? arguments[1] : undefined;
          if (configs == undefined) configs = configsBk;

          if (action == 'play') {
            if (gsIntervalSet !== undefined) return false; // por si se seteó el intervalo previamente

            gsIntervalSet = true;

            if (typeof gsInterval == 'undefined' || typeof gsInterval == 'number') {
              gsInterval = setInterval(function () {
                _this6.goTo('next');
              }, configs.autoplaySpeed);
            }

            var playAP = configs.onPlay;
            if (playAP !== undefined) playAP();
            return true;
          } else if (action == 'stop') {
            clearInterval(gsInterval);
            var stopAP = configs.onStop;
            if (stopAP !== undefined) stopAP();
            gsIntervalSet = undefined;
            return false;
          }
        },
        fullscreen: function fullscreen(configs, itemToGo) {
          var _this7 = this;

          var _objThis = this,
              $fsElement = _this.find('> .' + sLayout.fsButtonClass),
              lastItems; // funciones útiles


          var navByArrow = function navByArrow(event) {
            if (event.type == 'keyup') {
              switch (event.which) {
                case 37:
                case 40:
                  _this7.goTo('prev');

                  break;

                case 38:
                case 39:
                  _this7.goTo('next');

                  break;
              }
            }
            /*else if(event.type == 'mousewheel') {
            this.goTo((event.originalEvent.wheelDelta / 120 > 0) ? 'prev' : 'next');
            }*/
            // Navegación por flechas

          };

          var envOnFullScreen = function envOnFullScreen(event) {
            configs = configsBk;

            if (fullScreenApi.isFullScreen()) {
              // in
              if (_this.hasClass(sLayout.fsInClass)) {
                $(document).on('keyup', navByArrow);

                _this7.loadLazy(_this7.getActive().item); // cambiando a 1 items visibles


                var itemsCurrent = _this7.getItems();

                if (itemsCurrent !== 1) {
                  lastItems = itemsCurrent;

                  if (itemToGo !== undefined) {
                    _this7.items(configs.itemsInFs, itemToGo);
                  } else {
                    _this7.items(configs.itemsInFs);
                  }
                } // evento de entrada al FS


                var inFs = configs.onFullscreenIn;
                if (inFs !== undefined) inFs(); //
              }
            } else {
              // out
              if (_this.hasClass(sLayout.fsInClass)) {
                //volviendo a los items que tenía
                if (lastItems !== undefined) {
                  var _itemsCurrent = _this7.getItems();

                  if (_itemsCurrent !== lastItems) {
                    _this7.items(lastItems);

                    lastItems = undefined;
                  }
                } //


                $(document).off('keyup', navByArrow);
                setTimeout(function () {
                  //
                  if (configs.lazyLoad && configs.items == 1) {
                    var i = 0;

                    while (i <= nItems) {
                      var theItem = _items.eq(i);

                      if (theItem.hasClass(sLayout.itemLoadedClass)) _this7.loadLazy(theItem);
                      i++;
                    }

                    ;
                  }

                  if (!configs.lazyLoad && configs.autoHeight) autoHeight(_this7.getActive().item);
                }, 700); // para dar tiempo al navegador en la transición desde cuando se canceló el Fs y se completó
                //

                _this.removeClass(sLayout.fsInClass);

                $fsElement.removeClass(sLayout.fsInClass);
                itemToGo = undefined;
                $(document).off(fullScreenApi.fullScreenEventName, envOnFullScreen); // para evitar doble anidación
                // evento de salida de FS

                var outFs = configs.onFullscreenOut;
                if (outFs !== undefined) outFs();
              }
            } // ejecución de eventos

          }; // es la invocación del metodo desde una acción


          if (typeof configs == 'string') {
            if (fullScreenApi.supportsFullScreen) {
              var actionsFs = {
                in: function _in() {
                  if (!_objThis.fullscreen('check')) {
                    _this.addClass(sLayout.fsInClass);

                    $fsElement.addClass(sLayout.fsInClass);
                    fullScreenApi.requestFullScreen(_this.get(0));
                    $(document).on(fullScreenApi.fullScreenEventName, envOnFullScreen);
                  } else {
                    _objThis.log({
                      type: 'not',
                      text: 'Ya nos encontramos en fullscreen.',
                      required: true
                    });
                  }
                },
                out: function out() {
                  if (_objThis.fullscreen('check')) {
                    $fsElement.removeClass(sLayout.fsInClass);
                    fullScreenApi.cancelFullScreen(_this.get(0));
                    $(document).off(fullScreenApi.fullScreenEventName, envOnFullScreen);
                  } else {
                    _objThis.log({
                      type: 'not',
                      text: 'No nos encontramos en fullscreen.',
                      required: true
                    });
                  }
                },
                check: function check() {
                  return fullScreenApi.isFullScreen();
                }
              };
              var theFsAction = actionsFs[configs];
              return theFsAction !== undefined ? theFsAction() : this.log({
                type: 'not',
                text: 'la orden "' + configs + '" del metodo fullscreen no es valida.',
                required: true
              });
            } else {
              return this.log({
                type: 'war',
                text: 'El dispositivo actual no soporta Full Screen.',
                required: true
              });
            }

            return false; // para asegurarnos de no seguir con el flujo normal
          } // no es invocación del metodo con orden, es el flujo normal


          if (configs.fullscreen) {
            if (!fullScreenApi.supportsFullScreen) return this.log({
              type: 'war',
              text: 'El dispositivo actual no soporta Full Screen.'
            }); // construcción del boton

            if (!$fsElement.length) {
              _this.append('<' + sLayout.fsButtonTag + ' class="' + sLayout.fsButtonClass + (sLayout.fsButtonDefaultStyles ? ' gs-style-btnfs' : '') + '"></' + sLayout.fsButtonTag + '>');

              $fsElement = _this.find(sLayout.fsButton);
            } else {
              if ($fsElement.hasClass(displayNodeClass)) $fsElement.removeClass(displayNodeClass);
            }
          } else {
            if (!$fsElement.hasClass(displayNodeClass)) $fsElement.addClass(displayNodeClass);
            return false;
          } // Adjuntado evento click al boton FS


          $fsElement = _this.find('> .' + sLayout.fsButtonClass); // volviendolo a declarar por su creación

          if ($fsElement.hasClass(attachedClass)) return false; // ya se adjunto el evento click

          $fsElement.addClass(attachedClass).on('click', function (e) {
            e.preventDefault();

            _this7.fullscreen(!_this7.fullscreen('check') ? 'in' : 'out');
          });
        },
        destroy: function destroy() {
          var _objThis = this;

          if (!_this.hasClass(sLayout.builtClass)) return false; // devolviendo items como hijos directos de su wrapper inicial

          var htmlPure = '';

          _this.find("> .".concat(sLayout.containerItemsClass, " > .").concat(sLayout.wrapperItemsClass, " > .").concat(sLayout.itemClass)).each(function () {
            htmlPure += $(this).find("> .".concat(sLayout.itemWrapperClass)).html();
          });

          _this.html(htmlPure).removeClass(sLayout.builtClass);

          if (_this.attr('id').indexOf('gs-slider-') !== -1) _this.removeAttr('id'); // destruyendo navegación, si existe.

          var $theNav = _this.find('> .' + sLayout.containerNavsClass);

          if ($theNav.length) $theNav.remove(); // cargando elementos lazy, si existen

          if (settings.lazyLoad && settings.lazyLoadOnDestroy) {
            var $itemsToLoad = _this.find('.' + settings.lazyClass);

            if ($itemsToLoad.length) {
              $itemsToLoad.each(function () {
                _objThis.loadLazy($(this));
              });
            }
          } // eliminando el estilo inline 'height' si se determinó autoHeight


          var $wrapperUl = _this.find("> .".concat(sLayout.containerItemsClass, " > .").concat(sLayout.wrapperItemsClass));

          if ($wrapperUl.attr('style') !== undefined) $wrapperUl.removeAttr('style'); //

          var eventDestroyed = configsBk.onDestroyed;
          if (eventDestroyed !== undefined) eventDestroyed(configsBk);
        },
        touch: function touch(estado) {
          var _this8 = this;

          var $theContainerItems = _this.find('> .' + sLayout.containerItemsClass),
              sliderTouchStart,
              sliderTouchMove;

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

            sliderTouchStart = function sliderTouchStart(evt) {
              xDown = evt.originalEvent.touches[0].clientX;
              yDown = evt.originalEvent.touches[0].clientY;
            };

            sliderTouchMove = function sliderTouchMove(evt) {
              if (!xDown || !yDown) return false;
              var xUp = evt.originalEvent.touches[0].clientX;
              var yUp = evt.originalEvent.touches[0].clientY;
              var xDiff = xDown - xUp;
              var yDiff = yDown - yUp;

              if (Math.abs(xDiff) > Math.abs(yDiff)) {
                evt.preventDefault();
                xDiff > 0 ? _this8.goTo('next') : _this8.goTo('prev');
              }

              xDown = null;
              yDown = null;
            }; //finalmente anidando el touch


            $theContainerItems.on({
              touchstart: sliderTouchStart,
              touchmove: sliderTouchMove
            }).addClass(settings.touchClass);
          }
        } // Inicializando

      };
      actions.init(settings); // preparando el return

      var theReturn = new Returns(actions);

      if (selections == 1) {
        returns = theReturn;
      } else {
        returns.push(theReturn);
      } // api al slider


      window.gs['slider'][$idThis] = returns;
    });
    return returns;
  };
})(jQuery);