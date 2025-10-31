import { useEffect, useState } from 'react';
import { ArrowRightLeft, ArrowDown, ArrowUp, Repeat, Calendar, MapPin, PackageCheck, Trash2, ShoppingCart } from 'lucide-react';
import { inventoryService } from '../../services';

// 참고: 공장(위치) id를 이름으로 매핑할 경우 factory id/name 맵 필요 (간단 구현)
const FACTORY_NAMES = {
  1: '1공장',
  2: '2공장',
  3: '원자재창고',
  // 필요시 추가
};

// type별 라벨, 색상, 아이콘, etc 매핑
const TYPE_STYLE = {
  '입고': {
    label: '입고',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <ArrowDown className="h-4 w-4" />,
    badgeAnim: 'animate-pulse'
  },
  '이동': {
    label: '이동',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: <ArrowRightLeft className="h-4 w-4 animate-shake-x" />,
    badgeAnim: 'animate-pulse'
  },
  '소모': {
    label: '소모',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: <Trash2 className="h-4 w-4" />,
    badgeAnim: ''
  },
  '출고': {
    label: '출고',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: <ArrowUp className="h-4 w-4" />,
    badgeAnim: ''
  },
  '구매': {
    label: '구매',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <ShoppingCart className="h-4 w-4" />,
    badgeAnim: ''
  },
};

function TypeBadge({ type }) {
  const info = TYPE_STYLE[type] ?? {
    label: type || '-',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: <PackageCheck className="h-4 w-4" />,
    badgeAnim: ''
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${info.color} text-xs font-semibold transition-all shadow-sm ${info.badgeAnim}`}
      style={{
        whiteSpace: 'nowrap',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      title={info.label}
    >
      {info.icon}
      <span className="truncate">{info.label}</span>
    </span>
  );
}

// row별 등장 애니메이션 적용
const TransferStatus = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 등장효과용
  const [animateKey, setAnimateKey] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await inventoryService.getMovements();
        const data = Array.isArray(res?.data) ? res.data : [];
        setRows(data);
        setAnimateKey(v => v + 1);
      } catch (e) {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center space-x-2">
        <ArrowRightLeft className="h-5 w-5 text-[#674529]" />
        <h3 className="text-lg font-semibold text-[#674529] whitespace-nowrap">최근 이동 및 입출 이력</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed"> {/* table-fixed 적용 */}
          <colgroup>
            <col style={{ width: "110px" }} />
            <col style={{ width: "85px" }} />
            <col style={{ width: "170px" }} />
            <col style={{ width: "70px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "auto" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">일시</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">유형</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">품목</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">수량</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">출발</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">도착</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">담당자</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>불러오는 중…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-gray-500" colSpan={8}>이력이 없습니다.</td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={i}
                  className={`hover:bg-gray-50/60 transition-all duration-500 animate-fadeinup`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* 일시 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400 animate-fadepop shrink-0" />
                      <span className="truncate" title={r.time}>{r.time || '-'}</span>
                    </div>
                  </td>
                  {/* 유형 - 입고/이동/소모/구매 등 */}
                  <td className="px-4 py-3 text-sm whitespace-nowrap max-w-[80px] overflow-hidden">
                    <div className="max-w-full overflow-hidden">
                      <TypeBadge type={r.type} />
                    </div>
                  </td>
                  {/* 품목 */}
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-[170px] overflow-hidden">
                    <span className="truncate block" title={r.category}>
                      {r.category || '-'}
                    </span>
                    <span className="text-xs text-gray-500 ml-1 truncate" title={r.code}>
                      ({r.code || '-'})
                    </span>
                  </td>
                  {/* 수량 */}
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap max-w-[60px] overflow-hidden text-ellipsis">
                    <span className="truncate" title={r.quantity}>{r.quantity || '-'}</span>
                  </td>
                  {/* 출발 */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[120px] overflow-hidden">
                    <div className="flex items-center space-x-1 min-w-0 max-w-full">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate" title={
                        r.fromLocation
                          ? (FACTORY_NAMES[r.fromLocation] || `ID:${r.fromLocation}`)
                          : '-'
                      }>
                        {r.fromLocation
                          ? (FACTORY_NAMES[r.fromLocation] || `ID:${r.fromLocation}`)
                          : '-'}
                      </span>
                    </div>
                  </td>
                  {/* 도착 */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[120px] overflow-hidden">
                    <div className="flex items-center space-x-1 min-w-0 max-w-full">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="truncate" title={
                        r.toLocation
                          ? (FACTORY_NAMES[r.toLocation] || `ID:${r.toLocation}`)
                          : '-'
                        }>
                        {r.toLocation
                          ? (FACTORY_NAMES[r.toLocation] || `ID:${r.toLocation}`)
                          : '-'}
                      </span>
                    </div>
                  </td>
                  {/* 담당자 */}
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[110px] overflow-hidden">
                    <span className="truncate block" title={r.manager}>{r.manager || '-'}</span>
                  </td>
                  {/* 비고 */}
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px] overflow-hidden">
                    <span className="truncate block" title={r.note}>{r.note || '-'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* 커스텀 엔트리 애니메이션 */}
        <style>{`
          @keyframes fadeinup {
            from {opacity:0; transform: translateY(16px);}
            to {opacity:1; transform: none;}
          }
          .animate-fadeinup {
            animation: fadeinup 0.6s cubic-bezier(0.19,1,0.22,1) both;
          }
          @keyframes fadepop {
            from {opacity:0; transform:scale(0.9);}
            to {opacity:1; transform:scale(1);}
          }
          .animate-fadepop {
            animation: fadepop 0.3s cubic-bezier(0.45,0.01,0.15,1.01) both;
          }
          .animate-spin-slow {
            animation: spin 2.6s linear infinite;
          }
          @keyframes shake-x {
            0% { transform: translateX(0);}
            20% { transform: translateX(2px);}
            40% { transform: translateX(-2px);}
            60% { transform: translateX(2px);}
            80% { transform: translateX(-2px);}
            100% { transform: translateX(0);}
          }
          .animate-shake-x {
            animation: shake-x 0.7s cubic-bezier(0.4, 0, 0.2, 1) 2;
          }
          /* 긴 텍스트 줄바꿈 방지 */
          .truncate {
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: block !important;
          }
          th, td {
            min-width: 0 !important;
          }
        `}
        </style>
      </div>
    </div>
  );
};

export default TransferStatus;