const db = require("../db");

class SearchModel {
  // Genel arama - tüm entity tipleri
  static async search(query, limit = 10, offset = 0) {
    try {
      // Kullanıcılar için arama
      const userQuery = `
        SELECT id, username, email, 'user' as type
        FROM users
        WHERE username ILIKE $1 OR email ILIKE $1
        LIMIT $2 OFFSET $3
      `;

      // Topluluklar için arama
      const communityQuery = `
        SELECT id, name, description, 'community' as type
        FROM communities
        WHERE name ILIKE $1 OR description ILIKE $1
        LIMIT $2 OFFSET $3
      `;

      // Gönderiler için arama
      const postQuery = `
        SELECT id, title, content, user_id, community_id, 'post' as type
        FROM posts
        WHERE title ILIKE $1 OR content ILIKE $1
        LIMIT $2 OFFSET $3
      `;

      const searchTerm = `%${query}%`;

      const [usersResult, communitiesResult, postsResult] = await Promise.all([
        db.query(userQuery, [searchTerm, limit, offset]),
        db.query(communityQuery, [searchTerm, limit, offset]),
        db.query(postQuery, [searchTerm, limit, offset]),
      ]);

      return {
        users: usersResult.rows,
        communities: communitiesResult.rows,
        posts: postsResult.rows,
        total:
          usersResult.rows.length +
          communitiesResult.rows.length +
          postsResult.rows.length,
      };
    } catch (error) {
      console.error("Arama modeli hatası:", error);
      throw error;
    }
  }

  // Sadece kullanıcı araması
  static async searchUsers(query, limit = 10, offset = 0) {
    try {
      const userQuery = `
        SELECT id, username, email
        FROM users
        WHERE username ILIKE $1 OR email ILIKE $1
        LIMIT $2 OFFSET $3
      `;

      const searchTerm = `%${query}%`;
      const result = await db.query(userQuery, [searchTerm, limit, offset]);

      return {
        users: result.rows,
        total: result.rows.length,
      };
    } catch (error) {
      console.error("Kullanıcı arama modeli hatası:", error);
      throw error;
    }
  }

  // Sadece topluluk araması
  static async searchCommunities(query, limit = 10, offset = 0) {
    try {
      const communityQuery = `
        SELECT id, name, description
        FROM communities
        WHERE name ILIKE $1 OR description ILIKE $1
        LIMIT $2 OFFSET $3
      `;

      const searchTerm = `%${query}%`;
      const result = await db.query(communityQuery, [
        searchTerm,
        limit,
        offset,
      ]);

      return {
        communities: result.rows,
        total: result.rows.length,
      };
    } catch (error) {
      console.error("Topluluk arama modeli hatası:", error);
      throw error;
    }
  }

  // Sadece gönderi araması
  static async searchPosts(query, limit = 10, offset = 0) {
    try {
      const postQuery = `
        SELECT id, title, content, user_id, community_id
        FROM posts
        WHERE title ILIKE $1 OR content ILIKE $1
        LIMIT $2 OFFSET $3
      `;

      const searchTerm = `%${query}%`;
      const result = await db.query(postQuery, [searchTerm, limit, offset]);

      return {
        posts: result.rows,
        total: result.rows.length,
      };
    } catch (error) {
      console.error("Gönderi arama modeli hatası:", error);
      throw error;
    }
  }
}

module.exports = SearchModel;
