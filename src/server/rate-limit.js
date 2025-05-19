"use strict";
const rateLimit = require("express-rate-limit");
const { aesDecryptData } = require("../components/common");

class RateLimit {
    constructor() {
        const rateLimitkeyGenerator = async (req) => {
            try {
                const decodedIp = decodeURIComponent(req?.query?.ip);
                const decryptedIp = await aesDecryptData(decodedIp);
                return decryptedIp;
            } catch (err) {
                console.error(`Error in rateLimitkeyGenerator. Error = ${err}`);
                throw Error("Something went wrong");
            }
        };

        const rateLimitHandler = async (req, res) => {
            try {
                const decodedIp = decodeURIComponent(req?.query?.ip);
                const decryptedIp = await aesDecryptData(decodedIp);

                console.log(`RateLimitHandler triggered from IP = ${decryptedIp}`);
                res.status(400).json({
                    success: false,
                    code: "GENERAL_ERROR",
                    message: "Something went wrong",
                });
            } catch (err) {
                console.error(`Error in rateLimitHandler. Error = ${err}`);
                res.status(400).json({
                    success: false,
                    code: "GENERAL_ERROR",
                    message: "Something went wrong",
                });
            }
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
