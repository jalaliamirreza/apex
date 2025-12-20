import { Router } from 'express';
import formRoutes from './form.routes';
import submissionRoutes from './submission.routes';
import searchRoutes from './search.routes';
import launchpadRoutes from './launchpad.routes';
import adminRoutes from './admin.routes';

const router = Router();
router.use('/forms', formRoutes);
router.use('/forms', submissionRoutes);
router.use('/search', searchRoutes);
router.use('/launchpad', launchpadRoutes);
router.use('/admin', adminRoutes);
export default router;
