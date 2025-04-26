import {Router} from 'express';
import * as controller from './governorate.controller.js'
const router=Router();
router.post('/addgovernorate',controller.addGovernorate);
router.get("/getgovernorate",controller.getGovernorates);
export default router;