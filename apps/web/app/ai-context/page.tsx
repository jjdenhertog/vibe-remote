'use client';

import React from 'react';
import { SnackbarProvider } from 'notistack';
import { ConfigPage } from './ConfigPage';

const AIContextPageWithProvider = () => (
    <SnackbarProvider 
        maxSnack={3}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
    >
        <ConfigPage />
    </SnackbarProvider>
);

export default AIContextPageWithProvider;