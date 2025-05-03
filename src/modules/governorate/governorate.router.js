import {Router} from 'express';
import * as controller from './governorate.controller.js'
import { asyncHandler } from '../../utils/catchError.js';
const router=Router();
router.post('/addgovernorate',asyncHandler(controller.addGovernorate));
router.get("/getgovernorate",asyncHandler(controller.getGovernorates));
export default router;