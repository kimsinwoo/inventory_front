import { useState, useEffect } from 'react';
import { Truck, Package, Box } from 'lucide-react';
import { warehouseTransfersAPI } from '../../api';

const TransferStatus = () => {
  const [selectedTransport, setSelectedTransport] = useState('전체');
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransfers = async () => {
      try {
        setLoading(true);
        const response = await warehouseTransfersAPI.getHistory();
        const data = response.data?.data || response.data || [];
        const transfersList = Array.isArray(data) ? data : [];
        
        // API 데이터를 컴포넌트 형식에 맞게 변환
        const formattedTransfers = transfersList.map((t) => {
          const sourceFactory = t.sourceFactoryId || t.SourceFactory?.id || 1;
          const destFactory = t.destFactoryId || t.DestFactory?.id || 2;
          const itemName = t.Item?.name || t.item_name || '품목명 없음';
          const quantity = t.quantity || 0;
          const unit = t.Item?.unit || t.unit || '';
          
          return {
            id: t.id,
            route: `${sourceFactory}공장 → ${destFactory}공장`,
            status: t.status === 'COMPLETED' ? '이동완료' : t.status === 'IN_PROGRESS' ? '이동중' : '이동대기',
            departureDate: t.created_at ? t.created_at.split('T')[0] : '',
            quantity: `${quantity} ${unit}`,
            item: itemName,
            transport: t.transport_method || t.transportMethod || '트럭',
          };
        });
        
        setTransfers(formattedTransfers);
      } catch (error) {
        console.error('이송 현황 로드 실패:', error);
        setTransfers([]);
      } finally {
        setLoading(false);
      }
    };
    loadTransfers();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case '이동완료':
        return 'bg-green-100 text-green-700';
      case '이동대기':
        return 'bg-blue-100 text-blue-700';
      case '이동중':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTransfers =
    selectedTransport === '전체'
      ? transfers
      : transfers.filter((t) => t.transport === selectedTransport);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#674529]">이송 현황</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">이송경로</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">상태</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">운송방식</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">출발일</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">품목</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">수량</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  불러오는 중...
                </td>
              </tr>
            ) : filteredTransfers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-gray-500">
                  등록된 이송 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredTransfers.map((transfer, index) => (
                <tr key={transfer.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-700">{transfer.route}</td>
                <td className="py-3 px-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      transfer.status
                    )}`}
                  >
                    {transfer.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {transfer.transport}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{transfer.departureDate}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{transfer.item}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{transfer.quantity}</td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferStatus;
