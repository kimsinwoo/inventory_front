import { useEffect, useState } from 'react';
import { barcodeService, factoryService } from '../../services';
import { Truck, Scan, CheckCircle, AlertCircle } from 'lucide-react';

const TransferRegistration = () => {
  const [factories, setFactories] = useState([]);

  // 출고 폼
  const [outBarcode, setOutBarcode] = useState('');
  const [outQuantity, setOutQuantity] = useState('');
  const [toFactoryId, setToFactoryId] = useState('');
  const [outNote, setOutNote] = useState('');

  // 입고 폼 (2단계)
  const [inBarcode, setInBarcode] = useState('');
  const [inFactoryId, setInFactoryId] = useState('');
  const [storageConditionId, setStorageConditionId] = useState('');
  const [inNote, setInNote] = useState('');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await factoryService.getAll({ page: 1, limit: 100 });
        setFactories(resp?.data || []);
      } catch (e) {
        setFactories([]);
      }
    })();
  }, []);

  const handleTransferOut = async () => {
    if (!outBarcode || !outQuantity || !toFactoryId) {
      setError('바코드, 수량, 목적지 공장을 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await barcodeService.transferOut({
        barcode: outBarcode.trim(),
        quantity: parseFloat(outQuantity),
        toFactoryId: parseInt(toFactoryId),
        note: outNote || undefined,
      });
      setResult(res?.data || res);
      setSuccess('이동 출고가 완료되었습니다. 목적지에서 입고를 수행하세요.');
      setInBarcode(outBarcode.trim());
      setInFactoryId(String(toFactoryId));
      setStep(2);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || '이동 출고 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferIn = async () => {
    if (!inBarcode || !inFactoryId) {
      setError('바코드와 현재 공장(목적지)을 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await barcodeService.transferIn({
        barcode: inBarcode.trim(),
        factoryId: parseInt(inFactoryId),
        storageConditionId: storageConditionId ? parseInt(storageConditionId) : undefined,
        note: inNote || undefined,
      });
      setSuccess('이동 입고가 완료되었습니다.');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || '이동 입고 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center space-x-2">
        <Truck className="h-5 w-5 text-[#674529]" />
        <h3 className="text-lg font-semibold text-[#674529]">공장간 이동 등록</h3>
      </div>

      {/* 메시지 */}
      {error && (
        <div className="mb-4 flex items-center space-x-2 rounded-lg bg-red-50 p-3 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center space-x-2 rounded-lg bg-green-50 p-3 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* 1단계 이동 출고 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">바코드 번호</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={outBarcode}
                onChange={(e) => setOutBarcode(e.target.value)}
                placeholder="바코드를 스캔하거나 입력하세요"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
              />
              <button className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700">
                <Scan className="h-4 w-4" />
                <span>스캔</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">이동 수량</label>
              <input
                type="number"
                value={outQuantity}
                onChange={(e) => setOutQuantity(e.target.value)}
                placeholder="50"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">목적지 공장</label>
              <select
                value={toFactoryId}
                onChange={(e) => setToFactoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
              >
                <option value="">선택</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">메모</label>
            <input
              type="text"
              value={outNote}
              onChange={(e) => setOutNote(e.target.value)}
              placeholder="메모 입력"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleTransferOut}
              disabled={loading}
              className="rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? '처리 중...' : '이동 출고'}
            </button>
          </div>
        </div>
      )}

      {/* 2단계 이동 입고 */}
      {step === 2 && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">출고 바코드: <span className="font-mono">{inBarcode}</span></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">현재 공장(목적지)</label>
              <select
                value={inFactoryId}
                onChange={(e) => setInFactoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
              >
                <option value="">선택</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">보관 조건 ID</label>
              <input
                type="number"
                value={storageConditionId}
                onChange={(e) => setStorageConditionId(e.target.value)}
                placeholder="예: 1"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">메모</label>
            <input
              type="text"
              value={inNote}
              onChange={(e) => setInNote(e.target.value)}
              placeholder="메모 입력"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              이전 단계
            </button>
            <button
              onClick={handleTransferIn}
              disabled={loading}
              className="rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? '처리 중...' : '이동 입고'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferRegistration;