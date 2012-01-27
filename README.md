# AdaptiveText.js

## Did you ever wished you had [FitText.js](http://fittextjs.com/) with media queries?

#### Of course there are solutions to test *real* [media queries with javascript](https://github.com/paulirish/matchMedia.js/), but testing them out tens or hundreds of times while we resize is damn slow and not a good thing to do.

### Usage:

	$('.logo h1').adaptiveText( ((object | array), boolean) | compressor);

	// Call without arguments to resize at all screen sizes.
	$('.logo h1').adaptiveText();

	// Just the compressor
	$('.logo h1').adaptiveText(1.2);

	// With a single set of options
	$('.logo h1').adaptiveText({
    	'minWidth': '1px', // Stings or numbers. Will be taken as pixels
    	'maxWidth': 768,
    	'minFontSize': '23px',
    	'maxFontSize': '80px',
    	'compressor': .5
	});

	// Or several
	$('.logo h1').adaptiveText([
	{
	    'minWidth': 1,
	    'maxWidth': 768,
	    'minFontSize': 23,
	    'maxFontSize': 80,
	    'compressor': .5},
  	{
	    'minWidth': 769,
	    'maxWidth': 1024,
	    'compressor': .55}
	]);

	// If you set just the starting or the ending width, be sure to use only one set of options!
	$('.logo h1').adaptiveText({
	    'minWidth': 500,
	});

	// You can also enable debugging. It will write the resize status in the console log. Beware it is a bit intrusive.
	$(myElement).adaptiveText([], true);


Forks are very appretiated. My javascript is far from good or elegant. If you are a Js Ninja, please don't hesitate.
