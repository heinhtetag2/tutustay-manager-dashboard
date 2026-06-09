import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import './i18n';

export default function App() {
  return <RouterProvider router={router} />;
}
