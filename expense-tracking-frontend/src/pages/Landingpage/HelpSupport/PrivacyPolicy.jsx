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
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Shield as ShieldIcon,
  Storage as StorageIcon,
  Lock as LockIcon,
  Share as ShareIcon,
  Cookie as CookieIcon,
  ChildCare as ChildrenIcon,
  Gavel as RightsIcon,
  Update as UpdateIcon,
  ContactMail as ContactIcon,
  Security as SecurityIcon,
  DeleteForever as DeleteIcon,
} from "@mui/icons-material";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";

/**
 * Privacy Policy Page Component
 * Learn about how we protect your data
 */

const SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: ShieldIcon,
    content: `Welcome to Expensio Finance ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our expense tracking application and services.

By using Expensio Finance, you agree to the collection and use of information in accordance with this policy. We encourage you to read this Privacy Policy carefully and contact us if you have any questions.`,
  },
  {
    id: "data-collection",
    title: "2. Information We Collect",
    icon: StorageIcon,
    content: `We collect several types of information to provide and improve our Service:

Personal Information:
• Name and email address
• Profile picture (optional)
• Phone number (optional)
• Account credentials

Financial Data:
• Expense records and transactions
• Budget information
• Category preferences
• Payment method names (not actual card numbers)
• Bill and recurring payment details

Usage Data:
• Device information (type, operating system)
• IP address and location data
• App usage patterns and preferences
• Feature interaction analytics

We do NOT collect:
• Actual credit/debit card numbers
• Bank account credentials
• Social Security numbers
• Biometric data without explicit consent`,
  },
  {
    id: "data-use",
    title: "3. How We Use Your Information",
    icon: LockIcon,
    content: `We use the collected information for various purposes:

Service Delivery:
• To provide and maintain our expense tracking service
• To personalize your experience
• To process your transactions and requests
• To send notifications and reminders

Improvement & Analytics:
• To analyze usage patterns and improve features
• To develop new products and services
• To conduct research and analysis
• To monitor and prevent fraud

Communication:
• To send service updates and announcements
• To respond to your inquiries and support requests
• To send promotional materials (with your consent)
• To notify you of changes to our policies`,
  },
  {
    id: "data-sharing",
    title: "4. Information Sharing",
    icon: ShareIcon,
    content: `We may share your information in the following circumstances:

With Your Consent:
• When you explicitly authorize sharing with third parties
• When you use features involving friend connections
• When you export or share reports

Service Providers:
• Cloud hosting providers (encrypted storage)
• Analytics services (anonymized data)
• Email service providers
• Customer support platforms

Legal Requirements:
• To comply with legal obligations
• To protect our rights and property
• To prevent fraud or security issues
• In response to valid legal requests

We DO NOT:
• Sell your personal data to third parties
• Share your financial data with advertisers
• Provide data to data brokers
• Use your data for targeted advertising`,
  },
  {
    id: "data-security",
    title: "5. Data Security",
    icon: SecurityIcon,
    content: `We implement robust security measures to protect your data:

Technical Safeguards:
• End-to-end encryption for data transmission (TLS 1.3)
• AES-256 encryption for data at rest
• Secure password hashing (bcrypt)
• Regular security audits and penetration testing

Access Controls:
• Role-based access control (RBAC)
• Multi-factor authentication (MFA) support
• Session management and timeout
• IP-based access monitoring

Infrastructure:
• Secure cloud hosting with SOC 2 compliance
• Regular automated backups
• Disaster recovery procedures
• 24/7 security monitoring

While we strive to protect your data, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security but continuously work to improve our defenses.`,
  },
  {
    id: "cookies",
    title: "6. Cookies & Tracking",
    icon: CookieIcon,
    content: `We use cookies and similar tracking technologies:

Essential Cookies:
• Authentication and session management
• Security and fraud prevention
• User preferences storage

Analytics Cookies:
• Usage pattern analysis
• Feature performance tracking
• Error monitoring

You can control cookies through:
• Browser settings
• Our cookie preference center
• Opt-out mechanisms for analytics

We do not use cookies for:
• Third-party advertising
• Cross-site tracking
• Building advertising profiles`,
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    icon: RightsIcon,
    content: `You have the following rights regarding your data:

Access & Portability:
• Request a copy of your personal data
• Export your data in common formats (CSV, JSON)
• View what data we have collected

Correction & Deletion:
• Update inaccurate information
• Request deletion of your account and data
• Remove specific records

Control & Consent:
• Opt-out of marketing communications
• Manage notification preferences
• Withdraw consent for optional processing

To exercise these rights, go to Settings > Data Management or contact our support team. We will respond to requests within 30 days.`,
  },
  {
    id: "data-retention",
    title: "8. Data Retention",
    icon: DeleteIcon,
    content: `We retain your data according to the following policies:

Active Accounts:
• Personal data: For the duration of your account
• Transaction data: 7 years (for tax/legal purposes)
• Usage analytics: 2 years (anonymized after)

Deleted Accounts:
• Most data: Deleted within 30 days
• Backup data: Purged within 90 days
• Legal compliance data: Retained as required by law

You can request immediate deletion of your data through Settings > Data Management > Delete Account.`,
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    icon: ChildrenIcon,
    content: `Expensio Finance is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to delete such information from our servers.

For users between 13-18 years old, we recommend parental guidance when using financial management applications.`,
  },
  {
    id: "changes",
    title: "10. Policy Changes",
    icon: UpdateIcon,
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by:

• Posting the new Privacy Policy on this page
• Updating the "Last Updated" date
• Sending an email notification for material changes
• Displaying an in-app notification

We encourage you to review this Privacy Policy periodically. Changes are effective when posted on this page. Continued use of the Service after changes constitutes acceptance of the updated policy.`,
  },
  {
    id: "contact",
    title: "11. Contact Us",
    icon: ContactIcon,
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

Data Protection Officer:
Email: privacy@expensio.com

General Inquiries:
Email: support@expensio.com
Phone: +1 (555) 123-4567

Mailing Address:
Expensio Finance
123 Finance Street
Tech City, TC 12345

We aim to respond to all inquiries within 5-7 business days.`,
  },
];

const PrivacyPolicy = () => {
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
          <ShieldIcon sx={{ color: colors.primary_accent, fontSize: 28 }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: colors.primary_text }}
          >
            {t("settings.privacyPolicy") || "Privacy Policy"}
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
          {/* Last Updated & Trust Badge */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              borderRadius: 2,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                <strong>Last Updated:</strong> January 1, 2026
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  icon={<LockIcon sx={{ fontSize: 16 }} />}
                  label="GDPR Compliant"
                  size="small"
                  sx={{
                    bgcolor: `${colors.primary_accent}20`,
                    color: colors.primary_accent,
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                  label="SOC 2 Certified"
                  size="small"
                  sx={{
                    bgcolor: `${colors.primary_accent}20`,
                    color: colors.primary_accent,
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: colors.secondary_text, mt: 1 }}
            >
              Your privacy is important to us. This policy describes how
              Expensio Finance collects, uses, and protects your personal
              information.
            </Typography>
          </Paper>

          {/* Sections */}
          {SECTIONS.map((section) => {
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

export default PrivacyPolicy;
