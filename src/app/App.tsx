import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { BootSplash } from '@/shared/ui/boot-splash';
import './i18n';

export default function App() {
  return (
    <>
      <BootSplash />
      <RouterProvider router={router} />
    </>
  );
}
