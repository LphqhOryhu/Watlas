import type { AppProps } from 'next/app';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import '@/styles/globals.css';

type MainLayoutProps = {
    Component: AppProps['Component'];
    pageProps: AppProps['pageProps'];
};

function MainLayout({ Component, pageProps }: MainLayoutProps) {
    const { open } = useSidebar();
    return (
        <>
            <Navbar />
            <Sidebar />
            <div
                className={`pt-16 transition-all duration-300 ${
                    open ? 'pl-64' : 'pl-16'
                }`}
            >
                <Component {...pageProps} />
            </div>
        </>
    );
}


export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <SidebarProvider>
                <MainLayout Component={Component} pageProps={pageProps} />
            </SidebarProvider>
        </AuthProvider>
    );
}
