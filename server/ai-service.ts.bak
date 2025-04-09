import Anthropic from '@anthropic-ai/sdk';
import { content, Content, genres, Genre, tags, Tag, User } from '@shared/schema';

// سیستم توصیه محتوا با استفاده از هوش مصنوعی Anthropic Claude
export class AIRecommendationService {
  private anthropic: Anthropic;
  
  constructor() {
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  /**
   * توصیه محتوا با توجه به ترجیحات کاربر و بافت فرهنگی
   * @param user کاربر
   * @param watchHistory تاریخچه تماشا
   * @param favorites محتواهای مورد علاقه
   * @param allContent همه محتواهای موجود
   * @param allGenres همه ژانرها
   * @param allTags همه تگ‌ها
   * @param count تعداد محتواهای پیشنهادی
   * @returns لیست محتواهای پیشنهادی
   */
  async getContentRecommendations(
    user: User | null,
    watchHistory: any[],
    favorites: Content[],
    allContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number = 5
  ): Promise<Content[]> {
    try {
      // اگر هیچ کاربر یا تاریخچه‌ای وجود ندارد، محتواهای محبوب را برگردان
      if (!user && watchHistory.length === 0 && favorites.length === 0) {
        return this.getPopularContent(allContent, count);
      }
      
      // استخراج ترجیحات کاربر
      const userPreferences = this.extractUserPreferences(user, watchHistory, favorites, allGenres, allTags);
      
      // تهیه متن برای مدل AI
      const prompt = this.buildRecommendationPrompt(user, userPreferences, allContent, allGenres, allTags);
      
      // بررسی وجود کلید API
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'invalid') {
        throw new Error("ANTHROPIC_API_KEY is not available or invalid");
      }

      // دریافت پاسخ از مدل
      let responseText = '';
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1024,
          system: `You are a content recommendation system for an Iranian movie/TV platform named "Xraynama". 
                   You understand Persian culture, preferences, and viewing habits. 
                   Your goal is to recommend the most relevant content based on user history and preferences.
                   You must respond only with valid JSON containing an array of content IDs in this format:
                   { "recommendations": [1, 42, 67, 13, 95] }`,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });
        
