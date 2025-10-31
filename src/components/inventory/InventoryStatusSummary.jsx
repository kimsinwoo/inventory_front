import { useEffect, useState } from "react";
import { Package, AlertTriangle, Clock, MapPin } from "lucide-react";
import { inventoryService } from "../../services";

export default function InventoryStatusSummary() {
  const [data, setData] = useState({
    totalItems: 0,
    lowStock: 0,
    expiringSoon: 0,
    expired: 0,
    warehouseCount: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await inventoryService.getSummary();
        const summaryData = response.data || response;
        setData(summaryData);
      } catch (err) {
        console.error("재고 요약 데이터 불러오기 실패:", err);
      }
    };
    fetchSummary();
  }, []);

  const summaryCards = [
    { id: 1, title: "총 품목수", value: data.totalItems, icon: <Package className="h-6 w-6" />, bgColor: "bg-[#724323]", iconTextColor: "text-[#fff]" },
    { id: 2, title: "부족 재고", value: data.lowStock, icon: <AlertTriangle className="h-6 w-6" />, bgColor: "bg-[#fef9c2]", iconTextColor: "text-[#d08700]" },
    { id: 3, title: "유통기한 임박", value: data.expiringSoon, icon: <Clock className="h-6 w-6" />, bgColor: "bg-[#ffedd4]", iconTextColor: "text-[#f65814]" },
    { id: 4, title: "창고 수", value: data.warehouseCount, icon: <MapPin className="h-6 w-6" />, bgColor: "bg-[#A3C478]", iconTextColor: "text-[#fff]" },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      {summaryCards.map((c) => (
        <div key={c.id} className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-600">{c.title}</p>
              <p className="text-3xl font-bold text-[#674529]">{c.value}</p>
            </div>
            <div className={`h-14 w-14 ${c.bgColor} flex items-center justify-center rounded-xl`}>
              <div className={c.iconTextColor}>{c.icon}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
