'use strict'
var fs = require('graceful-fs');
var request = require('request');
var dateFormat = require('dateformat');
var HashMap = require('hashmap');
var cheerio = require("cheerio");

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const bot = new MyEmitter();


var stop_time =  new Date("2016-04-23");
var domain = 'news.gamme.com.tw/category/all/page';
var current_links=0
var end_flag=0;

var news_part = new Array();
var news = new Array();

bot.on('next_page',function(page){
    page++;
    grapPage(page);
});
bot.on('end_page',function(page){
    console.log("To the end page:"+page+" Crawling links num:"+current_links);
    var result = JSON.stringify({
        "data":news_part
    },undefined,2);
    var date = dateFormat(new Date(),'yyyymmdd');
    fs.appendFile(date+"_gamme.summary",result,function(err){
        if(err){
            console.log(err);
        }
    });

    if(current_links==0){
        bot.emit('all_done');
    }
});
bot.on('all_done',function(len){
    var result = JSON.stringify({
        "data":news
    },undefined,2);
    var date = dateFormat(new Date(),'yyyymmdd');
    fs.appendFile(date+"_gamme.news",result,function(err){
        if(err){
            console.log(err);
        }
    });
    
});

grapPage(1);


function grapPage(page){
    console.log(page);
    request({
        uri:'http://'+domain+page,
        headers:{
            'User-Agent':'Mozilla/5.0 (compatible; CNADemoBot/1.0;'+
            ' +http://www.cs.ccu.edu.tw/~cp103m/bot.html)'
        },
        timeout: 10000
    },function(error, response, body){
        if(error){
            console.log(error);
            return;
        }
        else if(response.statusCode!==200){
            console.log("response.statusCode:"+response.statusCode);
            return;
        }
        //--Step1--show--
        //console.log(body);
        
        //--Step2--parse--cheerio basic practice
        parseHtml(body,page,function(){
            //--Step3--continue next page--event driven practice
            if(end_flag==0){
                bot.emit('next_page',page);
            }
            else{
                bot.emit('end_page',page);
            }
        });

    });
}
function parseHtml(body,index,fin)
{
    var $ = cheerio.load(body);
    $("div.List-4").each(function(){
        var link = $(this);
        var href = link.children('.archive_img').attr('href');
        var img = link.children('.archive_img').children().attr('src');
        var title = link.children('h3').text();
        var p = link.children('p').text();
        var time = link.children('.List-4-list').children('.List-4-metas').text();
        
        var tags=""
        link.children('.List-4-list').children('.List-4-tags').children('a').each(function(){
            if(tags==""){
                tags = $(this).text()
            }
            else{
                tags += ","+$(this).text()
            }

        });
        if(new Date(time).getTime()>new Date(stop_time).getTime()){
            /*--Method 1--*/
            var data = {
                'title':title,
                'tags':tags,
                'href':href,
                'small_img':img,
                'p':p,
                'time':time
            }
            news_part.push(data);
            
            //Store links to urls pool
            /*
            fs.appendFile("urls.pool",href+"\n",function(){
            });
            */

            /*--Method 2--*/
            //--Step4--grab article simultaneously--
            current_links++;
            grapArticle(href,title,time,tags,img);
        }
        else{
            end_flag=1;
            console.log("end:"+time);
            return false;
        }
    });
    console.log("return "+end_flag);
    fin();
}
function grapArticle(href,title,time,tags,img){
    request({
        uri:href,
        headers:{
            'User-Agent':'Mozilla/5.0 (compatible; CNADemoBot/1.0;'+
            ' +http://www.cs.ccu.edu.tw/~cp103m/bot.html)'
        },
        timeout: 10000
    },function(error, response, body){
        if(error){
            console.log(error);
            return;
        }
        else if(response.statusCode!==200){
            console.log("response.statusCode:"+response.statusCode);
            if(response.statusCode==503){
                grapArticle(href,title,time,tags,img);
            }
            return;
        }
        else{
            current_links--;
            var $ = cheerio.load(body);
            var article = $('div.entry').text();
            var imgs='';

            //get data attribute & undefined type
            $('div.entry > p > a > img').each(function(){
                if(typeof $(this).data('original')!=="undefined"){
                    imgs+=' '+$(this).data('original');
                    //console.log($(this).data('original'));
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
                'small_img':img
                'img':imgs,
                'content':article
            }
            news.push(data);

            if(current_links==0&&end_flag==1){
                bot.emit('all_done');       
            }
        }
    });
}
