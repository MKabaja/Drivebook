import { RouterProvider } from '@tanstack/react-router';
import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { router } from '@/app/router';

import '@/styles/app.css';

const root = document.getElementById('app');
if (!root) {
	throw new Error('Missing application root');
}
createRoot(root).render(
	<StrictMode>
		<MotionConfig reducedMotion="user">
			<RouterProvider router={router} />
		</MotionConfig>
	</StrictMode>,
);
