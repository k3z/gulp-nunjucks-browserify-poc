#Static site generator with gulp, nunjucks, browserify poc

##Features

- Templating thanks to [Nunjucks](https://mozilla.github.io/nunjucks/).
- Custom data for templates in external json files.
- Less compilation.
- Client dependencies also handled with npm in package.json.
- Import dependencies in your scripts with browserify and browserify-css.
- Preview the resutls in real time in your browser thanks to gulp-watch and livereload.


##Requirements

* [Node.js](https://nodejs.org/)
* [gulp](http://gulpjs.com/)


##Install

    $ sudo npm install --global gulp
    $ cd <project_folder>
    $ npm install


##Generate site

###Activate local server and build site

    $ gulp

Open your browser with http://127.0.0.1:8888/

###Activate local server with livereload

    $ gulp watch

###Build static site

    $ gulp build

End result can be found in `./build folder.


##License

(MIT License)

Copyright (c) 2015 [ok3z](http://www.twitter.com/olivier_k)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

_"close your eyes, you can be a space captain"_
