import winston from "winston";
import process from "process";
const { combine, timestamp, json, errors } = winston.format;
import "winston-daily-rotate-file";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Restrict the message inmportance level
  format: combine(timestamp(), errors({ stack: true }), json({ space: 2 })),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: "./logs/standard.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "./logs/exception.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: "./logs/rejection.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
  ],
});
