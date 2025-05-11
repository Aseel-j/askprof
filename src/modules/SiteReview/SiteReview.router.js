import {Router} from 'express';
import * as controller from './SiteReview.controller.js';
import validation from '../../middleware/validation.js';
import {addSiteReviewSchema} from './SiteReview.validation.js';
import {asyncHandler } from '../../utils/catchError.js';
const router=Router();

//اضافة راي
router.post('/addSiteReview',validation(addSiteReviewSchema),asyncHandler(controller.addSiteReview));
//اعادة الآراء
router.get('/getSiteReview',asyncHandler(controller.getSiteReviews));

export default router;