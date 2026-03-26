import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout wrapper that renders the Header + child route content + Footer.
 * Used for all app pages (not auth pages).
 */
const AppLayout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    );
};

export default AppLayout;
