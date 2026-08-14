/**
 * Money Magnet Tools — site config
 * Edit this file only when deploying (or run: npm run utility:replace-domain)
 */
window.SITE_CONFIG = {
  /** Replace with your GA4 Measurement ID (e.g. G-ABC123XYZ) */
  ga4Id: 'G-XXXXXXXX',
  /** Set true after you replace ga4Id above */
  enableAnalytics: false,

  /** Google AdSense publisher ID (ca-pub-XXXXXXXXXXXXXXXX) */
  adsenseClientId: 'ca-pub-XXXXXXXX',
  /** Set true after AdSense approval and ads.txt is live */
  enableAdSense: false,

  /**
   * Google Search Console — HTML tag verification content value only
   * (the string inside content="..." from the meta tag Google gives you)
   */
  googleSiteVerification: '',

  /** Site name for share sheet */
  siteName: 'Money Magnet Tools',

  /** Replace tools.moneymagnettools.com before deploy — include https:// and no trailing slash */
  siteUrl: 'https://tools.moneymagnettools.com',

  /**
   * Optional: Money Autopilot Profit Tracker API base (no trailing slash)
   * Example: https://autopilot.yourdomain.com
   * Leave empty to use local-only tracker (localStorage).
   */
  profitTrackerApiUrl: 'https://autopilot.moneymagnettools.com',

  /** Optional monthly revenue goal for tracker.html progress bar (USD, 0 = hidden) */
  monthlyRevenueGoal: 0,
};
