import { useEffect, useState } from 'react';
import { barcodeService, factoryService } from '../../services';
import { PackageCheck, CheckCircle, AlertCircle } from 'lucide-react';

const TransferIn = () => {
  const [factories, setFactories] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [factoryId, setFactoryId] = useState('');
  const [storageConditionId, setStorageConditionId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async () => {
    if (!barcode || !factoryId) {
      setError('바코드와 현재 공장(목적지)을 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await barcodeService.transferIn({
        barcode: barcode.trim(),
        factoryId: parseInt(factoryId),
        storageConditionId: storageConditionId ? parseInt(storageConditionId) : undefined,
        note: note || undefined,
      });
      setSuccess('이동 입고가 완료되었습니다.');
      setBarcode('');
      setFactoryId('');
      setStorageConditionId('');
      setNote('');
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || '이동 입고 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center space-x-2">
        <PackageCheck className="h-5 w-5 text-[#674529]" />
        <h3 className="text-lg font-semibold text-[#674529]">공장간 이동 입고</h3>
      </div>
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
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">바코드 번호</label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="바코드를 입력하세요"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">현재 공장(목적지)</label>
            <select
              value={factoryId}
              onChange={(e) => setFactoryId(e.target.value)}
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
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모 입력"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? '처리 중...' : '이동 입고'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferIn;

