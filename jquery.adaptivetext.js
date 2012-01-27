/*global jQuery */
/*!    
* AdaptiveText.js 1.0
*
* Copyright (c) 2012 Victor Gonzalez, http://victtor.com
* 
* Permission is hereby granted, free of charge, to any
* person obtaining a copy of this software and associated
* documentation files (the "Software"), to deal in the
* Software without restriction, including without limitation
* the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the
* Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice
* shall be included in all copies or substantial portions of
* the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
* KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
* WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
* PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
* OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
* OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* Date: Thu Jan 17 19:43:00 2012 -0600
*/

(function($) {

    $.fn.adaptiveText = function(options, debug) {

        var settings = [],
            isSingle = false,
            isReset = false,
            isNotFound = false,
            positiveInfinity = Number.POSITIVE_INFINITY,
            negativeInfinity = Number.NEGATIVE_INFINITY,
            intRegex = /^\d+$/,
            floatRegex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/,


            isCurrentWidth = function(max, min) {
                if ($(window).width() <= max && $(window).width() >= min) {
                    return true;
                } else {
                    return false;
                }
                debugMessage({
                    currentWidth: window.innerWidth,
                    maxWidth: max,
                    minWidth: min
                });
            },
            
            //http://stackoverflow.com/a/8809472
            generateUUID = function(){
			    var d = new Date().getTime();
			    var uuid = 'adaptiveText-xxxxx'.replace(/[xy]/g, function(c) {
			        var r = (d + Math.random()*16)%16 | 0;
			        d = d/16 | 0;
			        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
			    });
			    return uuid;
			},

            isset = function(a) {
                if (typeof a !== "undefined" && a !== null) {
                    return true;
                } else {
                    return false;
                }
            },


            debugMessage = function(message) {
                if (debug === true) {
                    console.log(message);
                }
            },


            // Resize items based on the object width divided by the compressor * 10
            resize = function(elem, obj) {
                debugMessage('RESIZE');
                elem.css('font-size', Math.max(Math.min(elem.width() / (obj.compressor * 10), parseFloat(obj.maxFontSize)), parseFloat(obj.minFontSize)));
            },


            setValues = function(readfrom) {
                settings.compressor =
                readfrom.compressor || 1;

                settings.minWidth =
                readfrom.minWidth || negativeInfinity;

                settings.maxWidth =
                readfrom.maxWidth || positiveInfinity;

                settings.minFontSize =
                readfrom.minFontSize || negativeInfinity;

                settings.maxFontSize =
                readfrom.maxFontSize || positiveInfinity;
                debugMessage(['SET VALUES', settings]);
            },


            // Loop though every width object and save to settings[] the one that matches our screen width
            setAndResize = function(elem) {

                // If options was only set as the compressor
                if (intRegex.test(options) || floatRegex.test(options)) {
                    setValues({
                        'compressor': options
                    });
                    resize(elem, settings);
                }

                // Was called without options
                if (!options) {
                    debugMessage('NO SETTINGS');
                    // Empty array will do the trick
                    setValues([]);
                    resize(elem, settings);
                }

                // Called with options
                else {
                    $.each(options, function(i) {
                        // Set values for all multiples and first single only
                        if (isSingle === true) {
                            debugMessage('FIRST SINGLE');
                            setValues(this);
                            resize(elem, settings);
                            return false;
                        }

                        // If we don't use both widths in the object, we must be certain it is the only one. Is single?
                        else if (!isset(this.minWidth) && !isset(this.maxWidth)) {
                            debugMessage('SET SINGLE');
                            setValues(this);
                            resize(elem, settings);
                            isSingle = true;
                            // Continue to check for multiple objects
                            return true;
                        }

                        // Multiple values
                        else {
                            debugMessage('SET MULTIPLE');
                            setValues(this);
                            if (isCurrentWidth(settings.maxWidth, settings.minWidth)) {
                                debugMessage('FOUND!');
                                isNotFound = false;
                                resize(elem, settings);
                                return false;
                            }

                            // Keep searching
                            else {
                                // If it is the last item, we set to default
                                if (i == options.length - 1) {
                                    debugMessage('NOT FOUND');
                                    isNotFound = true;
                                    // Empty array will do the trick
                                    setValues([]);
                                    resize(elem, settings);
                                    return false;
                                }
                                else {
                                    debugMessage('KEEP SEARCHING');
                                    return true;
                                }
                            }
                        }

                        // Reset single to cached width
                        if (isSingle === true && isReset === false) {
                            debugMessage('SINGLE RESET');
                            isReset = true;
                            return false;
                        }
                    });
                }
            },


            keepFixing = function(elem) {

                // Set and resize once.
                debugMessage('SET ONCE');
                setAndResize(elem, true);

                // Then keep resizing
                $(window).resize(function() {

                    if (isReset === false) {

                        // Keep searching if we have options that are not yet true
                        if (isNotFound === true) {
                            debugMessage('IS NOT FOUND');
                            setAndResize(elem);
                            return false;
                        }

                        // Settings width is the current width
                        if (isCurrentWidth(settings.maxWidth, settings.minWidth)) {
                            debugMessage('YES CURRENT WIDTH');
                            resize(elem, settings);
                        }

                        // Settings width is not the current width
                        else {
                            debugMessage('NOT CURRENT WIDTH', settings.maxWidth, settings.minWidth, window.innerWidth, isReset);
                            setAndResize(elem);
                        }
                    }

                });

                // Set and resize again if we rotate
                window.onorientationchange = function() {
                    if (typeof window.onorientationchange != 'undefined') {
                        debugMessage('ROTATE');
                        setAndResize(elem);
                    }
                };

            };

        // Grand finale
        return this.each(function() {
            keepFixing($(this));
        });

    };

})(jQuery);