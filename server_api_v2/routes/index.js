const express = require('express');
const axios = require('axios');

const router = express.Router();
const URL = 'http://localhost:8002/version1';
axios.defaults.headers.origin = 'http://localhost:8003';
const request = async(req,api) => {
    try{
        if(!req.session.jwt){
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret : process.env.CLIENT_SECRET,
            });
            req.session.jwt = tokenResult.data.token;
        }
        return await axios.get(`${URL}${API}`, {
            headers : {authorization : req.session.jwt},
        });
    } catch(error){
        if(error.response.status === 419) {
            delete req.session.jwt;
            return request(req,api);
        }
        return error.response;
    }
};

router.get('/mypost', async(req,res,next) => {
    try{
        const result = await request(req, '/posts/my');
        res.json(result.data);
    } catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/search/:hashtag', async(req,res,next) => {
    try {
        const result = await request(
            req,`/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`,
        );
        res.json(result.data);
    } catch(error) {
        if(error.code) {
            console.error(error);
            next(error);
        }
    }
});

router.get('/test', async(req,res,next) => {
    try{
        if(!req.session.jwt){ // 세션에 token 없으면 token 발급 시도
            const tokenResult = await axios.post('http://localhost:8002/version1/token', {
                clientSecret : process.env.CLIENT_SECRET,
            });
            if(tokenResult.data && tokenResult.data.code === 200) { // 발급 성공
                req.session.jwt = tokenResult.data.token; // 세션에 token 저장
            } else {
                return res.json(tokenResult.data); // 발급 실패 
            }
        }
        const result = await axios.get('http://localhost:8002/version1/test', {
            headers : {authorization : req.session.jwt},
        });
        return res.json(result.data);
    } catch(error) {
        console.error(error);
        if(error.response.status === 419) { // token 만료시
            return res.json(error.response.data);
        }
        return next(error);
    }
});

module.exports = router;