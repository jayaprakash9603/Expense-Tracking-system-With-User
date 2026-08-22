import { Route } from "react-router-dom";
import {
  AboutPage,
  FeaturesPage,
  GuideArticlePage,
  GuidesIndexPage,
  LegalPage,
  MarketingHome,
  PublicContactPage,
  PublicHelpPage,
} from "../features/marketing";

export const getPublicRoutes = ({ includeHome = true } = {}) => (
  <>
    {includeHome ? <Route path="/" element={<MarketingHome />} /> : null}
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/guides" element={<GuidesIndexPage />} />
    <Route path="/guides/:slug" element={<GuideArticlePage />} />
    <Route path="/about" element={<AboutPage />} />
    <Route path="/help" element={<PublicHelpPage />} />
    <Route path="/contact" element={<PublicContactPage />} />
    <Route path="/privacy" element={<LegalPage variant="privacy" />} />
    <Route path="/terms" element={<LegalPage variant="terms" />} />
  </>
);
