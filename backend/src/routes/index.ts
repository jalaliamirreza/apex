import { Router } from 'express';
import formRoutes from './form.routes';
import submissionRoutes from './submission.routes';
import searchRoutes from './search.routes';
import launchpadRoutes from './launchpad.routes';
import adminRoutes from './admin.routes';
import adminFormsRoutes from './admin-forms.routes';
import workflowRoutes from './workflow.routes';

const router = Router();
router.use('/forms', formRoutes);
router.use('/forms', submissionRoutes);
router.use('/search', searchRoutes);
router.use('/launchpad', launchpadRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/forms', adminFormsRoutes);
router.use('/workflow', workflowRoutes);
export default router;
