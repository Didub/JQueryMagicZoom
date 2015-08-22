/* Copyright (c) 2015 Rodrigo Jimenez
* Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
*
* Version: 1.0.0
* Requires jQuery 1.11.1 or later
*/
(function ($) {
	$.fn.magicZoom = function( options ) {

		// plugin options
		var settings = $.extend({
			// defaults
			cursor: "crosshair",
			allowzoom: false,
			minzoom: 2,
			maxzoom: 8
		},options);

		// get the reference to the attached image
		var image = this;
		//console.log("Plugin attached to: " + image.attr("id"));

		// get the image url
		var imageUrl = image.attr("src");

		/*
		* image with and height properties
		*/
		var imageWidth, imageHeight;

		/*
		* when allowzoom is enabled we need to adjust event.pageX and Y
		* so they scale as the image scale
		*/
		var multiplicator;

		/*
		* when scroll is performed we adjust the image scale
		*/
		var scrolled = settings.minzoom;

		/*
		* plugin element is wrap with a div that contains
		* all plugin elements.
		*/
		var wrapper;

		/*
		* we need to define an offset for e.pageX and Y events are relative to the image
		*/
		var offset;

		/*
		* element contains the zoom image
		*/
		var magiczoomZoom;

		/*
		* css backgroundPosition: positionX and Y
		*/
		var positionX;
		var positionY;

		/*
		* Plugin main methods
		*/
		var plugin = {
			/*
			* init variables that we are going to need
			*/
			init: function() {
				// image size
				imageWidth = image.width();
				imageHeight = image.height();
			},
			/*
			* create the elements needed and style them
			*/
			styleElements: function(){
				var randomId = plugin.generateRandomId();
				// check if randomId magiczoom elements exist in DOM
				if($("#magiczoom-wrapper" + randomId + "").length >= 1 || $("#magiczoom-zoom" + randomId + "").length >= 1){
					//console.log("Bad luck, random ids repeated");
					// element exists try a new randomId
					randomId = plugin.generateRandomId();
				}

				// wrap our plugin
				image.wrap("<div id='magiczoom-wrapper" + randomId + "'></div>");
				wrapper = $("#magiczoom-wrapper" + randomId + "");

				// need offsets so the pageX and Y events are relative to the image
				offset = wrapper.offset();

				// style the wrapper
				wrapper.css({
					position: "relative",
					cursor: settings.cursor,
					display: "-moz-inline-stack",
					display: "inline-block",
					verticalAlign: "top",
					maxWidth: "100%",
					zoom: 1
				});

				// append the zoom div to the wrapper
				wrapper.append("<div id='magiczoom-zoom" + randomId + "'></div>");
				magiczoomZoom = $("#magiczoom-zoom" + randomId + "");

				// style the zoom
				magiczoomZoom.css({
					position: "absolute",
					top: "0",
					width: "100%",
					height: "100%",
					backgroundImage: "url(" + imageUrl + ")",
					backgroundSize: imageWidth * 2 + "px " + imageHeight * 2 + "px",
					backgroundRepeat: "no-repeat",
					display: "none"
				});

				if(image.hasClass("img-circle")){
					magiczoomZoom.addClass("img-circle");
				}

			},
			/*
			* Plugin Events
			*/
			setupEvents: function(){
				/*
				* Wrapper basic mouse events
				*/
				wrapper.on({
					// increment the scale when the mouse enter the plugin
					mouseenter: function(e){
						// need offsets so the pageX and Y events are relative to the image
						offset = wrapper.offset();
						scrolled = settings.minzoom;
						multiplicator = settings.minzoom - 1;
						plugin.zoomImage(e, scrolled);
						magiczoomZoom.show();
					},
					// hide the zoom image
					mouseleave: function(e){
						// hide the zoom
						magiczoomZoom.hide();
					},
					// make the image follow the cursor so the user can see
					// all the zoom image
					mousemove: function(e){
						plugin.moveImage(e);
					},
					touchstart: function(e){
						e.preventDefault();
						// need offsets so the pageX and Y events are relative to the image
						offset = wrapper.offset();
						scrolled = settings.minzoom;
						multiplicator = settings.minzoom - 1;
						plugin.zoomImage(e, scrolled);
						magiczoomZoom.show();
					},
					touchend: function(e){
						// hide the zoom
						magiczoomZoom.hide();
					},
					touchmove: function(e){
						e.preventDefault();
						var coordX = e.originalEvent.touches[0].pageX;
						var coordY = e.originalEvent.touches[0].pageY;
						// if finger is out of magiczoomZoom hide it.
						// this prevents that if the finger gets out of the div the image
						// continues changing his backgroundPosition and looks ugly
						if(coordX <= 0 + offset.left || coordX >= imageWidth + offset.left ||
							coordY <= 0 + offset.top || coordY >= imageHeight + offset.top){
							magiczoomZoom.hide();
						}else{
							plugin.moveImage(e.originalEvent.touches[0]);
						}
					},
					touchleave: function(e){
						// hide the zoom
						magiczoomZoom.hide();
					},
					mousewheel: function(e){
						if(settings.allowzoom == true){
							// prevent body from scrolling
							e.preventDefault();
							// scrolling down
							if(e.originalEvent.wheelDelta /120 > 0) {
								if(scrolled != settings.maxzoom){
									multiplicator++;
									scrolled++;
									plugin.zoomImage(e, scrolled);
								}
							}else{
								// scrolling up
								if(scrolled != settings.minzoom){
									multiplicator--;
									scrolled--;
									plugin.zoomImage(e, scrolled);
								}
							}
						}
					},
					/*
					* Firefox especific mouse scroll
					*/
					DOMMouseScroll: function(e){
						// prevent body from scrolling
						e.preventDefault();
						if(settings.allowzoom == true){
							// scrolling down
							if(e.originalEvent.detail < 0) {
								if(scrolled != settings.maxzoom){
									multiplicator++;
									scrolled++;
									plugin.zoomImage(e.originalEvent, scrolled);
								}
							}else{
								// scrolling up
								if(scrolled != settings.minzoom){
									multiplicator--;
									scrolled--;
									plugin.zoomImage(e.originalEvent, scrolled);
								}
							}
						}
					}
				});
			},
			// make the zoom image follow the cursor
			// so user can move the mouse and see all the image
		  moveImage: function(e) {
				positionX = (-e.pageX * multiplicator) + (offset.left * multiplicator);
				positionY = (-e.pageY * multiplicator) + (offset.top * multiplicator);

		  	magiczoomZoom.css({
					backgroundPosition: positionX + "px " + positionY + "px"
				});
		  },
			// scale the image on mouse wheel event
		  zoomImage: function(e, scrolled){
		  	magiczoomZoom.css({
					backgroundSize: imageWidth * scrolled + "px " + imageHeight * scrolled + "px"
				});

				// while scrolling keep the focus on the mouse pointer
				plugin.moveImage(e);
		  },
			generateRandomId: function(){
			  var text = "";
			  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			  for( var i=0; i < 6; i++ ){
			    text += possible.charAt(Math.floor(Math.random() * possible.length));
				}
				return text;
			}

		};

		/*
		* Document function events
		*/
		var doc = {
			onLoad: function() {
				// init plugin
				plugin.init();
				// style the elements
				plugin.styleElements();
				// setup events
				plugin.setupEvents();
			},
			onResize: function() {
				// on resize image change the size, we have to recalculate it
				plugin.init();
			}
		};

		// Run the plugin when the page is fully loaded including graphics.
		$( window ).load(
			// load the plugin
			doc.onLoad
		);

		// On window resize recalculate the image size
		$( window ).resize(
			doc.onResize
		);

	};
}(jQuery));
