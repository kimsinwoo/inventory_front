import { useState } from 'react';
import { X, CheckCircle, Package } from 'lucide-react';

const ProductionCompleteModal = ({ isOpen, onClose, onComplete, order }) => {
  const [actualQuantities, setActualQuantities] = useState({});
  const [note, setNote] = useState('');

  if (!isOpen || !order) return null;

  // 초기값 설정
  if (Object.keys(actualQuantities).length === 0 && order.items) {
    const initial = {};
    order.items.forEach(item => {
      initial[item.id] = item.quantity;
    });
    setActualQuantities(initial);
  }

  const handleQuantityChange = (itemId, value) => {
    setActualQuantities({
      ...actualQuantities,
      [itemId]: value,
    });
  };

  const handleSubmit = () => {
    // 실제 생산량 정보를 포함하여 완료 처리
    const updatedItems = order.items.map(item => ({
      ...item,
      actualQuantity: parseFloat(actualQuantities[item.id]) || 0,
    }));

    onComplete({
      ...order,
      items: updatedItems,
      productionNote: note,
    });

    // 초기화
    setActualQuantities({});
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">생산 완료 처리</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4">
          <div className="mb-4 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">작업지시서:</span> {order.orderNumber}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-semibold">공장:</span> {order.factoryName || '미지정'}
            </p>
          </div>

          <h3 className="mb-3 text-sm font-semibold text-gray-900">실제 생산량 입력</h3>
          <p className="mb-4 text-xs text-gray-500">
            계획 수량과 다르게 생산된 경우 실제 생산량을 입력하세요. 입력하지 않으면 계획 수량으로 처리됩니다.
          </p>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-[#674529]" />
                  <div>
                    <p className="font-medium text-gray-900">{item.itemName}</p>
                    <p className="text-xs text-gray-500">
                      계획: {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">실제:</label>
                  <input
                    type="number"
                    value={actualQuantities[item.id] || ''}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                    placeholder={item.quantity}
                  />
                  <span className="text-sm text-gray-600">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">생산 비고</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
              placeholder="생산 과정에서 특이사항이 있으면 입력하세요"
            />
          </div>

          <div className="mt-4 rounded-lg bg-yellow-50 p-4">
            <p className="text-xs text-yellow-800">
              ⚠️ 생산 완료 시 입력한 수량만큼 자동으로 재고에 추가됩니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end space-x-2 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            <span>생산 완료 확정</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionCompleteModal;

