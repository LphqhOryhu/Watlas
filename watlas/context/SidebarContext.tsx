'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type SidebarContextType = {
    open: boolean;
    toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
    open: true,
    toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(true);
    const toggle = () => setOpen((prev) => !prev);

    return (
        <SidebarContext.Provider value={{ open, toggle }}>
            {children}
        </SidebarContext.Provider>
    );
}
