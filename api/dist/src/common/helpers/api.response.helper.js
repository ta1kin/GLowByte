"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warningResponse = exports.errorResponse = exports.successResponse = exports.setResponseLogger = void 0;
let appLogger = null;
const setResponseLogger = (logger) => {
    appLogger = logger;
};
exports.setResponseLogger = setResponseLogger;
const successResponse = (data, message = 'OK', meta) => ({
    success: true,
    message,
    data,
    meta,
});
exports.successResponse = successResponse;
const errorResponse = (message, errors, context) => {
    if (appLogger && errors) {
        appLogger.error(message, errors?.stack, context || 'API', { errors });
    }
    else if (errors) {
        console.error('[API Error]', message, errors);
    }
    return {
        success: false,
        message,
        errors,
    };
};
exports.errorResponse = errorResponse;
const warningResponse = (data, message, meta, context) => {
    if (appLogger) {
        appLogger.warn(message, context || 'API', { data, meta });
    }
    return {
        success: true,
        message,
        data,
        meta,
        warning: true,
    };
};
exports.warningResponse = warningResponse;
//# sourceMappingURL=api.response.helper.js.map