var request = require('request');
var fs = require('fs');

var myurl = 'https://news.gamme.com.tw/category/all';//demolink
//var myurl = 'https://news.gammse.com.tw/category/all';//domain not found
//var myurl = 'https://www.dorm.ccu.edu.tw/test/announce.php?nn=18600';//timeout
//var myurl = 'https://www.ptt.cc/bbs/Gossiping/M.14s61478330.A.12D.html';//404 not found

//Step 1 --send a request--
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
            /*--print the result--*/
            //console.log(body);
            /*--print the response content--*/
            //console.log(response);
            
            //Step 2 --save body--
            fs.writeFile('./test/web_body.rec',body,'utf8',function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log('It\'s saved!')
                }
            })
            
    }
    else{
        //console.log(error);
        console.log('error occur!');
    }

})
