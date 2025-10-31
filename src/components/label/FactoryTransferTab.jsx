import { useState, useEffect } from 'react';
import { Truck, Scan, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { barcodeService, factoryService } from '../../services';

const FactoryTransferTab = () => {
  const [step, setStep] = useState(1); // 1: 출고, 2: 입고
  const [factories, setFactories] = useState([]);

  // 출고 데이터
  const [outBarcode, setOutBarcode] = useState('');
  const [outQuantity, setOutQuantity] = useState('');
  const [toFactoryId, setToFactoryId] = useState('');
  const [outNote, setOutNote] = useState('');
  const [outResult, setOutResult] = useState(null);

  // 입고 데이터
  const [inBarcode, setInBarcode] = useState('');
  const [inFactoryId, setInFactoryId] = useState('');
  const [storageConditionId, setStorageConditionId] = useState('');
  const [inNote, setInNote] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    try {
      const response = await factoryService.getAll();
      setFactories(response.data || []);
    } catch (err) {
      console.error('공장 목록 조회 실패:', err);
    }
  };

  const handleTransferOut = async () => {
    if (!outBarcode || !outQuantity || !toFactoryId) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await barcodeService.transferOut({
        barcode: outBarcode.trim(),
        quantity: parseFloat(outQuantity),
        toFactoryId: parseInt(toFactoryId),
        note: outNote,
      });

      setOutResult(response.data);
      setSuccess('이동 출고가 완료되었습니다. 목적지 공장에서 입고 처리를 해주세요.');
      
      // 입고 단계로 자동 이동
      setInBarcode(outBarcode);
      setInFactoryId(toFactoryId);
      setStep(2);
    } catch (err) {
      console.error('이동 출고 실패:', err);
      setError(err.response?.data?.message || '이동 출고에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferIn = async () => {
    if (!inBarcode || !inFactoryId) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await barcodeService.transferIn({
        barcode: inBarcode.trim(),
        factoryId: parseInt(inFactoryId),
        storageConditionId: storageConditionId ? parseInt(storageConditionId) : undefined,
        note: inNote,
      });

      setSuccess('이동 입고가 완료되었습니다!');
      
      // 폼 초기화
      setTimeout(() => {
        resetForm();
      }, 2000);
    } catch (err) {
      console.error('이동 입고 실패:', err);
      setError(err.response?.data?.message || '이동 입고에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setOutBarcode('');
    setOutQuantity('');
    setToFactoryId('');
    setOutNote('');
    setOutResult(null);
    setInBarcode('');
    setInFactoryId('');
    setStorageConditionId('');
    setInNote('');
    setError('');
    setSuccess('');
  };

  return (
    <div className='space-y-6'>
      {/* 단계 표시 */}
      <div className='flex items-center justify-center space-x-4'>
        <div
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
            step === 1 ? 'bg-[#674529] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span className='font-semibold'>1</span>
          <span>이동 출고</span>
        </div>
        <ArrowRight className='h-5 w-5 text-gray-400' />
        <div
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 ${
            step === 2 ? 'bg-[#674529] text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span className='font-semibold'>2</span>
          <span>이동 입고</span>
        </div>
      </div>

      {/* 메시지 */}
      {error && (
        <div className='flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-red-800'>
          <AlertCircle className='h-5 w-5' />
          <span className='text-sm'>{error}</span>
        </div>
      )}

      {success && (
        <div className='flex items-center space-x-2 rounded-lg bg-green-50 p-4 text-green-800'>
          <CheckCircle className='h-5 w-5' />
          <span className='text-sm'>{success}</span>
        </div>
      )}

      {/* 1단계: 이동 출고 */}
      {step === 1 && (
        <div className='space-y-6'>
          <div className='rounded-xl border border-gray-200 bg-white p-6'>
            <h3 className='mb-6 flex items-center space-x-2 text-lg font-semibold text-gray-800'>
              <Truck className='h-5 w-5 text-[#674529]' />
              <span>이동 출고 (바코드 스캔)</span>
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  바코드 번호 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={outBarcode}
                  onChange={(e) => setOutBarcode(e.target.value)}
                  placeholder='바코드를 스캔하거나 입력하세요'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  이동 수량 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  value={outQuantity}
                  onChange={(e) => setOutQuantity(e.target.value)}
                  placeholder='50'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  목적지 공장 <span className='text-red-500'>*</span>
                </label>
                <select
                  value={toFactoryId}
                  onChange={(e) => setToFactoryId(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                >
                  <option value=''>목적지 공장을 선택하세요</option>
                  {factories.map((factory) => (
                    <option key={factory.id} value={factory.id}>
                      {factory.name} ({factory.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>메모</label>
                <textarea
                  value={outNote}
                  onChange={(e) => setOutNote(e.target.value)}
                  placeholder='메모를 입력하세요'
                  rows={3}
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <button
                onClick={handleTransferOut}
                disabled={isLoading}
                className='w-full rounded-lg bg-[#674529] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300'
              >
                {isLoading ? '처리 중...' : '이동 출고'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2단계: 이동 입고 */}
      {step === 2 && (
        <div className='space-y-6'>
          {/* 출고 정보 요약 */}
          {outResult && (
            <div className='rounded-xl border border-green-200 bg-green-50 p-6'>
              <h4 className='mb-3 flex items-center space-x-2 font-semibold text-green-800'>
                <CheckCircle className='h-5 w-5' />
                <span>출고 완료</span>
              </h4>
              <div className='grid grid-cols-3 gap-4 text-sm'>
                <div>
                  <p className='text-green-600'>품목</p>
                  <p className='font-medium text-green-900'>{outResult.itemName || '-'}</p>
                </div>
                <div>
                  <p className='text-green-600'>수량</p>
                  <p className='font-medium text-green-900'>
                    {outResult.quantity} {outResult.unit}
                  </p>
                </div>
                <div>
                  <p className='text-green-600'>목적지</p>
                  <p className='font-medium text-green-900'>{outResult.toFactory?.name || '-'}</p>
                </div>
              </div>
            </div>
          )}

          <div className='rounded-xl border border-gray-200 bg-white p-6'>
            <h3 className='mb-6 flex items-center space-x-2 text-lg font-semibold text-gray-800'>
              <Scan className='h-5 w-5 text-[#674529]' />
              <span>이동 입고 (바코드 입력)</span>
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  바코드 번호 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={inBarcode}
                  onChange={(e) => setInBarcode(e.target.value)}
                  placeholder='바코드를 입력하세요'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  현재 공장 (목적지) <span className='text-red-500'>*</span>
                </label>
                <select
                  value={inFactoryId}
                  onChange={(e) => setInFactoryId(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                >
                  <option value=''>현재 공장을 선택하세요</option>
                  {factories.map((factory) => (
                    <option key={factory.id} value={factory.id}>
                      {factory.name} ({factory.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>보관 조건 ID</label>
                <input
                  type='number'
                  value={storageConditionId}
                  onChange={(e) => setStorageConditionId(e.target.value)}
                  placeholder='1'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>메모</label>
                <textarea
                  value={inNote}
                  onChange={(e) => setInNote(e.target.value)}
                  placeholder='메모를 입력하세요'
                  rows={3}
                  className='w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
                />
              </div>

              <div className='flex space-x-3'>
                <button
                  onClick={() => setStep(1)}
                  className='flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                >
                  이전 단계
                </button>
                <button
                  onClick={handleTransferIn}
                  disabled={isLoading}
                  className='flex-1 rounded-lg bg-[#674529] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300'
                >
                  {isLoading ? '처리 중...' : '이동 입고'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 초기화 버튼 */}
      {(step === 2 || outResult) && (
        <div className='text-center'>
          <button
            onClick={resetForm}
            className='text-sm text-gray-600 underline hover:text-gray-900'
          >
            새로운 이동 시작
          </button>
        </div>
      )}
    </div>
  );
};

export default FactoryTransferTab;

