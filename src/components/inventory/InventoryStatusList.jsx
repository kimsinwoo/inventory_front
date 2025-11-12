import { useEffect, useMemo, useState } from "react";
import { MapPin, Clock, Search, Package } from "lucide-react";
import { inventoryAPI } from "../../api";

export default function InventoryStatusList({ filters }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInventories = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filters?.category && filters.category !== '전체') {
          params.category = filters.category;
        }
        if (filters?.status && filters.status !== '전체') {
          params.status = filters.status === '정상' ? 'Normal' : filters.status === '재고부족' ? 'LowStock' : filters.status === '임박' ? 'Expiring' : 'Expired';
        }
        if (filters?.searchTerm) {
          params.search = filters.searchTerm;
        }
        const response = await inventoryAPI.getInventories(params);
        const data = response.data?.data || response.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('재고 목록 로드 실패:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadInventories();
  }, [filters]);

  /**
   * 클라이언트 측 필터링
   *
   * Redux에서 가져온 데이터를 filters prop으로 필터링
   * useMemo로 성능 최적화 (items나 filters가 바뀔 때만 재계산)
   */
  const filteredItems = useMemo(() => {
    if (!filters || items.length === 0) return items;

    return items.filter((item) => {
      // 1. 카테고리 필터
      if (filters.category && filters.category !== '전체') {
        // 안전하게 문자열 추출
        const getStringValue = (value) => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'object') {
            return value.category || value.categoryLabel || value.name || value.code || '';
          }
          return String(value) || '';
        };
        
        const itemObj = item?.Item;
        let itemCategory = '';
        
        if (itemObj && typeof itemObj === 'object' && itemObj !== null && !Array.isArray(itemObj)) {
          itemCategory = getStringValue(itemObj.category || itemObj.categoryLabel);
        }
        
        if (!itemCategory) itemCategory = getStringValue(item?.category || item?.categoryLabel);
        
        if (itemCategory !== filters.category) {
          return false;
        }
      }

      // 2. 상태 필터 (이미 API에서 필터링됨)
      if (filters.status && filters.status !== '전체') {
        // API에서 이미 필터링되므로 여기서는 스킵
      }

      // 3. 창고 필터
      if (filters.warehouse && filters.warehouse !== '전체') {
        // 안전하게 문자열 추출
        const getStringValue = (value) => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'object') {
            return value.name || value.factoryName || value.code || '';
          }
          return String(value) || '';
        };
        
        const factoryObj = item?.Factory;
        let factoryName = '';
        
        if (factoryObj && typeof factoryObj === 'object' && factoryObj !== null && !Array.isArray(factoryObj)) {
          factoryName = getStringValue(factoryObj.name);
        }
        
        if (!factoryName) factoryName = getStringValue(item?.factory_name || item?.factory);
        
        if (!factoryName.includes(filters.warehouse)) {
          return false;
        }
      }

      // 4. 검색어 필터 (품목명, 품목코드, 바코드번호)
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const search = filters.searchTerm.toLowerCase().trim();
        
        // 안전하게 문자열 추출
        const getStringForSearch = (value) => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return value.toLowerCase();
          if (typeof value === 'number') return String(value).toLowerCase();
          if (typeof value === 'object') {
            return (value.name || value.code || value.itemName || value.itemCode || '').toLowerCase();
          }
          return String(value).toLowerCase();
        };
        
        const itemObj = item?.Item;
        let itemName = '';
        let itemCode = '';
        
        if (itemObj && typeof itemObj === 'object' && itemObj !== null && !Array.isArray(itemObj)) {
          itemName = getStringForSearch(itemObj.name || itemObj.itemName);
          itemCode = getStringForSearch(itemObj.code || itemObj.itemCode);
        }
        
        if (!itemName) itemName = getStringForSearch(item?.item_name || item?.item);
        if (!itemCode) itemCode = getStringForSearch(item?.item_code || item?.code);
        
        const lotNumber = getStringForSearch(item?.lot_number || item?.lotNumber);

        if (!itemName.includes(search) &&
            !itemCode.includes(search) &&
            !lotNumber.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [items, filters]);

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-[#674529]" />
          <h3 className="text-base text-[#674529]">
            재고 현황 ({filteredItems.length}건
            {items.length !== filteredItems.length && ` / 전체 ${items.length}건`})
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">품목코드</th>
              <th className="px-4 py-3 text-left text-sm font-medium">품목명</th>
              <th className="px-4 py-3 text-left text-sm font-medium">카테고리</th>
              <th className="px-4 py-3 text-left text-sm font-medium">재고량</th>
              <th className="px-4 py-3 text-left text-sm font-medium">창고/위치</th>
              <th className="px-4 py-3 text-left text-sm font-medium">바코드번호</th>
              <th className="px-4 py-3 text-left text-sm font-medium">유통기한</th>
              <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
              <th className="px-4 py-3 text-left text-sm font-medium">이력</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Redux loading 상태로 로딩 표시 */}
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={9}>
                  불러오는 중…
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={9}>
                  {items.length === 0
                    ? '데이터가 없습니다.'
                    : '필터 조건에 맞는 재고가 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredItems.map((d) => {
                const expiryDate = d?.expiry_date || d?.expiryDate || d?.expirationDate;
                const expirationDate = expiryDate ? new Date(expiryDate) : null;
                const daysLeft = expirationDate ? Math.ceil((expirationDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                const daysLabel = daysLeft >= 0 ? `- ${daysLeft}일` : `+ ${Math.abs(daysLeft)}일`;
                
                const status = d?.status || (daysLeft < 0 ? 'Expired' : daysLeft < 7 ? 'Expiring' : d?.quantity < (d?.shortage || 0) ? 'LowStock' : 'Normal');
                const statusLabel = status === 'Normal' ? '정상' : status === 'LowStock' ? '재고부족' : status === 'Expiring' ? '임박' : '만료';
                const badge =
                  status === "Normal"
                    ? "bg-green-100 text-green-700"
                    : status === "LowStock"
                    ? "bg-yellow-100 text-yellow-700"
                    : status === "Expiring"
                    ? "bg-red-100 text-red-700"
                    : "bg-red-100 text-red-700";

                // 안전하게 문자열 추출 (객체인 경우 처리)
                const getStringValue = (value, fallback = '') => {
                  if (value === null || value === undefined) return fallback;
                  if (typeof value === 'string') return value;
                  if (typeof value === 'number') return String(value);
                  if (typeof value === 'object') {
                    // 객체인 경우 name, code, category 등 속성에서 추출 시도
                    return value.name || value.code || value.category || value.itemName || value.itemCode || fallback;
                  }
                  return String(value) || fallback;
                };

                // Item 객체에서 안전하게 추출
                const itemObj = d?.Item;
                let itemName = '';
                let itemCode = '';
                let category = '';
                let unit = '';

                if (itemObj && typeof itemObj === 'object' && itemObj !== null && !Array.isArray(itemObj)) {
                  itemName = getStringValue(itemObj.name || itemObj.itemName);
                  itemCode = getStringValue(itemObj.code || itemObj.itemCode);
                  category = getStringValue(itemObj.category || itemObj.categoryLabel);
                  unit = getStringValue(itemObj.unit);
                }

                // Item 객체에서 찾지 못한 경우 직접 필드에서 추출
                if (!itemName) itemName = getStringValue(d?.item_name || d?.item);
                if (!itemCode) itemCode = getStringValue(d?.item_code || d?.code);
                if (!category) category = getStringValue(d?.category || d?.categoryLabel);
                if (!unit) unit = getStringValue(d?.unit);

                const quantity = d?.quantity || 0;
                const factoryName = getStringValue(d?.Factory?.name || d?.factory_name || d?.factory);
                const lotNumber = getStringValue(d?.lot_number || d?.lotNumber);

                return (
                  <tr key={d.id || d.item_id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{itemCode || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{itemName || '-'}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{category || '-'}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{`${quantity} ${unit || ''}`}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 text-[#674529]" />
                        <span>{factoryName || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{lotNumber || '-'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-700">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{expiryDate ? expiryDate.split('T')[0] : ''} {daysLabel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded px-3 py-1 text-xs font-medium ${badge}`}>{statusLabel}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-gray-500 transition-colors hover:text-[#674529]">
                        <Search className="h-5 w-5 text-[#674529]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
