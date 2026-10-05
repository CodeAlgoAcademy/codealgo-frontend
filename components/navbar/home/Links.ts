export interface NavbarLink {
   name: string;
   subMenu?: boolean;
   sublinks?: { name: string; link: string }[];
   route?: string;
}

export const links: NavbarLink[] = [
   {
      name: "about",
      subMenu: true,
      sublinks: [
         { name: "aboutUs", link: "/about" },
         { name: "press", link: "/press" },
         { name: "blog", link: "http://blog.codealgoacademy.com/" },
         { name: "learnMore", link: "/learn-more" },
         { name: "contactUs", link: "/contact" },
      ],
   },
      { name: "caseStudies",
      route: "/case-studies" },

   {
      name: "parents",
      subMenu: true,
      sublinks: [
         { name: "login", link: "/login/parent" },
         { name: "signUp", link: "/signup/parent" },
          {
            name: "resources",
            link: "/for-parents",
         },
      ],
   },
   {
      name: "educators",
      subMenu: true,
      sublinks: [
         { name: "login", link: "/login/teacher" },
         { name: "signUp", link: "/signup/teacher" },
         {
            name: "resources",
            link: "/for-educators",
         },
      ],
   },
   {
      name: "pricing",
      route: "/pricing",
   },
];
