var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var promise = require('promise');
var fs = require('fs');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.send('hello!');
// });

request('http://www.clubsnap.com/forums/forumdisplay.php?f=102', function(err, result, html){
  if(err){
    console.log('An error occurred');
    console.log(err);
    return;
  }

  var $ = cheerio.load(html);
  var promises = [];
  // var brands = ["Canon", "Nikon"];

  var price = $('.postdetails .postcontent').children().last().after().text();
  console.log(price);
  // var dateData = [];
  //
  // var r = $(".postcontent").text().replace(/\r?\n|\r|\t/g, "").split(" ");
  // r.filter(function(){
  //   if(x=="(S$):"){
  //     return r[r.indexOf(this)+1];
  //   }
  // })
  // r.forEach(function(x){
  //   dateData.push(x);
  // });
  $('.threads').each(function(i, dataTable){ //search for each race
    // var r = $(dataTable).find('.threadtitle').children().last();
    var $threads = $(dataTable).find('.threadbit')/*.children().last();*/ // returns onclick="Core.goTo('scv')"
    var urls = threadUrls($threads, $); //gets the url of each unit and store as array

    // console.log($units);
    // races.push(r);
    // console.log(r);
    // console.log(dateData[0]);
    // console.log(races);
    // console.log(urls);
    // console.log($threads);
    promises.push(scrapeThreads(urls));
  //
  });
  //
  Promise.all(promises).then(function(){
    var data = {};
    var results = [];


    arguments[0].forEach(function(threads, i){
      data[results] = threads;
    });

    //use promiseResults to populate and build data object

    //write JSON file to disk
    fs.writeFile('public/u.json', JSON.stringify(data), function(err){
      if(err){
        console.log(err);
      }
      //console.log(data);
    });

    console.log('scraping complete');
  });
});

function threadUrls($threads, $){
  var urls = [];
  $threads.each(function(i, thread){
    var path = $(thread).find('.threadtitle').children().last().attr('href');
    urls.push('http://www.clubsnap.com/forums/'+path);
  });
  return urls; //returns arrays of thread urls
}

function scrapeThreads(threadUrls){ //threadUrls is array of threads urls
  return new Promise(function(fulfil, reject){
    var promises = [];
    threadUrls.forEach(function(url){
      promises.push(scrapeThread(url));
    });
    // console.log(promises);
    Promise.all(promises).then(function(){
      var threads = [];

      arguments[0].forEach(function(thread){
        threads.push(thread);
      });

      fulfil(threads);
    });

  });
}

function scrapeThread(url){
  var threadData = {};

  return new Promise(function(fulfil, reject){
    request(url, function(err, res, html){
      if(err){
        console.log('An error occurred');
        console.log(err);
        reject(err);
        return;
      }

      var $ = cheerio.load(html);

      threadData["date"] = $('.date').text();
      threadData["time"] = $('.postlist .postdate .date .time').text();
      threadData["eqmtType"] = $(".postcontent").text().replace(/\r?\n|\r|\t/g, "").split(" ")

      fulfil(threadData);
    });
  });
}

module.exports = router;
