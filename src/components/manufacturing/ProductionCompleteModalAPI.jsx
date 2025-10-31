import { useState } from 'react';
import { X, CheckCircle, Package, AlertCircle } from 'lucide-react';

const ProductionCompleteModalAPI = ({ isOpen, onClose, onComplete, order }) => {
  const [actualQuantity, setActualQuantity] = useState('');
  const [barcode, setBarcode] = useState('');
  const [storageConditionId, setStorageConditionId] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !order) return null;

  const plannedQty = order.planned_quantity || order.plannedQuantity || 0;
  const productName = order.product?.name || '완제품';
  const unit = order.unit || 'kg';

  const handleSubmit = () => {
    const completeData = {};

    if (actualQuantity) {
      completeData.actualQuantity = parseFloat(actualQuantity);
    }

    if (barcode) {
      completeData.barcode = barcode;
    }

    if (storageConditionId) {
      completeData.storageConditionId = parseInt(storageConditionId);
    }

    if (wholesalePrice) {
      completeData.wholesalePrice = parseFloat(wholesalePrice);
    }

    if (notes) {
      completeData.notes = notes;
    }

    onComplete(order.id, completeData);

    // 초기화
    setActualQuantity('');
    setBarcode('');
    setStorageConditionId('');
    setWholesalePrice('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
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
          {/* 작업 정보 */}
          <div className="mb-4 rounded-lg bg-blue-50 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600">작업지시서:</span>
                <span className="ml-2 font-semibold text-blue-900">
                  {order.work_order_number || order.workOrderNumber}
                </span>
              </div>
              <div>
                <span className="text-blue-600">완제품:</span>
                <span className="ml-2 font-semibold text-blue-900">{productName}</span>
              </div>
              <div>
                <span className="text-blue-600">계획 수량:</span>
                <span className="ml-2 font-semibold text-blue-900">
                  {plannedQty} {unit}
                </span>
              </div>
              <div>
                <span className="text-blue-600">공장:</span>
                <span className="ml-2 font-semibold text-blue-900">
                  {order.factory?.name || '미지정'}
                </span>
              </div>
            </div>
          </div>

          {/* BOM 정보 */}
          {order.bom?.components && (
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                소비될 원재료 (계획 기준)
              </h4>
              <div className="space-y-1">
                {order.bom.components.map((comp, index) => {
                  const requiredQty = (comp.quantity * plannedQty).toFixed(2);
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        {comp.item?.name || comp.itemName}
                      </span>
                      <span className="font-medium text-gray-900">
                        {requiredQty} {comp.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 입력 폼 */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                실제 생산 수량
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                  placeholder={`계획: ${plannedQty}`}
                  min="0"
                  step="0.01"
                />
                <span className="text-sm text-gray-600">{unit}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                미입력 시 계획 수량({plannedQty} {unit})으로 처리됩니다
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                바코드 (선택)
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                placeholder="미입력 시 자동 생성"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  보관 조건 ID (선택)
                </label>
                <input
                  type="number"
                  value={storageConditionId}
                  onChange={(e) => setStorageConditionId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                  placeholder="1"
                  min="1"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  도매가 (선택)
                </label>
                <input
                  type="number"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                  placeholder="5000"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                비고 (선택)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                maxLength={500}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]"
                placeholder="생산 과정에서 특이사항이 있으면 입력하세요"
              />
            </div>
          </div>

          {/* 경고 메시지 */}
          <div className="mt-4 rounded-lg bg-yellow-50 p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div className="text-xs text-yellow-800">
                <p className="font-semibold">생산 완료 시 자동 처리:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>BOM 기반 원재료 FIFO 자동 출고</li>
                  <li>원재료 출고 이력 자동 생성</li>
                  <li>완제품 재고 자동 입고 (바코드 자동 생성)</li>
                  <li>완제품 입고 이력 자동 생성</li>
                  <li>작업지시서 상태 "완료"로 변경</li>
                </ul>
              </div>
            </div>
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

export default ProductionCompleteModalAPI;

