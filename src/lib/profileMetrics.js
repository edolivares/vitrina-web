/**
 * Builds simulated seller metrics from a post and its related conversations.
 *
 * @param {object} post - Marketplace post used as the source for deterministic mock metrics.
 * @param {Array<object>} chats - Mock conversations available for the current seller.
 * @returns {{views: number, favorites: number, chatCount: number, conversion: number, weeklyViews: Array<{day: string, value: number}>, lastContact: string | undefined}}
 */
export function getPostMetrics(post, chats = []) {
  const metricSeed = post.id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const views = metricSeed + 45;
  const favorites = (metricSeed % 35) + 3;
  const productChats = chats.filter(chat => chat.postId === post.id);
  const chatCount = productChats.length;
  const conversion = views > 0 ? Math.round(((favorites + chatCount) / views) * 100) : 0;
  const weekDays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const weeklyViews = weekDays.map((day, index) => {
    const dayFactor = index + 1;
    return {
      day,
      value: Math.round((views / 16) + (metricSeed * dayFactor) % 28 + dayFactor * 3)
    };
  });

  return {
    views,
    favorites,
    chatCount,
    conversion,
    weeklyViews,
    lastContact: productChats[0]?.updatedAt
  };
}