        // پردازش پاسخ
        responseText = typeof response.content[0] === 'object' && 'text' in response.content[0] 
          ? response.content[0].text as string 
          : '';
      } catch (error) {
        console.error("Error in Anthropic API call:", error);
        throw error;
      }
      
      let recommendedIds: number[] = [];
      
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse && Array.isArray(jsonResponse.recommendations)) {
          recommendedIds = jsonResponse.recommendations;
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        // استخراج اعداد از متن در صورت خطا در پارس کردن JSON
        const idMatches = responseText.match(/\d+/g);
        if (idMatches) {
          recommendedIds = idMatches.map(Number).slice(0, count);
        }
      }
      
      // فیلتر کردن محتواهایی که وجود دارند و برگرداندن آنها
      const recommendedContent = allContent.filter(item => recommendedIds.includes(item.id));
      
      // اگر تعداد محتواهای توصیه شده کمتر از count باشد، از محتواهای محبوب استفاده کن
      if (recommendedContent.length < count) {
        const popularContent = this.getPopularContent(
          allContent.filter(item => !recommendedIds.includes(item.id)), 
          count - recommendedContent.length
        );
        return [...recommendedContent, ...popularContent];
      }
      
      return recommendedContent.slice(0, count);
    } catch (error) {
      console.error("Error getting AI recommendations:", error);
      // در صورت خطا، محتواهای محبوب را برگردان
      return this.getPopularContent(allContent, count);
    }
  }
  
  /**
   * دریافت محتواهای مشابه با یک محتوای خاص
   * @param contentItem محتوای مورد نظر
   * @param allContent همه محتواها
   * @param allGenres همه ژانرها 
   * @param allTags همه تگ‌ها
   * @param count تعداد محتواهای پیشنهادی
   * @returns لیست محتواهای مشابه
   */
  async getSimilarContent(
    contentItem: Content,
    allContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number = 5
  ): Promise<Content[]> {
    try {
      // تمام محتواها بجز محتوای فعلی را لیست کن
      const otherContent = allContent.filter(item => item.id !== contentItem.id);
      
      // استخراج ژانرها و تگ‌های محتوای فعلی
      const contentGenres = allGenres
        .filter(genre => this.getContentGenres(contentItem.id, allContent).includes(genre.id));
      
      const contentTags = allTags
        .filter(tag => this.getContentTags(contentItem.id, allContent).includes(tag.id));
      
      // ساخت پرامپت برای مدل AI
      const prompt = this.buildSimilarContentPrompt(contentItem, contentGenres, contentTags, otherContent);
      
      // بررسی وجود کلید API
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'invalid') {
        throw new Error("ANTHROPIC_API_KEY is not available or invalid");
      }
      
      // دریافت پاسخ از مدل
      let responseText = '';
      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 1024,
          system: `You are a content similarity expert for an Iranian movie/TV platform named "Xraynama". 
                   You understand Persian culture and can identify similar movies and shows based on themes, genres, actors, and more.
                   You must respond only with valid JSON containing an array of content IDs in this format:
                   { "similar_content": [1, 42, 67, 13, 95] }`,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });
        
        // پردازش پاسخ
        responseText = typeof response.content[0] === 'object' && 'text' in response.content[0] 
          ? response.content[0].text as string 
          : '';
      } catch (error) {
        console.error("Error in Anthropic API call:", error);
        throw error;
      }
      
      let similarIds: number[] = [];
      
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse && Array.isArray(jsonResponse.similar_content)) {
          similarIds = jsonResponse.similar_content;
        }
      } catch (error) {
        console.error("Error parsing AI response:", error);
        // استخراج اعداد از متن در صورت خطا در پارس کردن JSON
        const idMatches = responseText.match(/\d+/g);
        if (idMatches) {
          similarIds = idMatches.map(Number).slice(0, count);
        }
      }
      
      // فیلتر کردن محتواهایی که وجود دارند
      const similarContent = otherContent.filter(item => similarIds.includes(item.id));
      
      // اگر تعداد محتواهای مشابه کمتر از count باشد، از محتواهای مشابه با الگوریتم محلی استفاده کن
      if (similarContent.length < count) {
        const fallbackSimilar = this.getBasicSimilarContent(
          contentItem, 
          otherContent.filter(item => !similarIds.includes(item.id)),
          allGenres,
          allTags,
          count - similarContent.length
        );
        return [...similarContent, ...fallbackSimilar];
      }
      
      return similarContent.slice(0, count);
    } catch (error) {
      console.error("Error getting AI similar content:", error);
      // در صورت خطا، از الگوریتم محلی برای یافتن محتواهای مشابه استفاده کن
      return this.getBasicSimilarContent(contentItem, allContent.filter(item => item.id !== contentItem.id), allGenres, allTags, count);
    }
  }

  /**
   * ساخت متن درخواست برای توصیه محتوا
   */
  private buildRecommendationPrompt(
    user: User | null,
    userPreferences: any,
    allContent: Content[],
    allGenres: Genre[],
    allTags: Tag[]
  ): string {
    // محتواهای موجود را برای مدل ارسال کن
    const contentData = allContent.map(item => ({
      id: item.id,
      title: item.title,
      englishTitle: item.englishTitle,
      type: item.type,
      year: item.year,
      genres: this.getContentGenres(item.id, allContent).map(genreId => 
        allGenres.find(g => g.id === genreId)?.name || ''
      ),
      tags: this.getContentTags(item.id, allContent).map(tagId => 
        allTags.find(t => t.id === tagId)?.name || ''
      )
    }));
    
    let prompt = `I need personalized content recommendations for ${user ? 'a user' : 'a new visitor'} on our Iranian movie/TV platform.`;
    
    if (user) {
      prompt += `\n\nUser information:
- Username: ${user.username}
- Registration date: ${user.createdAt}
`;
    }
    
    prompt += `\n\nUser preferences:
- Favorite genres: ${userPreferences.genres.join(', ') || 'Unknown'}
- Favorite content types: ${userPreferences.contentTypes.join(', ') || 'Unknown'}
- Watched content IDs: [${userPreferences.watchedContentIds.join(', ')}]
- Favorite content IDs: [${userPreferences.favoriteContentIds.join(', ')}]
`;
    
    prompt += `\n\nAvailable content (limited to first 50 items):
${JSON.stringify(contentData.slice(0, 50), null, 2)}

Consider Persian cultural preferences: Iranian audiences generally prefer family-friendly content, drama, historical, religious stories, and tend to avoid overly sexual or provocative Western content.

Based on this information, recommend ${Math.min(5, allContent.length)} content items from our catalog that would be most interesting for this user. Return ONLY the content IDs in a JSON array. Format: { "recommendations": [id1, id2, id3, ...] }`;

    return prompt;
  }

  /**
   * ساخت متن درخواست برای یافتن محتواهای مشابه
   */
  private buildSimilarContentPrompt(
    contentItem: Content,
    contentGenres: Genre[],
    contentTags: Tag[],
    otherContent: Content[]
  ): string {
    // محتوای مورد نظر
    const contentDetails = {
      id: contentItem.id,
      title: contentItem.title,
      englishTitle: contentItem.englishTitle,
      type: contentItem.type,
      year: contentItem.year,
      genres: contentGenres.map(g => g.name),
      tags: contentTags.map(t => t.name)
    };
    
    // سایر محتواهای موجود
    const otherContentData = otherContent.map(item => ({
      id: item.id,
      title: item.title,
      englishTitle: item.englishTitle,
      type: item.type,
      year: item.year
    }));
    
    let prompt = `I need to find content similar to the following item on our Iranian movie/TV platform:
${JSON.stringify(contentDetails, null, 2)}

Available content to choose from (limited to first 50 items):
${JSON.stringify(otherContentData.slice(0, 50), null, 2)}

Consider Persian cultural context and preferences when finding similar content. Identify content with similar themes, genres, time periods, styles or cultural significance.

Return ONLY the IDs of the 5 most similar content items in a JSON array. Format: { "similar_content": [id1, id2, id3, id4, id5] }`;

    return prompt;
  }
  
  /**
   * استخراج ترجیحات کاربر از تاریخچه و علاقه‌مندی‌ها
   */
  private extractUserPreferences(
    user: User | null,
    watchHistory: any[],
    favorites: Content[],
    allGenres: Genre[],
    allTags: Tag[]
  ): any {
    // محتواهایی که کاربر تماشا کرده است
    const watchedContentIds = watchHistory.map(item => item.contentId);
    const watchedContent = watchHistory.map(item => item.content).filter(Boolean);
    
    // محتواهای مورد علاقه کاربر
    const favoriteContentIds = favorites.map(item => item.id);
    
    // ژانرهای مورد علاقه کاربر
    const genreCounts: { [key: string]: number } = {};
    [...watchedContent, ...favorites].forEach(content => {
      if (!content) return;
      
      const contentGenreIds = this.getContentGenres(content.id, [...watchedContent, ...favorites]);
      contentGenreIds.forEach(genreId => {
        const genre = allGenres.find(g => g.id === genreId);
        if (genre) {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        }
      });
    });
    
    // انواع محتوای مورد علاقه کاربر
    const contentTypeCounts: { [key: string]: number } = {};
    [...watchedContent, ...favorites].forEach(content => {
      if (!content || !content.type) return;
      contentTypeCounts[content.type] = (contentTypeCounts[content.type] || 0) + 1;
    });
    
    // مرتب‌سازی و انتخاب موارد پرتکرار
    const genres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    const contentTypes = Object.entries(contentTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    return {
      genres,
      contentTypes,
      watchedContentIds,
      favoriteContentIds
    };
  }
  
  /**
   * روش ساده برای یافتن محتواهای محبوب
   */
  private getPopularContent(allContent: Content[], count: number): Content[] {
    // در این پیاده‌سازی ساده، محتواها را بر اساس سال انتشار مرتب می‌کنیم
    return [...allContent]
      .sort((a, b) => b.year - a.year)
      .slice(0, count);
  }
  
  /**
   * روش ساده برای یافتن محتواهای مشابه
   */
  private getBasicSimilarContent(
    contentItem: Content,
    otherContent: Content[],
    allGenres: Genre[],
    allTags: Tag[],
    count: number
  ): Content[] {
    // ژانرها و تگ‌های محتوای مورد نظر
    const contentGenreIds = this.getContentGenres(contentItem.id, [contentItem, ...otherContent]);
    const contentTagIds = this.getContentTags(contentItem.id, [contentItem, ...otherContent]);
    
    // محاسبه امتیاز شباهت برای هر محتوا
    const contentWithSimilarity = otherContent.map(item => {
      const itemGenreIds = this.getContentGenres(item.id, [contentItem, ...otherContent]);
      const itemTagIds = this.getContentTags(item.id, [contentItem, ...otherContent]);
      
      // تعداد ژانرهای مشترک
      const commonGenres = itemGenreIds.filter(id => contentGenreIds.includes(id)).length;
      
      // تعداد تگ‌های مشترک
      const commonTags = itemTagIds.filter(id => contentTagIds.includes(id)).length;
      
      // امتیاز بر اساس شباهت نوع، سال، ژانرها و تگ‌ها
      let score = 0;
      
      // نوع محتوا یکسان
      if (item.type === contentItem.type) {
        score += 2;
      }
      
      // سال انتشار نزدیک (در محدوده 5 سال)
      if (Math.abs(item.year - contentItem.year) <= 5) {
        score += 1;
      }
      
      // ژانرهای مشترک (هر ژانر 2 امتیاز)
      score += commonGenres * 2;
      
      // تگ‌های مشترک (هر تگ 1 امتیاز)
      score += commonTags;
      
      return { content: item, score };
    });
    
    // مرتب‌سازی بر اساس امتیاز شباهت و انتخاب count مورد اول
    return contentWithSimilarity
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.content);
  }
  
  /**
   * دریافت ژانرهای یک محتوا (پیاده‌سازی ساده)
   */
  private getContentGenres(contentId: number, allContent: any[]): number[] {
    // در این پیاده‌سازی ساده فرض می‌کنیم هر محتوا دارای ویژگی genres است
    const content = allContent.find(item => item.id === contentId);
    if (content && content.genres && Array.isArray(content.genres)) {
      return content.genres;
    }
    return [];
  }
  
  /**
   * دریافت تگ‌های یک محتوا (پیاده‌سازی ساده)
   */
  private getContentTags(contentId: number, allContent: any[]): number[] {
    // در این پیاده‌سازی ساده فرض می‌کنیم هر محتوا دارای ویژگی tags است
    const content = allContent.find(item => item.id === contentId);
    if (content && content.tags && Array.isArray(content.tags)) {
      return content.tags;
    }
    return [];
  }
}

// ایجاد نمونه واحد از سرویس
export const aiRecommendationService = new AIRecommendationService();