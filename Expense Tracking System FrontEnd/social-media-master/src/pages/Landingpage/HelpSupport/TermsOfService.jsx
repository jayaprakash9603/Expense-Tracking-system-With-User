import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useMediaQuery,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  Gavel as GavelIcon,
  AccountCircle as AccountIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
  Warning as WarningIcon,
  Update as UpdateIcon,
  ContactMail as ContactIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

/**
 * Terms of Service Page Component
 * Read our terms and conditions
 */

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    icon: GavelIcon,
    content: `By accessing or using Expensio Finance ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.`,
  },
  {
    id: "account",
    title: "2. Account Registration",
    icon: AccountIcon,
    content: `When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.

You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.

You may not use as a username the name of another person or entity or that is not lawfully available for use, or a name or trademark that is subject to any rights of another person or entity without appropriate authorization.`,
  },
  {
    id: "services",
    title: "3. Description of Services",
    icon: DescriptionIcon,
    content: `Expensio Finance provides expense tracking, budgeting, and financial management tools. Our services include:

• Expense tracking and categorization
• Budget creation and monitoring
• Financial reports and analytics
• Bill management and reminders
• Multi-user expense sharing
• Data export and backup features

We reserve the right to modify, suspend, or discontinue the Service (or any part or content thereof) at any time with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.`,
  },
  {
    id: "payment",
    title: "4. Payment Terms",
    icon: PaymentIcon,
    content: `Some aspects of the Service may be provided for a fee. You will be required to select a payment plan and provide accurate billing information.

By providing payment information, you represent and warrant that you have the legal right to use any payment method(s) you provide. You authorize us to charge your payment method for the total amount of your subscription or purchase.

If your payment cannot be completed, we may suspend or terminate your access to the paid features of the Service. Refunds are handled on a case-by-case basis and at our sole discretion.`,
  },
  {
    id: "privacy",
    title: "5. Privacy & Data Protection",
    icon: SecurityIcon,
    content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using the Service, you agree to the collection and use of information in accordance with our Privacy Policy.

We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "prohibited",
    title: "6. Prohibited Activities",
    icon: BlockIcon,
    content: `You agree not to engage in any of the following prohibited activities:

• Copying, distributing, or disclosing any part of the Service in any medium
• Using any automated system to access the Service
• Transmitting spam, chain letters, or other unsolicited email
• Attempting to interfere with the proper working of the Service
• Bypassing measures we may use to prevent or restrict access to the Service
• Using the Service for any illegal or unauthorized purpose
• Violating any laws in your jurisdiction
• Harassing, abusing, or harming another person
• Impersonating another user or person
• Uploading viruses or malicious code`,
  },
  {
    id: "termination",
    title: "7. Termination",
    icon: WarningIcon,
    content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.

Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may do so by following the instructions in Settings or by contacting us.

All provisions of the Terms which by their nature should survive termination shall survive termination, including ownership provisions, warranty disclaimers, indemnity, and limitations of liability.`,
  },
  {
    id: "changes",
    title: "8. Changes to Terms",
    icon: UpdateIcon,
    content: `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.

What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.`,
  },
  {
    id: "contact",
    title: "9. Contact Information",
    icon: ContactIcon,
    content: `If you have any questions about these Terms, please contact us:

Email: legal@expensio.com
Address: 123 Finance Street, Tech City, TC 12345
Phone: +1 (555) 123-4567

We will respond to your inquiries within 5-7 business days.`,
  },
];

const TermsOfService = () => {
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery("(max-width:900px)");
  const isDark = mode === "dark";

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: colors.primary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        maxHeight: "calc(100vh - 100px)",
        borderRadius: isSmallScreen ? 0 : "8px",
        border: isSmallScreen ? "none" : `1px solid ${colors.border_color}`,
        mr: isSmallScreen ? 0 : "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: `1px solid ${colors.border_color}`,
          bgcolor: colors.secondary_bg,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ color: colors.primary_text }}
          >
            <ArrowBackIcon />
          </IconButton>
          <DescriptionIcon
            sx={{ color: colors.primary_accent, fontSize: 28 }}
          />
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: colors.primary_text }}
          >
            {t("settings.termsOfService") || "Terms of Service"}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: colors.border_color,
            borderRadius: "3px",
          },
        }}
      >
        {/* Table of Contents - Sidebar */}
        {!isSmallScreen && (
          <Paper
            sx={{
              width: 280,
              minWidth: 280,
              bgcolor: colors.secondary_bg,
              borderRadius: 0,
              borderRight: `1px solid ${colors.border_color}`,
              overflow: "auto",
              position: "sticky",
              top: 0,
              height: "100%",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: colors.primary_text, mb: 1 }}
              >
                Table of Contents
              </Typography>
              <List dense>
                {SECTIONS.map((section) => {
                  const SectionIcon = section.icon;
                  return (
                    <ListItem
                      key={section.id}
                      button
                      onClick={() => scrollToSection(section.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        "&:hover": {
                          bgcolor: colors.hover_bg,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <SectionIcon
                          sx={{ fontSize: 18, color: colors.primary_accent }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={section.title}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          color: colors.primary_text,
                          noWrap: true,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Paper>
        )}

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            overflow: "auto",
          }}
        >
          {/* Last Updated */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              borderRadius: 2,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <Typography variant="body2" sx={{ color: colors.secondary_text }}>
              <strong>Last Updated:</strong> January 1, 2026
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: colors.secondary_text, mt: 1 }}
            >
              Please read these Terms of Service carefully before using Expensio
              Finance. Your access to and use of the service is conditioned on
              your acceptance of and compliance with these Terms.
            </Typography>
          </Paper>

          {/* Sections */}
          {SECTIONS.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <Paper
                key={section.id}
                id={section.id}
                sx={{
                  p: 3,
                  mb: 2,
                  bgcolor: colors.secondary_bg,
                  borderRadius: 2,
                  border: `1px solid ${colors.border_color}`,
                  scrollMarginTop: 16,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: `${colors.primary_accent}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SectionIcon sx={{ color: colors.primary_accent }} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary_text }}
                  >
                    {section.title}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2, borderColor: colors.border_color }} />
                <Typography
                  variant="body1"
                  sx={{
                    color: colors.secondary_text,
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {section.content}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default TermsOfService;
