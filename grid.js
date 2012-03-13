
/* 
   jsgrid
*/

 overlay = (function () {

  
  var settings = {
    wrapper: 'grid-wrapper', // id
    wrapperStyles: {
      width: "100%",
      position: "absolute",
      top: "0pt",
      left: "0pt",
      zIndex: 1000,
      backgroundPosition: "top left",
      backgroundColor: "green",
      backgroundRepeat: "no-repeat",
      // backgroundSize: '100%', // scale background
      backgroundSize: "auto",
      opacity: 0.5
    },
    opacityIncrement: 0.1
  };

  var elem;

  function init() {

    var s = settings;

    initKeyHandler();

    elem = createWrapper(); // our global dom object

    // enable it?
    if(getLocal('grid-state') == '1') { // local storage always stores strings
        enableOverlay();
    }

    // load saved bg image into it?
    if (getLocal('grid-img')) {
          setOverlayImage(getLocal('grid-img'));
    };                  
  };

  function initKeyHandler(){
    var s = settings;

    // set keycodes
    var toggleKeys = [59, 186, 90]; // ;
    var downOpacityKeys = [219, 91, 123]; // [
    var upOpacityKeys = [221, 93, 125]; // ]

    document.onkeydown = function (e){
      if (e.ctrlKey) {
        if (toggleKeys.indexOf(e.keyCode) != -1) {
          toggleOverlay();
          return;
        }

        var currOpacity = parseFloat(elem.style.opacity);

        if (downOpacityKeys.indexOf(e.keyCode) != -1) {
          var newOpacity = currOpacity - s.opacityIncrement;
          if (newOpacity < (0 + s.opacityIncrement)) {
            newOpacity = 0;
          }

          // disable overlay when we get to 0
          if (newOpacity == 0) {
            disableOverlay();
          } else if (getLocal('grid-state') == '0'){
            enableOverlay();
          } else {      
              setOpacity(newOpacity);
          }

          return;
        }

        if (upOpacityKeys.indexOf(e.keyCode) != -1) {
          var newOpacity = currOpacity + s.opacityIncrement;

          if (getLocal('grid-state') == '0') {  // if disabled, enable overlay
              enableOverlay();
          } else if (newOpacity < 1) { // turn opacity up
              setOpacity(newOpacity);
          } else {
            // round opacity up to 1
            setOpacity(1);
          }

          return;
        }
      }
    };
  }

  function createWrapper(){
    var s = settings;
    var wrapper;
    
    // create wrapper from scratch
    wrapper = document.createElement('div');
    wrapper.setAttribute('id', s.wrapper);

    // apply some styles
    for (var property in s.wrapperStyles) {
      wrapper.style[property] = s.wrapperStyles[property]
    }

    // make an attempt at getting the document height
    var body = document.body,
    html = document.documentElement;
    
    var height = Math.max( body.scrollHeight, body.offsetHeight, 
                 html.clientHeight, html.scrollHeight, html.offsetHeight );

    wrapper.style.height = height + 'px';

    // check for opacity
    if (getLocal('grid-opacity')) {
      wrapper.style.opacity = getLocal('grid-opacity');
    };
    
    // get dom reference to element (todo: check this is actually necessary.  Can we use the original version?) 
    wrapper.addEventListener('dragover', handleDragOver, false);
    wrapper.addEventListener('drop', handleFileSelect, false);
    wrapper.addEventListener('dragleave', handleDragLeave, false);

    return wrapper;
  };

  function setOpacity(newOpacity){
    setLocal('grid-opacity', newOpacity);
    elem.style.opacity = newOpacity;
  }

  /* 
   * toggle overlay based on localStorage gridstate
   */
  function toggleOverlay(){
    getLocal('grid-state') == '1' ? disableOverlay() : enableOverlay() ;
  };

  // detach from dom
  function disableOverlay(){
    console.log('disabling overlay');
    if (elem && elem.parentNode) {
      setLocal('grid-state', '0');
      elem.parentNode.removeChild(elem);
    }
  };

  // attach to dom
  function enableOverlay(){
    var s = settings;

    console.log('enabling overlay');
    if (!document.getElementById(s.wrapper)) {
      setLocal('grid-state', '1');

      if (parseFloat(getLocal('grid-opacity')) < (0 + s.opacityIncrement)) {
        setLocal('grid-opacity', s.opacityIncrement);
      }

      document.body.appendChild(elem);
    }
  };

  // either remove the overlay or give it a new image
  function setOverlayImage(imageData){
    if (!imageData) {
      elem.style.backgroundImage = 'none';
      elem.style.backgroundColor = 'green';
    } else {
      setLocal('grid-img', imageData);
      elem.style.backgroundImage = 'url('+imageData+')';
      elem.style.backgroundColor = 'transparent';
    }
  }


  function handleFileSelect(evt) {
console.log('triggered drop');
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.
    var reader = new FileReader();

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          setOverlayImage(e.target.result);
        };
      })(f);

      // Read in the image file as a data URL. (triggers onload)
      reader.readAsDataURL(f);
    }
  };

  function handleDragOver(evt) {
console.log('triggered dragover');
    setOverlayImage(null); // leaves a solid coloured background to indicate drop zone

    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  };

  // triggered when dragover is cancelled
  function handleDragLeave(evt){
console.log('triggered dragleave');

    // check if need to stopPropogation or preventDefault

    // replace old image
    setOverlayImage(getLocal('grid-img'));
  };
  
  // localStorage wrapper
  function setLocal(key, data) {
    return localStorage.setItem(key, data);
  };

  // check this
  function getLocal(key) {
    var rtn;
    if (rtn = localStorage.getItem(key)) {
      return rtn;
    } else {
      return false;
    }
  };

  return {
    init : init
  };


})();

overlay.init();