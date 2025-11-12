import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { inventoryAPI } from "../../api";

export default function WarehouseUtilization() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUtilization();
  }, []);

  const loadUtilization = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getUtilization();
      const data = response.data?.data || response.data || [];
      const utilizationList = Array.isArray(data) ? data : [];
      
      // API 데이터를 컴포넌트 형식에 맞게 변환
      const formattedData = utilizationList.map(item => ({
        factory: item.factory || { code: item.factory_code || item.factory_name, name: item.factory_name },
        percentage: item.percentage || item.utilization_rate || 0,
        itemCount: item.item_count || item.items_count || 0,
        note: item.note || item.description || '',
      }));
      
      setRows(formattedData);
    } catch (error) {
      console.error('창고 이용률 로드 실패:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-[#674529]" />
        <h2 className="text-lg text-[#674529]">창고별 이용률</h2>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">불러오는 중...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">창고 이용률 데이터가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {rows.map((w, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#674529]">{w.factory?.code ?? w.factory?.name}</h3>
              <span className={`rounded px-3 py-1 text-sm font-semibold ${w.percentage >= 85 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                {w.percentage}%
              </span>
            </div>
            <div className="mb-3">
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>보관 품목</span>
                <span className="font-semibold text-gray-900">{w.itemCount}개</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className={`h-2 rounded-full ${w.percentage >= 85 ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${w.percentage}%` }} />
              </div>
            </div>
            <p className="text-sm text-gray-500">{w.note}</p>
          </div>
          ))}
        </div>
      )}
    </div>
  );
}
