import {
    LuLayoutDashboard,
    LuGalleryVerticalEnd,
    LuMessageSquareQuote,
    LuLayoutTemplate,
    LuTag,
} from "react-icons/lu";


export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        id: "02",
        label: "Blog Posts",
        icon: LuGalleryVerticalEnd,
        path: "/admin/posts",
    },
    {
        id: "03",
        label: "Comments",
        icon: LuMessageSquareQuote,
        path: "/admin/comments",
    },
];

export const BLOG_NAVBAR_DATA = [
        {
        id: "01",
        label: "Home",
        icon: LuLayoutTemplate,
        path: "/",
    },
    {
        id: "02",
        label: "Current Updates",
        icon: LuTag,
        path: "/tag/LatestUpdates",
    },
    {
        id: "03",
        label: "Digital Marketing",
        icon: LuTag,
        path: "/tag/DigitalMarketing",
    },
    {
        id: "04",
        label: "Earn Online",
        icon: LuTag,
        path: "/tag/Online Earning",
    },
    {
        id: "04",
        label: "E-Commerce",
        icon: LuTag,
        path: "/tag/E-Commerce",
    },
];