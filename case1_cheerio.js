var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var myurl = 'https://news.gamme.com.tw/category/all';//demolink

/*below--simple practice--below*/
/*
var html='<div class="b1">in block\n'+
            '<h3>hello</h3>'+
                '<span id="s1">'+
                    '<p id="text1">a text</p>'+
                    '<test class="test1">a test</test>'+
                    '<a id="link1" href="a1"><img src="img1"></a>'
                '</span>'
        '</div>';

var $ = cheerio.load(html);
var result;
result = $('div').text();
console.log(result);
return;
*/
/*up--simple practice--up*/


request({
    method:'GET',
    uri:myurl,
    headers:{
        'User-Agent':'Mozilla/5.0 (compatible; CNADemoBot/1.0;'+
            ' +http://www.cs.ccu.edu.tw/~cp103m/bot.html)'
    },
    timeout:3*1000
},function(error, response, body){
    if(!error&&response.statusCode==200){
            //Step 3 --parse web site's content--
            var $ = cheerio.load(body);
            var news_summary = new Array();
            var result = $('div.List-4').each(function(){
                var myroot = $(this);
                var small_img = myroot.children('.archive_img').children('img').attr('src');
                //console.log(small_img);
                var title = myroot.children('h3').text();
                //console.log(title);
                var href = myroot.children('h3').children('a').attr('href');
                //console.log(href);
                var p = myroot.children('p').text();
                //console.log(p);
                var time = myroot.children('.List-4-list').children('.List-4-metas').text();
                //console.log(time);
                var tags="";
                myroot.children('.List-4-list').
                        children('.List-4-tags').
                        children('a').each(function(){
                                tags +=' '+$(this).text();
                });
                //console.log(tags);
                
                //Step 4 --save it--
                var data = {
                    'title':title,
                    'tags':tags,
                    'href':href,
                    'small_img':small_img,
                    'p':p,
                    'time':time
                }
                /*--view object--*/
                //console.log(data);
                /*--get some information from object--*/
                //console.log(data['title']);

                /*--push to array--*/
                news_summary.push(data);
            });
            /*--view array--*/
            //console.log(news_summary);
            /*--get some information from array--*/
            //console.log(news_summary[0].title);
            
            /*--save it as JSON--*/
            //NOTICE: must use JSON.stringify for converting object to JSON string
            fs.writeFile('./case1_cheerio.result',JSON.stringify(news_summary,undefined,2),function(err){
                    if(err){
                        console.log('write false:'+err)
                    }
                    else{
                        console.log('ok!');
                    }
            });
    }
    else{
        console.log('error occur!');
    }

})
