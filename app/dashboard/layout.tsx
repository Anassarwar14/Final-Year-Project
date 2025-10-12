import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";


const RootLayout = async ({
    children
} : {
    children: React.ReactNode;
}
) => { 

    return (
        <SidebarProvider>
            <AppSidebar/>
            <Suspense fallback={<div>Loading...</div>}>
                        {children}
            </Suspense>
        </SidebarProvider>
    );

}

export default RootLayout;