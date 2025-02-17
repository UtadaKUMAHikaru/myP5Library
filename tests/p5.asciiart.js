/*****************************************************************************\
      _____    __________________ .___.___     _____ _____________________
     /  _  \  /   _____/\_   ___ \|   |   |   /  _  \\______   \__    ___/
    /  /_\  \ \_____  \ /    \  \/|   |   |  /  /_\  \|       _/ |    |   
   /    |    \/        \\     \___|   |   | /    |    \    |   \ |    |   
   \____|__  /_______  / \______  /___|___| \____|__  /____|_  / |____|   
           \/        \/         \/                  \/       \/           
           
***************************   A S C I I   A R T   *****************************
*******************************************************************************

  p5.asciiart 0.3.00a by Paweł Janicki, 2017-2019
    https://tetoki.eu/asciiart | https://paweljanicki.jp

*******************************************************************************

  ASCIIART by Paweł Janicki is licensed under a Creative Commons
  Attribution-ShareAlike 4.0 International License
  (http://creativecommons.org/licenses/by-sa/4.0/). Based on a work at:
  https://tetoki.eu.

*******************************************************************************

  ASCII art is a graphic design technique that uses computers for presentation
  and consists of pictures pieced together from the printable characters
  defined by the ASCII Standard. Most examples of ASCII art require a
  fixed-width font.

  There is also a slightly more technically advanced ASCII art mutation called
  ANSI art. ANSI art is a computer art form that was widely used at one time on
  BBSes. It is similar to ASCII art, but constructed from a larger set of 256
  letters, numbers, and symbols — all codes found in IBM code page 437, often
  referred to as extended ASCII and used in MS-DOS and Unix environments. ANSI
  art also contains special ANSI escape sequences that color text with the 16
  foreground and 8 background colours offered by ANSI.SYS, an MS-DOS device
  driver loosely based upon the ANSI X3.64 standard for text terminals. Some
  ANSI artists take advantage of the cursor control sequences within ANSI X3.64
  in order to create animations, commonly referred to as ANSImations - however,
  there are also examples of ASCII art using animation.

  ASCII art technique is widely used by artists, hobbysts, hackers. Especially
  interesting example of use and creative development of the ASCII art are
  works created by the "ASCII Art Ensemble" group. The group, formed by Walter
  van der Cruijsen, Luka Frelih, Vuk Cosic, was founded in 1998. Members of
  the "ASCII Art Ensemble" created a software to "code" moving images into
  animated (sequential) ASCII art pieces. Most recognizable work by the group
  is "Deep ASCII" - an ASCII version of the famous pornographic film "Deep
  Throat" from 1972.

  ASCII art is also a descendant of the concrete and vsual poetry and so called
  "typewriter art": a pre-computer technique of creating images from characters
  available in typewriters (the first known piece of typewriter art — an image
  of a butterfly composed of brackets, dashes, slashes, and an asterisk, made
  by Flora Stacey, a British secretary, in 1898 [https://bit.ly/2t5IC1N]).

\*****************************************************************************/


