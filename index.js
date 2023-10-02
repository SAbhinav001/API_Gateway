const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimit } = require('express-rate-limit')
const morgan= require('morgan')
const axios = require('axios');
const dotenv = require('dotenv')
dotenv.config()

const PORT = process.env.PORT
const app = express()

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,
	max: 5, 
})

app.use(morgan('combined'));

app.use(limiter);


app.use('/BookingService', async (req, res, next) => {
    // console.log(req.headers['x-access-token']);
    try {
        
        const response = await axios.get('http://localhost:3001/authservice/api/v1/isAuthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if(response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
})
app.use('/BookingService', createProxyMiddleware({ target: 'http://localhost:3012', changeOrigin: true }));
app.use('/authservice',createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));

app.use('/flightsearchservice',createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));

app.use('/demo', (req,res)=>{
    return res.json({message:"OK"})
})

app.listen(PORT, ()=>{
    console.log(`server started at Port ${PORT}`)
})
