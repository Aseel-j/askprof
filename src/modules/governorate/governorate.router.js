import {Router} from 'express';
import * as controller from './governorate.controller.js'
import { asyncHandler } from '../../utils/catchError.js';
import validation from '../../middleware/validation.js';
import { addGovernorateSchema } from './governorate.validation.js';
const router=Router();
router.post('/addgovernorate',validation(addGovernorateSchema),asyncHandler(controller.addGovernorate));
router.get("/getgovernorate",asyncHandler(controller.getGovernorates));
export default router;