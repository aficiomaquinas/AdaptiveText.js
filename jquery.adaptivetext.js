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

        var settings = {},
            isSingle = false,
            isNotFound = false,
            positiveInfinity = Number.POSITIVE_INFINITY,
            negativeInfinity = Number.NEGATIVE_INFINITY,
            intRegex = /^\d+$/,
            floatRegex = /^((\d+(\.\d *)?)|((\d*\.)?\d+))$/,
            thisUUID,
            
            defaults = {
                'compressor': 1,
                'minWidth': negativeInfinity,
                'maxWidth': positiveInfinity,
                'minFontSize': negativeInfinity,
                'maxFontSize': positiveInfinity
            },


            isCurrentWidth = function(max, min) {
                if ($(window).width() <= parseFloat(max) && $(window).width() >= parseFloat(min)) {
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
            generateUUID = function() {
                var d = new Date().getTime();
                var uuid = 'adaptive-xxxxx'.replace(/[xy]/g, function(c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = d / 16 | 0;
                    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
                });
                if ($('.' + uuid).lenght) {
                    console.log('MOTHEREFFING COLLISION!!!');
                    generateUUID();
                } else {
                    return uuid;
                }
            },
            
            
            reset = function(elem) {
            	elem.removeClass(thisUUID).removeAttr('style');
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
                if (!thisUUID) {
                    thisUUID = generateUUID();
                }
                elem.addClass(thisUUID);
                $('.' + thisUUID).css('font-size', Math.max(Math.min(elem.width() / (obj.compressor * 10), parseFloat(obj.maxFontSize)), parseFloat(obj.minFontSize)));
                debugMessage('RESIZE');
            },

            
            // Duplicate defaults and then overwrite with the user values
            setValues = function(readfrom) {
                settings = {};
                $.extend(true, settings, defaults);
                for (var i in readfrom) {
                    settings[i] = readfrom[i];
                }
                debugMessage(['SET VALUES', settings]);
            },
            
            
            // We need to deliver an array, if it is an object, $.each will not work
            workingArray = function(a) {
                if ($.isArray(a)) {
                	return a;
                }
                else if (typeof a == 'object'){
                	return [a];
                }
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
                else if (!options) {
                    debugMessage('NO SETTINGS');
                    // Empty array will do the trick
                    setValues([]);
                    resize(elem, settings);
                }
                
                // Called with options
                else {
                    $.each(workingArray(options), function(i) {
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

                        else {
                            setValues(this);

                            if (isCurrentWidth(settings.maxWidth, settings.minWidth)) {
                                debugMessage('FOUND!');
                                isNotFound = false;
                                resize(elem, settings);
                                return false;
                            }

                            // Multiple values, Keep searching
                            else {
                                // If it is the last item, we set to default
                                if (i == options.length - 1) {
                                    debugMessage('NOT FOUND');
                                    isNotFound = true;
                                    reset(elem);
                                    return false;
                                }
                                else {
                                    debugMessage('KEEP SEARCHING');
                                    return true;
                                }
                            }
                        }

                    });
                }
            },


            keepFixing = function(elem) {

                // Set and resize once.
                setAndResize(elem);

                // Then keep resizing
                $(window).resize(function() {


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
                            debugMessage('NOT CURRENT WIDTH', settings.maxWidth, settings.minWidth, window.innerWidth);
                            reset(elem);
                            setAndResize(elem);
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