"use strict";
const rateLimit = require("express-rate-limit");
const { RESPONSE_ERROR_BAD_REQUEST } = require("../constants");
const { aesDecryptData } = require("../components/common");

class RateLimit {
    constructor() {
        const rateLimitkeyGenerator = (req) => {
            const decryptedIp = aesDecryptData(req?.query?.ip);
            console.log(`encryptedData = ${req?.query?.ip}, decryptedData = ${decryptedIp}`);
            return decryptedIp;
        };
        const rateLimitStatusCode = RESPONSE_ERROR_BAD_REQUEST;
        const rateLimitHandler = (req, res) => {
            res.status(rateLimitStatusCode).json({
                message: "Something went wrong",
            });
        };

        this.otpRateLimit = () => {
            const minuteRateLimit = rateLimit({
                windowMs: 5 * 60 * 1000, // 5 minute
                max: 3,
                keyGenerator: rateLimitkeyGenerator,
                handler: rateLimitHandler,
            });

            const hourRateLimit = rateLimit({
                windowMs: 1 * 60 * 60 * 1000, // 1 hour
                max: 5,
                keyGenerator: rateLimitkeyGenerator,
                handler: rateLimitHandler,
            });

            const dayRateLimit = rateLimit({
                windowMs: 1 * 24 * 60 * 60 * 1000, // 1 day
                max: 8,
                keyGenerator: rateLimitkeyGenerator,
                handler: rateLimitHandler,
            });

            return [minuteRateLimit, hourRateLimit, dayRateLimit];
        };
    }
}

module.exports = RateLimit;
