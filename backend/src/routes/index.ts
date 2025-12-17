import { Router } from 'express';
import formRoutes from './form.routes';
import submissionRoutes from './submission.routes';
import searchRoutes from './search.routes';

const router = Router();
router.use('/forms', formRoutes);
router.use('/forms', submissionRoutes);
router.use('/search', searchRoutes);
export default router;
