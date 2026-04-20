import { useCallback } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import { AppContainer } from '@lark-apaas/client-toolkit/components/AppContainer';
import { ErrorRender } from '@lark-apaas/client-toolkit/components/ErrorRender';
// This is a temporary placeholder component from spark-framework
import './index.css';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import InfoCollectionPage from './pages/InfoCollectionPage';
import DrawAnimationPage from './pages/DrawAnimationPage';
import ResultPage from './pages/ResultPage';
import InterpretingPage from './pages/InterpretingPage';
import InterpretPage from './pages/InterpretPage';
import DownloadPage from './pages/DownloadPage';
import { logger } from '@lark-apaas/client-toolkit/logger';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<InfoCollectionPage />} />
        <Route path="/draw" element={<DrawAnimationPage />} />
        <Route path="/fortune-result" element={<ResultPage />} />
        <Route path="/interpreting" element={<InterpretingPage />} />
        <Route path="/interpret" element={<InterpretPage />} />
        <Route path="/download" element={<DownloadPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const CLIENT_BASE_PATH = process.env.CLIENT_BASE_PATH || '/';

const MainApp = () => {
  const handleError = useCallback((err: Error) => {
    logger.error('RenderError', err);
  }, []);
  return (
    <BrowserRouter basename={CLIENT_BASE_PATH}>
      <AppContainer defaultTheme="light">
        <ErrorBoundary
          fallbackRender={({ error }) => <ErrorRender error={error} />}
          onError={handleError}
        >
          <RoutesComponent />
        </ErrorBoundary>
      </AppContainer>
    </BrowserRouter>
  );
};

export default MainApp;
