const SEO_BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'WhatsApp',
  'TelegramBot',
  'Pinterest',
  'Googlebot',
  'bingbot'
];

export const isSeoBot = (userAgent: string | undefined): boolean => {
  if (!userAgent) {
    return false;
  }
  const ua = userAgent.toLowerCase();
  return SEO_BOT_USER_AGENTS.some((bot) => ua.includes(bot.toLowerCase()));
};
