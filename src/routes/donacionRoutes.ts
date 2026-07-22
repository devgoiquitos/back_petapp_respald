import { Router } from "express";
import { donacionController } from "../controllers/donacionController";
import { createUpload } from '../config/multer.config';

export const uploadVoucher =
  createUpload('vouchers', 'voucher');

class DonacionRoutes{
    public router: Router = Router();
    constructor(){
        this.config();
    }

    config():void{
        this.router.post(
            '/create',
            uploadVoucher.single('Comprobante'),
            donacionController.insertDonacion
        );
        this.router.get('/listmethod/:IdFundacion', donacionController.listMetodoDonacion);
        this.router.get('/list-donation/:IdPersona', donacionController.listDonacion);
        this.router.get('/list-donation/:IdPersona/:IdDonacion', donacionController.getOneDonation);
    }
}

const donacionRoutes = new DonacionRoutes();
export default donacionRoutes.router;