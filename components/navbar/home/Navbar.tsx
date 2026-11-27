import React, { Fragment, useState } from "react";
import { links } from "./Links";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import AccessibilityMenu from "./accessibility/menu";
import { cn } from "utils";
import SpriteIcon from "@/components/UI/SpriteIcon";
import MobileNavbar from "./mobile-navbar";
import SaleBanner from "@/components/home/new-home/SaleBanner";
import { useRouter } from "next/router";
import { useMediaQuery } from "@mui/material";
import AppDownloadModal from "@/components/modals/AppDownloadModal";
import TawkToWidget from "public/TawkToWidget";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import useClickOutside from "hooks/useClickOutside";

const Navbar = () => {
  const [heading, setHeading] = useState("");
  const router = useRouter();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navbarRef = useClickOutside<HTMLElement>(() => setHeading(""));
   const { push } = useRouter();
   const { t } = useTranslation("common");
   const { t: tHome } = useTranslation("home");

   return (
      <>
         <SaleBanner />
         <nav className="sticky top-0 left-0 z-[1001] bg-mainBlack px-6 py-4 font-workSans" ref={navbarRef}>
        <div className="mx-auto flex items-center justify-between">
          <ul className="flex items-center gap-6">
            <Link href={"/"}>
              <img
                src={"/assets/landing/logo_white.png"}
                width={isMobile ? 70 : 100}
                height={isMobile ? 35 : 50}
                alt="CodeAlgo Academy logo"
              />
            </Link>

            <div className="flex items-center gap-4 xl:gap-6 max-lg:hidden">
              {links.map((link, index) => {
                return (
                  <Fragment key={index}>
                    <div className="nav-divider"></div>
                    <div
                      className="relative"
                      onMouseEnter={() => {
                        if (link.sublinks) {
                          setHeading(link.name);
                        }
                      }}
                      onMouseLeave={() => {
                        if (link.sublinks) {
                          setHeading("");
                        }
                      }}
                      onClick={() => {
                        if (link.name == heading) {
                          setHeading("");
                        } else {
                          setHeading(link.name);
                        }
                        
                        if (link.route) {
                          router.push(link.route);
                        }
                      }}
                    >
                      <p className="nav-item">
                        {link.route ? (
                          <Link href={link.route}>{tHome(link.name)}</Link>
                        ) : (
                          <span>{tHome(link.name)}</span>
                        )}
                      </p>

                      {link.sublinks && (
                      <div className={cn("nav-dropdown", heading != link.name && "hidden")}>
                        {link.sublinks.map((slinks, index) => (
                          // A real <a>, so the href is in the server-rendered
                          // HTML. Next 12's Link only adds one for plain text
                          // children; wrapped around a <p> it left crawlers
                          // with no link to these pages at all.
                          <Link key={index} href={slinks.link}>
                            <a className="nav-sublink">
                              {tHome(slinks.name)}
                            </a>
                          </Link>
                        ))}
                      </div>
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </div>

            <AnimatePresence>
              {showMobileNav && <MobileNavbar close={() => setShowMobileNav(false)} />}
            </AnimatePresence>
          </ul>

          <div className="flex items-center gap-2 xl:gap-4 max-lg:hidden">
            <LanguageSwitcher variant="navbar" />
            <button type="button" onClick={() => push("/login")} className="nav-btn nav-btn-filled">
              <span className="no-contrast-adjust">{t("login")}</span>
            </button>

            <button type="button" onClick={() => setShowAppModal(true)} className="nav-btn nav-btn-outline">
              <span className="no-contrast-adjust">{t("getApp")}</span>
            </button>

            <button type="button" onClick={() => push("https://play.codealgoacademy.com")} className="nav-btn nav-btn-filled">
              <span className="no-contrast-adjust">{t("playGame")}</span>
            </button>
          </div>
          <SpriteIcon
            name="menu"
            className="text-white lg:hidden"
            size={28}
            onClick={() => setShowMobileNav(true)}
          />
        </div>
      </nav>
      <AppDownloadModal
        isOpen={showAppModal}
        onClose={() => setShowAppModal(false)}
      />

      <AccessibilityMenu />
      <TawkToWidget /> 
    </>
  );
};

export default Navbar;