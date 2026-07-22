"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVoucher = void 0;
const express_1 = require("express");
const donacionController_1 = require("../controllers/donacionController");
const multer_config_1 = require("../config/multer.config");
exports.uploadVoucher = (0, multer_config_1.createUpload)('vouchers', 'voucher');
class DonacionRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.config();
    }
    config() {
        this.router.post('/create', exports.uploadVoucher.single('Comprobante'), donacionController_1.donacionController.insertDonacion);
        this.router.get('/listmethod/:IdFundacion', donacionController_1.donacionController.listMetodoDonacion);
        this.router.get('/list-donation/:IdPersona', donacionController_1.donacionController.listDonacion);
        this.router.get('/list-donation/:IdPersona/:IdDonacion', donacionController_1.donacionController.getOneDonation);
    }
}
const donacionRoutes = new DonacionRoutes();
exports.default = donacionRoutes.router;
