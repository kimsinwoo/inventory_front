import { useState, useEffect } from 'react';
import { ArrowRightLeft, Package, MapPin } from 'lucide-react';
import { warehouseTransferService, itemService, factoryService } from '../../services';

const WarehouseTransfer = () => {
  const [items, setItems] = useState([]);
  const [factories, setFactories] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    itemId: '',
    sourceLocationId: '',
    destLocationId: '',
    quantity: '',
    unit: 'EA',
    transferType: 'OTHER',
    note: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, factoriesRes, historyRes] = await Promise.all([
        itemService.getAll(),
        factoryService.getAll(),
        warehouseTransferService.getHistory({ limit: 20 }),
      ]);

      setItems(itemsRes.data || itemsRes || []);
      setFactories(factoriesRes.data || factoriesRes || []);
      setTransferHistory(historyRes.data || historyRes.rows || historyRes || []);
    } catch (err) {
      console.error('데이터 조회 실패:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemId || !formData.sourceLocationId || !formData.destLocationId || !formData.quantity) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.sourceLocationId === formData.destLocationId) {
      alert('출발지와 도착지가 같을 수 없습니다.');
      return;
    }

    setLoading(true);
    try {
      await warehouseTransferService.create({
        itemId: parseInt(formData.itemId),
        sourceLocationId: parseInt(formData.sourceLocationId),
        destLocationId: parseInt(formData.destLocationId),
        storageConditionId: 1, // 기본값 (백엔드에서 처리)
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        transferType: formData.transferType,
        note: formData.note || undefined,
      });

      alert('창고 이동이 완료되었습니다!');
      setFormData({
        itemId: '',
        sourceLocationId: '',
        destLocationId: '',
        quantity: '',
        unit: 'EA',
        transferType: 'OTHER',
        note: '',
      });
      fetchData();
    } catch (err) {
      console.error('창고 이동 실패:', err);
      alert(err.customMessage || '창고 이동에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 창고 이동 폼 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <ArrowRightLeft className="h-5 w-5 text-[#674529]" />
          <h3 className="text-lg font-semibold text-[#674529]">창고 이동 등록</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 품목 선택 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              품목 <span className="text-red-500">*</span>
            </label>
            <select
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            >
              <option value="">품목을 선택하세요</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* 출발지 / 도착지 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                출발 공장 <span className="text-red-500">*</span>
              </label>
              <select
                name="sourceLocationId"
                value={formData.sourceLocationId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">출발지를 선택하세요</option>
                {factories.map(factory => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                도착 공장 <span className="text-red-500">*</span>
              </label>
              <select
                name="destLocationId"
                value={formData.destLocationId}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="">도착지를 선택하세요</option>
                {factories.map(factory => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 수량 / 단위 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="수량을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                단위 <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                required
              >
                <option value="EA">EA</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="BOX">BOX</option>
                <option value="PCS">PCS</option>
              </select>
            </div>
          </div>

          {/* 이동 유형 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              이동 유형
            </label>
            <select
              name="transferType"
              value={formData.transferType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="OTHER">기타</option>
              <option value="PRODUCTION">생산</option>
              <option value="RETURN">반품</option>
            </select>
          </div>

          {/* 비고 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              비고
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="추가 메모를 입력하세요"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-3 font-semibold text-white transition-colors ${
              loading
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-[#724323] hover:bg-[#5a3419]'
            }`}
          >
            {loading ? '처리 중...' : '창고 이동 등록'}
          </button>
        </form>
      </div>

      {/* 이동 이력 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <h3 className="font-semibold text-[#674529]">최근 이동 이력</h3>
        </div>

        {transferHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            이동 이력이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">품목</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">출발지</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">도착지</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">수량</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">이동 유형</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">일시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transferHistory.map((transfer, index) => (
                  <tr key={transfer.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{transfer.itemName || transfer.itemCode || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{transfer.sourceName || transfer.sourceLocationId || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>{transfer.destName || transfer.destLocationId || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {transfer.quantity} {transfer.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                        {transfer.transferType || 'OTHER'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {transfer.createdAt
                        ? new Date(transfer.createdAt).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseTransfer;

