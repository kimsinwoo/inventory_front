import { useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, Package } from "lucide-react";
import { inventoryService } from "../../services";

export default function InventoryAlertsSummary() {
  const [summary, setSummary] = useState({ lowStock: 0, expiringSoon: 0 });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await inventoryService.getSummary();
        if (alive) setSummary(res?.data ?? summary);
      } catch (e) {
        // ignore
      }
    })();
    return () => { alive = false; };
  }, []);

  const alerts = [
    {
      icon: AlertTriangle,
      title: "유통기한 임박",
      titleColor: "text-[#9f0712]",
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
      items: [{ label: `${summary.expiringSoon}개 품목이 3일 내 유통기한 만료`, textColor: "text-red-600" }],
    },
    {
      icon: Package,
      title: "재고 부족",
      titleColor: "text-[#8f530b]",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-500",
      items: [{ label: `${summary.lowStock}개 품목이 안전재고 미만`, textColor: "text-yellow-600" }],
    },
    {
      icon: TrendingUp,
      title: "재고 회전",
      titleColor: "text-[#016630]",
      bgColor: "bg-green-50",
      iconColor: "text-green-500",
      items: [{ label: "평균 재고회전일: 15일", textColor: "text-green-600" }],
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[#674529]" />
        <h2 className="text-lg text-[#674529]">주의사항 요약</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {alerts.map((a, i) => (
          <div key={i} className={`${a.bgColor} rounded-lg p-5`}>
            <div className="mb-3 flex items中心 gap-2">
              <a.icon className={`h-5 w-5 ${a.iconColor}`} />
              <h3 className={`font-semibold ${a.titleColor}`}>{a.title}</h3>
            </div>
            {a.items.map((it, j) => (
              <p key={j} className={`text-sm font-medium ${it.textColor}`}>{it.label}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
