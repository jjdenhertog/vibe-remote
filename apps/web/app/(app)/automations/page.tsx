'use client';

import React from 'react';
import { SnackbarProvider } from 'notistack';
import { AutomationsPage } from './AutomationsPage';

const AutomationsPageWithProvider = () => (
    <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
    >
        <AutomationsPage />
    </SnackbarProvider>
);

export default AutomationsPageWithProvider;