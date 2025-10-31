import apiClient from './api';

/**
 * 품목 관리 API 서비스
 * Base Path: /api/items
 * 
 * 주의: Request Body는 camelCase로 보내야 함
 * - factoryId (O) / factory_id (X)
 * - shelfLife (O) / expiration_date (X)
 * - wholesalePrice (O) / wholesale_price (X)
 */

/**
 * 카테고리 한글 -> 영문 변환
 */
const categoryMap = {
  '원재료': 'RawMaterial',
  '반제품': 'SemiFinished',
  '완제품': 'Finished',
  '소모품': 'Supply',
};

const itemService = {
  /**
   * 품목 목록 조회
   * GET /api/items
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/items', { params });
    return response.data;
  },

  /**
   * 품목 상세 조회 (ID)
   * GET /api/items/id/:id
   * @param {number} id - 품목 ID
   * @returns {Promise}
   */
  getByIdDetail: async (id) => {
    const response = await apiClient.get(`/items/id/${id}`);
    return response.data;
  },

  /**
   * 품목 상세 조회 (코드)
   * GET /api/items/code/:code
   * @param {string} code - 품목 코드
   * @returns {Promise}
   */
  getByCode: async (code) => {
    const response = await apiClient.get(`/items/code/${code}`);
    return response.data;
  },

  /**
   * 품목 생성
   * POST /api/items
   * @param {Object} itemData - 품목 데이터
   * @param {string} itemData.code - 품목 코드 (필수)
   * @param {string} itemData.name - 품목명 (필수)
   * @param {string} itemData.category - 카테고리 (필수)
   * @param {string} itemData.unit - 단위 (필수)
   * @param {number} itemData.factoryId - 공장 ID (필수, camelCase)
   * @param {number} itemData.shortage - 재고 부족 기준 수량 (선택)
   * @param {number} itemData.shelfLife - 유통기한 일수 (선택, camelCase)
   * @param {number} itemData.wholesalePrice - 도매가 (선택, camelCase)
   * @returns {Promise}
   */
  create: async (itemData) => {
    // 한글 카테고리를 영문으로 변환
    const category = categoryMap[itemData.category] || itemData.category;

    const payload = {
      code: itemData.code,
      name: itemData.name,
      category: category,
      unit: itemData.unit,
      factoryId: itemData.factoryId, // camelCase
      shortage: itemData.shortage,
      shelfLife: itemData.shelfLife, // camelCase
      wholesalePrice: itemData.wholesalePrice, // camelCase
    };

    const response = await apiClient.post('/items', payload);
    return response.data;
  },

  /**
   * 품목 수정
   * PATCH /api/items/:id
   * @param {number} id - 품목 ID
   * @param {Object} itemData - 수정할 품목 데이터
   * @returns {Promise}
   */
  update: async (id, itemData) => {
    // 한글 카테고리를 영문으로 변환
    if (itemData.category && categoryMap[itemData.category]) {
      itemData.category = categoryMap[itemData.category];
    }

    const response = await apiClient.patch(`/items/${id}`, itemData);
    return response.data;
  },

  /**
   * 품목 삭제
   * DELETE /api/items/:id
   * @param {number} id - 품목 ID
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await apiClient.delete(`/items/${id}`);
    return response.data;
  },

  /**
   * 품목 검색
   * GET /api/items?search=검색어
   * @param {string} searchTerm - 검색어
   * @returns {Promise}
   */
  search: async (searchTerm) => {
    const response = await apiClient.get('/items', { params: { search: searchTerm } });
    return response.data;
  },

  /**
   * 카테고리별 품목 조회
   * GET /api/items?category=카테고리
   * @param {string} category - 카테고리 (한글 또는 영문)
   * @returns {Promise}
   */
  getByCategory: async (category) => {
    const englishCategory = categoryMap[category] || category;
    const response = await apiClient.get('/items', { params: { category: englishCategory } });
    return response.data;
  },
};

export default itemService;

