import { useEffect, useState } from "react";
<<<<<<< HEAD
import { useDispatch, useSelector } from "react-redux";
import { Clock } from "lucide-react";
import { fetchInventoryMovements } from "../../store/modules/inventory/actions";
import { selectInventoryMovements } from "../../store/modules/inventory/selectors";
import Pagination from "../common/Pagination";
=======
import { Clock } from "lucide-react";
import { inventoryTransactionsAPI } from "../../api";
>>>>>>> origin/label-print

const typeBadge = (type) => {
  if (type === "입고") return "bg-blue-50 text-blue-600";
  if (type === "출고") return "bg-red-50 text-red-600";
  if (type === "생산") return "bg-green-50 text-green-600";
  if (type === "이동") return "bg-yellow-50 text-yellow-600";
  return "bg-gray-50 text-gray-600";
};

const qtyColor = (q) => {
  const s = String(q).trim();
  if (s.startsWith("+")) return "text-green-600";
  if (s.startsWith("-")) return "text-red-600";
  return "text-gray-900";
};

export default function InventoryMovementList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const response = await inventoryTransactionsAPI.getTransactions({ page: 1, limit: 50 });
        const data = response.data?.data || response.data || [];
        const transactions = Array.isArray(data) ? data : [];
        
        // API 데이터를 컴포넌트 형식에 맞게 변환
        const formattedRows = transactions.map((t) => {
          const typeMap = {
            'RECEIVE': '입고',
            'ISSUE': '소모',
            'TRANSFER': '이동',
          };
          return {
            time: t.created_at ? new Date(t.created_at).toLocaleString('ko-KR') : '',
            type: typeMap[t.type] || t.type,
            category: t.Item?.name || t.item_name || '',
            code: t.Item?.code || t.item_code || '',
            lotNumber: t.lot_number || '',
            quantity: t.type === 'RECEIVE' ? `+${t.quantity || 0}` : `-${t.quantity || 0}`,
            fromLocation: t.sourceFactoryId ? `공장${t.sourceFactoryId}` : t.from_location || '',
            toLocation: t.destFactoryId ? `공장${t.destFactoryId}` : t.to_location || t.Factory?.name || '',
            manager: t.User?.username || t.actor_name || '',
            note: t.note || '',
          };
        });
        
        setRows(formattedRows);
      } catch (error) {
        console.error('재고 이동 이력 로드 실패:', error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    loadMovements();
  }, []);

  // 페이지네이션 계산
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = rows.slice(startIndex, endIndex);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#674529]" />
        <h2 className="text-lg text-[#674529]">재고 이동 이력</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">시간</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">유형</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">품목</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">바코드번호</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">수량</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">출발지</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">도착지</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">담당자</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-sm text-gray-500" colSpan={9}>불러오는 중…</td></tr>
            ) : paginatedRows.map((m, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{m.time}</td>
                <td className="px-4 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${typeBadge(m.type)}`}>{m.type}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{m.category}</div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">{m.lotNumber}</td>
                <td className="px-4 py-4"><span className={`text-sm font-semibold ${qtyColor(m.quantity)}`}>{m.quantity}</span></td>
                <td className="px-4 py-4 text-sm text-gray-900">{m.fromLocation}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{m.toLocation}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{m.manager}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr><td className="px-4 py-6 text-sm text-gray-500" colSpan={9}>이력이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={rows.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