/*
  Main AsciiArt pseudoclass.

  The class constructor can be called with one, two, three or four parameters:
    new AsciiArt(_sketch);
    new AsciiArt(_sketch, _fontName);
    new AsciiArt(_sketch, _fontName, _fontSize);
    new AsciiArt(_sketch, _fontName, _fontSize, _textStyle);
*/
// 一个AsciiArt的伪类，它是用来生成文本图形的。它的构造函数可以接受一个到四个参数，分别是_sketch, _fontName, _fontSize, _textStyle。这些参数决定了文本图形的外观和风格。代码中的私有变量存储了关于父级sketch的名称，字体的大小和样式的信息，这些信息用来创建一个按照字符占用面积大小排序的表格，这个表格用来将较亮的像素对应到较大的字符，从而形成文本图形
p5.prototype.AsciiArt = function(_sketch, _fontName, _fontSize, _textStyle) {
  /*
    "Private" variables storing information about the parent sketch name, size
    and style of the font used to create the table containing glyphs sorted by
    size (by default characters occupying a larger area will be assigned to
    lighter pixels).
  */
  this.__sketch    = _sketch;
  this.__fontName  = 'monospace';
  this.__fontSize  = 24;
  this.__textStyle = this.__sketch.NORMAL;
  /*
    "Private" instance of the p5.Graphics. It will be used to sort glyphs, and
    - later - as a buffer of the image converted to the ASCII art.
  */
//  创建私有的 p5.Graphics 实例
// 这里 this.__graphics 是 p5.Graphics 对象的实例，用作内部缓冲区。p5.Graphics 是 p5.js 中用于创建和操作图形的对象。createGraphics(10, 10) 则创建了一个10x10像素的图形区域。在 ASCII 艺术转换过程中，这个图形区域用于排序字符，并最终作为图像转换为 ASCII 艺术的缓冲区。
  this.__graphics = this.__sketch.createGraphics(10, 10);
  /*
    We can determine what scope of the ASCII code table we will use.
  */
//  确定 ASCII 码范围
// 这里 this.__range 定义了将用于生成 ASCII 艺术的字符的 ASCII 码范围。ASCII 表中的 32 至 126 范围包含了大部分标准键盘字符，从空格到波浪号。这个范围内的每个字符都有不同的“权重”或密度，适用于不同的灰度级别。
  this.__range = {min: 32, max: 126};
  /*
    "Private" array containing set of glyphs sorted by "weight".
  */
//  创建权重表
// this.__weightTable 是一个数组，用于存储根据“权重”或“密度”排序的字符集。在 ASCII 艺术中，字符的选择取决于它们表示的灰度级别。权重表就是用来根据像素的亮度选择相应的字符。
  this.__weightTable = [];
  /*
    If this flag is set to "true". AsciiArt will call loadPixels and
    updatePixels functions for processed images. It's a "private" variable.
  */
//  自动像素数据传输标志
// 这是一个布尔值标志，用来决定是否自动调用 loadPixels 和 updatePixels 函数处理图像。这两个函数分别用于读取和更新画布的像素数据。当处理图像转换为 ASCII 时，可能需要读取图像的像素数据，然后根据像素的亮度等信息来选择对应的字符。设置这个标志为 true，表示在 ASCII 转换过程中，将自动进行这些像素操作。
  this.__automaticPixelsDataTransferFlag = true;
  /*
    When creating the ASCII art composition by default characters occupying a
    larger area will be assigned to lighter pixels, but we can invert this
    behaviour if we want to.
  */
//  定义一个属性，用于控制字符和像素的亮度对应关系。默认情况下，占用面积较大的字符会对应较亮的像素，但是如果我们想要反转这种行为，就可以把这个属性设为true。
  this.invertBrightnessFlag = false;
  /*
    Here we are handling all four variants of the pseudoclass constructor.
  */
//  根据构造函数的参数个数，给类的实例赋予一个私有属性__fontName，用于存储字体的名称。如果参数个数大于1，说明传入了一个字体名称，就把它赋值给__fontName。
  if(arguments.length > 1) this.__fontName = _fontName;
  if(arguments.length > 2) {
    if(!isNaN(_fontSize)) {
      _fontSize = Math.floor(Math.abs(_fontSize));
      if(_fontSize > 5) this.__fontSize = _fontSize;
    }
  }
  if(arguments.length > 3) this.__textStyle = _textStyle;
  /*
    Now it's time to run the method that sorts the glyphs.
  */
//  创建权重表
// createWeightTable() 函数被调用。这个函数负责创建一个权重表，权重表是根据字符的视觉密度（或称为权重）排序的字符集。在ASCII艺术中，不同的字符根据它们的视觉密度（即在视觉上看起来有多“重”或多“密集”）被用来代表图像中不同的灰度级别。这个函数就是负责构建这样一个根据视觉密度排序的字符集合，以便后续转换图像时使用。
  this.createWeightTable();
}

