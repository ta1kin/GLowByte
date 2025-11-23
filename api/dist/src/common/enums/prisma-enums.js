"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShtabelStatus = exports.ModelStatus = exports.FileType = exports.UploadStatus = void 0;
var UploadStatus;
(function (UploadStatus) {
    UploadStatus["PENDING"] = "PENDING";
    UploadStatus["PROCESSING"] = "PROCESSING";
    UploadStatus["COMPLETED"] = "COMPLETED";
    UploadStatus["FAILED"] = "FAILED";
    UploadStatus["PARTIAL"] = "PARTIAL";
})(UploadStatus || (exports.UploadStatus = UploadStatus = {}));
var FileType;
(function (FileType) {
    FileType["SUPPLIES"] = "SUPPLIES";
    FileType["FIRES"] = "FIRES";
    FileType["TEMPERATURE"] = "TEMPERATURE";
    FileType["WEATHER"] = "WEATHER";
})(FileType || (exports.FileType = FileType = {}));
var ModelStatus;
(function (ModelStatus) {
    ModelStatus["TRAINING"] = "TRAINING";
    ModelStatus["READY"] = "READY";
    ModelStatus["FAILED"] = "FAILED";
    ModelStatus["DEPRECATED"] = "DEPRECATED";
})(ModelStatus || (exports.ModelStatus = ModelStatus = {}));
var ShtabelStatus;
(function (ShtabelStatus) {
    ShtabelStatus["ACTIVE"] = "ACTIVE";
    ShtabelStatus["SHIPPED"] = "SHIPPED";
    ShtabelStatus["FIRED"] = "FIRED";
    ShtabelStatus["ARCHIVED"] = "ARCHIVED";
})(ShtabelStatus || (exports.ShtabelStatus = ShtabelStatus = {}));
//# sourceMappingURL=prisma-enums.js.map