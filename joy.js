#!/usr/bin/node

/* * * * * * * * * * * * * * * * * *
 * joy.js                          *
 * Making static sites a joy!      *
 * v0.1 Alpha                      *
 * Made with love & joy            *
 * @JessetheSibley // chickencoder *
 * * * * * * * * * * * * * * * * * */

var mmark = require('marky-mark');
var tinyt = require('tinytim');
var colors = require('colors');
var mkdirp = require('mkdirp');
var fs = require('fs');
var mv = require('mv');
var walk = require('walk');

// Globals
var template_source = process.cwd() + "/template.html";
var html_source = process.cwd() + "/index.html";
var port = 1337;
var version = require('./package')['version'];

/**
  `joy build`
   build function produces
   index.html file in current
   directory of all .md files
*/
function build() {
  // Tidy directory first
  // to ensure all files
  // are in the right place
  tidy();

  mmark.parseDirectory(process.cwd() + "/posts", function(err, posts){
    if (err) {
      console.log(err.red);
    }

    var feed_html = "";
    for (post in posts) {
      var post = posts[post];

      // Fetch post data
      var title = post['meta']['title'];
      var date  = post['meta']['date'];
      var markd = post['content'];

      // Produce HTML
      var html = [
        '<div class="post">',
        '<h2 class="post-title">',
        title,
        '</h2>',
        '<h4 class="post-date">',
        date,
        '</h4>',
        markd,
        '</div>'
      ].join();

      feed_html += html;
    }
    var out = tinyt.renderFile(template_source, {feed: feed_html});
    fs.writeFile(html_source, out, function(data, err){
      if (err) {
        console.log(err);
      }
      console.log("All posts succesfully rendered ✔".green);
    });
  });

}

/**
  `joy new <name>`
  new function will create
  a new directory with a
  few necessary files
*/
function newp(name) {
  var newfolder = process.cwd() + '/' + name;
  mkdirp(newfolder, function(err){
    if (err) {
      console.log(err.red);
    }

    mkdirp(newfolder + '/posts', function(err){
      if(err) {
        console.log(err.red);
      }
    });

    // Write template file
    var template = '<!DOCTYPE html> \
      <html>\
      <head>\
      \
      </head>\
      <body>\
        <h1>My Blog</h1>\
        {{ feed }}\
      </body>\
      </html>\ ';
    fs.writeFileSync(newfolder + '/template.html', template);

    // Write index file
    fs.writeFileSync(newfolder + '/index.html', '');
  });
}

/**
  `joy tidy`
  tidy function sorts all
  markdown files into a
  sub-folder, and all static
  assets into the 'assets'
  folder
*/
function tidy() {
  walker = walk.walk(process.cwd());

  walker.on('file', function(root, fileStats, next){
    console.log(fileStats);

    // Process stats
    var ext = fileStats.name.split('.')[1];
    var name = fileStats.name;
    var assets = ['jpg', 'gif', 'png', 'mpg', 'txt', 'psd'];

    if (ext == 'md') {
      mv('./' + name, './posts/' + name, {mkdirp: true}, function(err){
        if (err) {
          console.log(err.red);
        }
      });
    } else if (assets.indexOf(ext) != -1) {
      mv('./' + name, './assets/' + name, {mkdirp: true}, function(err){
        if (err) {
          console.log(err.red);
        }
      });
    }
    next();
  });

  walker.on('errors', function(root, nodeStatsArray, next){
    next();
  });

  walker.on('end', function(){
    console.log("Finished tidying ✔".green);
  });
}

/**
  `joy serve`
  serve function will run
  a very small, pure node
  http server on the local
  machine
*/
function serve() {
  var http = require('http');
  http.createServer(function(req, res){
    fs.readFile(html_source, 'utf8', function(err, data) {
      if (err) {
        res.send(err);
        console.log(err);
      }
      res.end(data.toString());
    });
  }).listen(port);
  console.log("\nRunning ".yellow + "joy".blue + " development server".yellow);
  console.log("http://127.0.0.1:1337".green);
  console.log("Ctrl-C to Stop\n".green);
}

/**
  `joy help`
  help functions displays
  a list of possible joy
  tasks to run and how to
  select them
*/
function help() {
  console.log("joy \n\
  \n \
  Usage:\n \
    joy new <name>...\n \
    joy build \n \
    joy serve \n \
    joy tidy \n \
    joy help \n \
  \n \
    joy -h | --help \n \
    joy --version \n \
  \n \
  Options: \n \
    -h --help     Show this screen. \n \
    --version     Show version.\n \
  ");
}

// Route system arguments to
// appropriate function.
// console.log(process.argv.length)

for (i in process.argv) {
  var arg = process.argv[i];
  if (arg == 'build') {
    build();
  } else if (arg == 'tidy') {
    tidy();
  } else if (arg == 'serve') {
    serve();
  } else if (arg == 'help' || arg == '-h' || arg == '--help') {
    help();
  } else if (arg == 'new') {
    newp(process.argv[process.argv.indexOf(arg) + 1]);
  } else if (arg == '--version') {
    console.log(version);
  }
}