// p5js bug (?) workaround
// 调整图形大小的方法
p5.prototype.AsciiArt.prototype.resizeGraphicsWorkaround = function(_g, _w, _h) {
  // 这里定义了一个 resizeGraphicsWorkaround 函数，这是一个工作方法，用于调整 p5.Graphics 对象 _g 的大小。这种需要可能是由于 p5.js 的某些限制或bug，需要手动调整画布尺寸。让我们看看这个方法具体做了什么：
//     如果 _g（即 p5.Graphics 对象）是空的，则创建一个新的图形并设置其像素密度。
// 否则，直接调整 _g 的宽度(_g.width)和高度(_g.height)以及其HTML元素(_g.elt)的宽度和高度。
// 最后设置HTML元素的样式宽度和高度。这涉及到直接修改DOM元素的样式，确保画布的显示大小与期望的尺寸相匹配。

  if(_g === null || _g === undefined) {
    _g = createGraphics(_w, _h);
    _g.pixelDensity(1);
  }
  else {
    _g.width = _w;
    _g.height = _h;
    _g.elt.width = _w;// * this._pInst._pixelDensity;
    _g.elt.height = _h;// * this._pInst._pixelDensity;
    _g.elt.style.width = _w + 'px';
    _g.elt.style.height = _h + 'px';
    /*
    if (this._isMainCanvas) {
      this._pInst._setProperty('width', this.width);
      this._pInst._setProperty('height', this.height);
    }*/
    //_g.remove();
    //_g = null;
    //_g = createGraphics(_w, _h); // ugly!
    //_g.width = _w; _g.height = _h;
    //_g.size(_w, _h);
    //_g.elt.setAttribute('style', 'width:' + _w + 'px; height:' + _h + 'px');
    //_g.elt.style.width = _w +'px'; _g.elt.style.height = _h + 'px';
    //_g.resize(_w, _h);
    _g.pixelDensity(1);
    _g.loadPixels(); // console.log(_g.width);
    //_g.elt.style.width = _w +'px'; _g.elt.style.height = _h + 'px';
    _g.elt.setAttribute('style', 'display: none');
  }
  _g.updatePixels();
  _g.background(0);
  _g.loadPixels();
  if(_w * _h !== _g.pixels.length / 4) {
    console.log(
      '[AsciiArt, resizeGraphicsWorkaround] _w * _h !== _g.pixels.length / 4:' +
      '\n_w = ' + _w + ' _h = ' + _h +
      '\n_g.width = ' + _g.width + ' _g.height = ' + _g.height +
      '\n_w * _h = ' + (_w * _h) +
      '\n_g.pixels.length / 4 = ' + (_g.pixels.length / 4)
    );
  }
}

// helper function creating 2-dimentional arrays
p5.prototype.AsciiArt.prototype.createArray2d = function(_w, _h) {
  var temp_arr = [];
  for(var temp_x = 0; temp_x < _w; temp_x++) {
    var temp_column = [];
    for(var temp_y = 0; temp_y < _h; temp_y++) temp_column[temp_y] = 0;
    temp_arr[temp_x] = temp_column;
  }
  return temp_arr;
}

/*
  A simple function to help us print the ASCII Art on the screen. The function
  prints a two-dimensional array of glyphs and it is used similarly to the
  standard method of displaying images. It can be used in versions with 2, 4 or
  6 parameters. When using the version with 2 parameters, the function assumes
  that the width and height of the printed text block is equal to the width and
  height of the working space (that's mean: equal to the _dst size) and it
  starts drawing from upper left corner (coords: 0, 0). When using the version
  with 4 parameters, the function assumes that the width and height of the
  printed text block is equal to the width and height of the working space
  (that's mean: equal to the _dst size). _arr2d is the two-dimensional array of
  glyphs, _dst is destinetion (basically anything with 'canvas' property, such
  as p5js sketch or p5.Graphics).
*/
p5.prototype.AsciiArt.prototype.typeArray2d = function(
  _arr2d, _dst, _x, _y, _w, _h
) {
  if(_arr2d === null) {
    console.log('[AsciiArt, typeArray2d] _arr2d === null');
    return;
  }
  if(_arr2d === undefined) {
    console.log('[AsciiArt, typeArray2d] _arr2d === undefined');
    return;
  }
  switch(arguments.length) {
    case 2: _x = 0; _y = 0; _w = width; _h = height; break;
    case 4: _w = width; _h = height; break;
    case 6: /* nothing to do */ break;
    default:
      console.log(
        '[AsciiArt, typeArray2d] bad number of arguments: ' + arguments.length
      );
      return;
  }
  /*
    Because Safari in macOS seems to behave strangely in the case of multiple
    calls to the p5js text(_str, _x, _y) method for now I decided to refer
    directly to the mechanism for handling the canvas tag through the "pure"
    JavaScript.
  */
  if(_dst.canvas === null) {
    console.log('[AsciiArt, typeArray2d] _dst.canvas === null');
    return;
  }
  if(_dst.canvas === undefined) {
    console.log('[AsciiArt, typeArray2d] _dst.canvas === undefined');
    return;
  }
  var temp_ctx2d = _dst.canvas.getContext('2d');
  if(temp_ctx2d === null) {
    console.log('[AsciiArt, typeArray2d] _dst canvas 2d context is null');
    return;
  }
  if(temp_ctx2d === undefined) {
    console.log('[AsciiArt, typeArray2d] _dst canvas 2d context is undefined');
    return;
  }
  var dist_hor = _w / _arr2d.length;
  var dist_ver = _h / _arr2d[0].length;
  var offset_x = _x + dist_hor * 0.5;
  var offset_y = _y + dist_ver * 0.5;
  for(var temp_y = 0; temp_y < _arr2d[0].length; temp_y++)
    for(var temp_x = 0; temp_x < _arr2d.length; temp_x++)
      /*text*/temp_ctx2d.fillText(
        _arr2d[temp_x][temp_y],
        offset_x + temp_x * dist_hor,
        offset_y + temp_y * dist_ver
      );
}

/*
  A helper function converting 2-dimentional array of glyphs into string.
*/
p5.prototype.AsciiArt.prototype.convert2dArrayToString = function(
  _arr2d
) {
  if(arguments.length !== 1) {
    console.log(
      '[AsciiArt, convert2dArrayToString] bad number of arguments: ' +
      arguments.length
    );
    return '';
  }
  if(_arr2d === null) {
    console.log('[AsciiArt, draw] _arr2d === null');
    return '';
  }
  if(_arr2d === undefined) {
    console.log('[AsciiArt, draw] _arr2d === undefined');
    return '';
  }
  var temp_result = '';
  for(var temp_y = 0; temp_y < _arr2d[0].length; temp_y++) {
    for(var temp_x = 0; temp_x < _arr2d.length; temp_x++) {
      temp_result += _arr2d[temp_x][temp_y];
    }
    if(temp_y < _arr2d[0].length - 1) temp_result += '\n';
  }
  return temp_result;
}

/*
  Helper function printing sorted glyphs.
*/
p5.prototype.AsciiArt.prototype.printWeightTable = function() {
  for(var i = 0; i < this.__weightTable.length; i++)
    console.log(
      '[' + i + '] ' + this.__sketch.char(this.__weightTable[i].code) + ' ' +
        this.__weightTable[i].weight
    );
}

/*
  This function sorts the glyphs by ordering them taking into account the area
  they occupy. The resulting character table will later be used to convert
  brightness of pixels to ASCII codes.
*/
p5.prototype.AsciiArt.prototype.createWeightTable = function() {
  var temp_weightTable = [];
  var temp_weight, temp_index;
  var temp_w = this.__fontSize * 5;
  var temp_h = this.__fontSize * 3;
  this.resizeGraphicsWorkaround(this.__graphics, temp_w, temp_h);
  this.__graphics.textFont(this.__fontName);
  this.__graphics.textSize(this.__fontSize);
  this.__graphics.textStyle(this.__textStyle);
  this.__graphics.textAlign(this.__sketch.CENTER, this.__sketch.CENTER);
  this.__graphics.noStroke();
  this.__graphics.fill(255);
  for(var i = this.__range.min; i <= this.__range.max; i++) {
    this.__graphics.background(0);
    this.__graphics.text(this.__sketch.char(i), temp_w * 0.5, temp_h * 0.5);
    this.__graphics.loadPixels(); // not sure if we need it really
    temp_weight = 0;
    for(var j = 0; j < this.__graphics.pixels.length; j += 4)
      temp_weight += this.__graphics.pixels[j]; // r
    temp_weightTable[i - this.__range.min] = {code: i, weight: temp_weight};
  }
  this.__weightTable.splice(0, this.__weightTable.length);
  do {
    temp_index = -1; temp_weight = -1;
    for(var i = 0; i < temp_weightTable.length; i++) {
      if(temp_weightTable[i].weight >= 0) {
        if(temp_weight < 0 || temp_weightTable[i].weight < temp_weight) {
          temp_weight = temp_weightTable[i].weight;
          temp_index = i;
        }
      }
    }
    if(temp_index >= 0) {
      this.__weightTable[this.__weightTable.length] = {
        code: temp_weightTable[temp_index].code,
        weight: temp_weightTable[temp_index].weight
      };
      temp_weightTable[temp_index].weight = -1;
    }
  } while(temp_index >= 0)
}

/*
  This function is the first layer of the procedure for converting images to
  the ASCII art. The function first of all checks the correctness of parameters
  and scales the source image to the required size. It can be called with one
  or three parameters. If it is called with one parameter the size of the
  two-dimensional ASCII art table returned by the function will be equal to the
  size of the image being converted.
*/
p5.prototype.AsciiArt.prototype.convert = function(_image, _w, _h) {
  if(arguments.length !== 1 && arguments.length !== 3) {
    console.log(
      '[AsciiArt, convert] bad number of arguments: ' + arguments.length
    );
    return null;
  }
  if(_image === null) {
    console.log('[AsciiArt, convert] _image === null');
    return null;
  }
  if(_image === undefined) {
    console.log('[AsciiArt, convert] _image === undefined');
    return null;
  }
  /*
  if(_image.pixels === null)  {
    console.log('[AsciiArt, convert] _image.pixels === null');
    return null;
  }
  if(_image.pixels.length === 0)  {
    console.log('[AsciiArt, convert] _image.pixels.length === 0');
    return null;
  }
  */
  if(arguments.length === 3) {
    if(isNaN(_w)) {
      console.log('[AsciiArt, convert] _w is not a number (NaN)');
      return null;
    }
    if(isNaN(_h)) {
      console.log('[AsciiArt, convert] _h is not a number (NaN)');
      return null;
    }
    _w = Math.floor(Math.abs(_w)); _h = Math.floor(Math.abs(_h));
    if(_w < 1) _w = 1; if(_h < 1) _h = 1;
    if(this.__graphics.width !== _w || this.__graphics.height !== _h) {
      this.resizeGraphicsWorkaround(this.__graphics, _w, _h);
    }
  }
  else { // arguments.length === 1
    if(
      this.__graphics.width !== _image.width ||
      this.__graphics.height !== _image.height
    ) {
      this.resizeGraphicsWorkaround(
        this.__graphics, _image.width, _image.height
      );
    }
  }
  this.__graphics.background(0);
  this.__graphics.image(
    _image, 0, 0, this.__graphics.width, this.__graphics.height
  );
  return this.__convert();
}

/*
  This function is the second layer of the procedure for converting images to
  the ASCII art. The function goes back to the array containing sorted glyphs,
  hatching those whose position in the table corresponds to the brightness of
  subsequent pixels in the converted image. The function returns a
  two-dimensional array containing the glyphs that make up the graphics
  converted to the ASCII art form.
*/
p5.prototype.AsciiArt.prototype.__convert = function() {
  if(this.__automaticPixelsDataTransferFlag) this.__graphics.loadPixels();
  var temp_result =
    this.createArray2d(this.__graphics.width, this.__graphics.height);
  var temp_maxWeight = 3 * 255; // max r + max g + max b (ignore alpha)
  var temp_range = this.__weightTable.length - 1;
  var temp_weight, temp_anchor;
  for(var temp_y = 0; temp_y < this.__graphics.height; temp_y++) {
    for(var temp_x = 0; temp_x < this.__graphics.width; temp_x++) {
      temp_anchor = (temp_y * this.__graphics.width + temp_x) * 4;
      temp_weight =
        (
          this.__graphics.pixels[temp_anchor    ] +
          this.__graphics.pixels[temp_anchor + 1] +
          this.__graphics.pixels[temp_anchor + 2]
        ) / temp_maxWeight;
      temp_weight = Math.floor(temp_weight * temp_range);
      if(this.invertBrightnessFlag) temp_weight = temp_range - temp_weight;
      temp_result[temp_x][temp_y] =
      this.__sketch.char(this.__weightTable[temp_weight].code);
    }  
  }
  if(this.__automaticPixelsDataTransferFlag) this.__graphics.updatePixels();
  return temp_result;
}