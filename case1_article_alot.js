var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

var news = new Array();
var connect_num=0;
var total_link=0;

var isEndPage=0;//used for judging whether the crawler crawled the last page, if yes, set it to true(1)
var page_num=1;
var end_page=2;//last page

//Step 7 --continually fetch pages--
var interTag = setInterval(function(){
    if(page_num>end_page){
        clearInterval(interTag);
    }
    else{
        console.log('fetch page:'+page_num);
        var myurl = 'https://news.gamme.com.tw/category/all/page'+page_num;//demolink
        fetchPage(myurl,page_num);
        page_num++;
    }
},1*1000);/*--a page/sec--*/

function fetchPage(url,page){
    request({
        method:'GET',
        uri:url,
        headers:{
            'User-Agent':'Mozilla/5.0 (compatible; CNADemoBot/1.0;'+
                ' +http://www.cs.ccu.edu.tw/~cp103m/bot.html)'
        },
        timeout:3*1000
    },function(error, response, body){
        if(!error&&response.statusCode==200){
            var $ = cheerio.load(body);
            total_link += $('div.List-4').length;
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

                        //Step 6 --grab article by href--
                        grapArticle(href,title,time,tags,small_img,total_link,page);



            });
        }
        else{
            console.log('error occur!');
        }

    })
    
}


function grapArticle(href,title,time,tags,img,total_link,page){
    request({
        uri:href,
        headers:{
            'User-Agent':'Mozilla/5.0 (compatible; CNADemoBot/1.0;'+
            ' +http://www.cs.ccu.edu.tw/~cp103m/bot.html)'
        },
        timeout: 10000
    },function(error, response, body){
        if(!error&&response.statusCode==200){
            if(page==end_page){
                isEndPage=1;
            }

            connect_num++;

            var $ = cheerio.load(body,{
                normalizeWhitespace:true
            });
            var article = $('div.entry').text();
            var imgs='';

            //get data attribute & undefined type
            $('div.entry > p > a > img').each(function(){
                if(typeof $(this).data('original')!=="undefined"){
                    imgs+=' '+$(this).data('original');
                }
                else{
                    imgs+=' '+$(this).attr('src');
                }
            });
            var data = {
                'title':title,
                'time':time,
                'tags':tags,
                'href':href,
                'small_img':img,
                'img':imgs,
                'content':article
            }
            news.push(data);

            /*--Check if all links crawled--*/
            if(total_link==connect_num&&isEndPage){
                console.log(total_link+"="+connect_num);
                fs.writeFile('./case1_article_alot.result',JSON.stringify(news,undefined,2),function(err){
                    if(err){console.log('write false:'+err)}
                    else{
                        console.log('ok!');
                    }
                });
            }
        }
        else{
            console.log('error occur!');
        }
    });
}
