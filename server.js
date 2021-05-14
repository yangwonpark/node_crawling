const express = require("express");

const request = require('request-promise');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

// express에서 받아온 json 데이터를 보기 좋게 세팅해주는 옵션
app.set('json spaces', 2);

app.get('/shipping/:invc_no', async (req, res) => {
    try {
        // 대한통운 배송위치 크롤링 주소
        // 송장번호 invc_no = 639246320613
        const url = `https://www.doortodoor.co.kr/parcel/ \
        doortodoor.do?fsp_action=PARC_ACT_002&fsp_cmd=retrieveInvNoACT&invc_no=${req.params.invc_no}`;
        let result = [];    // 최종 보내는 데이터

        const html = await request(url);
        const $ = cheerio.load( html, 
            { decodeEntities: false }   // 한글 변환  
        );

        // 고유한 클래스명이나 id명을 사용
        const tdElements = $(".board_area").find("table.mb15 tbody tr td"); // td의 데이터를 전부 긁어옴
        // console.log(tdElements[0].children[0].data.trim());

        let temp = {};  //임시로 데이터 한 줄을 담을 변수
        for (let i = 0; i < tdElements.length; i++) {
            if(i%4 === 0) {
                temp = {};  //시작 지점이므로 초기화
                temp["step"] = tdElements[i].children[0].data.trim();   // 공백 제거
                // removeEmpty의 경우 step의 경우 공백이 많이 포함됨
            } else if(i%4 === 1) {
                temp["data"] = tdElements[i].children[0].data;
            } else if(i%4 === 2) {
                // data가 여러줄 => children이 나눠져있음
                temp["status"] = tdElements[i].children[0].data;
                if(tdElements[i].children.length > 1){
                    temp["status"] += tdElements[i].children[2].data;
                }
            } else if(i % 4 === 3) {
                temp["location"] = tdElements[i].children[1].children[0].data;
                result.push(temp);      // 한줄을 다 넣으면 최종 데이터를 넣을 reult에 푸쉬한다
            }

        }
        res.json(result);
    }catch(e) {
        console.log(e);
    }
});

app.listen(port, function() {
    console.log('Express Listening on port', port);
})