import { MotionConfig } from 'motion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Catalog } from './components/catalog';
import './styles/app.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing application root');

createRoot(root).render(
	<StrictMode>
		<MotionConfig reducedMotion="user">
			<Catalog />
		</MotionConfig>
	</StrictMode>,
);
