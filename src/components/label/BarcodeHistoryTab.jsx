import { useState } from 'react';
import { History, Search, AlertCircle, Package, MapPin, Calendar, User } from 'lucide-react';
import Barcode from 'react-barcode';
import { barcodeService } from '../../services';

const BarcodeHistoryTab = () => {
  const [barcode, setBarcode] = useState('');
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!barcode || barcode.trim().length === 0) {
      setError('바코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setHistoryData(null);

    try {
      const response = await barcodeService.getHistory(barcode.trim());
      const data = response.data;

      // 백엔드에서 공장별 재고량과 최근 이동 경로를 제공하지 않는 경우, 히스토리에서 계산
      if (!data.factoryInventories && data.history && data.history.length > 0) {
        const factoryMap = {};
        
        data.history.forEach((item) => {
          // 출발 공장에서 차감
          if (item.fromFactory && item.typeRaw === 'TRANSFER_OUT') {
            const key = item.fromFactory.id || item.fromFactory.name;
            if (!factoryMap[key]) {
              factoryMap[key] = {
                factoryName: item.fromFactory.name,
                factoryType: item.fromFactory.type,
                quantity: 0,
              };
            }
            factoryMap[key].quantity -= item.quantity || 0;
          }
          
          // 도착 공장에 추가
          if (item.toFactory) {
            const key = item.toFactory.id || item.toFactory.name;
            if (!factoryMap[key]) {
              factoryMap[key] = {
                factoryName: item.toFactory.name,
                factoryType: item.toFactory.type,
                quantity: 0,
              };
            }
            factoryMap[key].quantity += item.quantity || 0;
          }
        });

        data.factoryInventories = Object.values(factoryMap).filter(f => f.quantity > 0);
      }

      // 최근 이동 경로 계산 (없는 경우)
      if (!data.recentMovements && data.history && data.history.length > 0) {
        const movements = data.history
          .filter(item => item.typeRaw === 'TRANSFER_IN' || item.typeRaw === 'TRANSFER_OUT' || item.typeRaw === 'RECEIVE')
          .slice(0, 5) // 최근 5개만
          .map(item => ({
            factoryName: item.toFactory?.name || item.fromFactory?.name,
            factory: item.toFactory || item.fromFactory,
            occurredAt: item.occurredAt,
          }));
        
        data.recentMovements = movements;
      }

      setHistoryData(data);
    } catch (err) {
      console.error('이력 조회 실패:', err);
      setError(err.response?.data?.message || '이력 조회에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeColor = (typeRaw) => {
    const colorMap = {
      RECEIVE: 'bg-green-100 text-green-800',
      ISSUE: 'bg-red-100 text-red-800',
      TRANSFER_OUT: 'bg-blue-100 text-blue-800',
      TRANSFER_IN: 'bg-purple-100 text-purple-800',
    };
    return colorMap[typeRaw] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='space-y-6'>
      {/* 검색 영역 */}
      <div className='space-y-4'>
        <h2 className='text-xl font-semibold text-gray-800'>바코드 이력 조회</h2>
        <div className='flex space-x-3'>
          <div className='flex-1'>
            <input
              type='text'
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='바코드 번호를 입력하세요 (예: 17307240001234)'
              className='w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className='flex items-center space-x-2 rounded-lg bg-[#674529] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#553821] disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            <Search className='h-5 w-5' />
            <span>{isLoading ? '조회 중...' : '조회'}</span>
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className='flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-red-800'>
          <AlertCircle className='h-5 w-5' />
          <span className='text-sm'>{error}</span>
        </div>
      )}

      {/* 이력 정보 표시 */}
      {historyData && (
        <div className='space-y-6'>
          {/* 바코드 이미지 섹션 */}
          <div className='rounded-xl border border-gray-200 bg-white p-6'>
            <h3 className='mb-4 text-lg font-semibold text-gray-800'>바코드 정보</h3>
            <div className='flex items-center justify-center rounded-lg bg-gray-50 p-8'>
              <Barcode 
                value={barcode} 
                format="CODE128"
                width={2}
                height={80}
                displayValue={true}
                fontSize={16}
                margin={10}
              />
            </div>
          </div>

          {/* 요약 정보 */}
          <div className='grid grid-cols-4 gap-4'>
            <div className='rounded-lg bg-gradient-to-br from-[#674529] to-[#553821] p-4 text-white'>
              <Package className='mb-2 h-6 w-6' />
              <p className='text-xs opacity-90'>품목명</p>
              <p className='text-lg font-semibold'>{historyData.item?.name || '-'}</p>
            </div>
            <div className='rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white'>
              <Package className='mb-2 h-6 w-6' />
              <p className='text-xs opacity-90'>현재 수량</p>
              <p className='text-lg font-semibold'>
                {historyData.currentQuantity || 0} {historyData.unit || 'kg'}
              </p>
            </div>
            <div className='rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-4 text-white'>
              <MapPin className='mb-2 h-6 w-6' />
              <p className='text-xs opacity-90'>현재 위치</p>
              <p className='text-lg font-semibold'>
                {historyData.currentLocation?.name || historyData.factory?.name || '-'}
              </p>
            </div>
            <div className='rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-4 text-white'>
              <History className='mb-2 h-6 w-6' />
              <p className='text-xs opacity-90'>이력 건수</p>
              <p className='text-lg font-semibold'>{historyData.history?.length || 0}건</p>
            </div>
          </div>

          {/* 공장별 재고량 */}
          {historyData.factoryInventories && historyData.factoryInventories.length > 0 && (
            <div className='rounded-xl border border-gray-200 bg-white p-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-800'>공장별 재고 현황</h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
                {historyData.factoryInventories.map((factory, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4'
                  >
                    <div className='flex items-center space-x-3'>
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#674529] text-white'>
                        <MapPin className='h-5 w-5' />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900'>{factory.factoryName || factory.name}</p>
                        <p className='text-xs text-gray-500'>{factory.factoryType || factory.type || '공장'}</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-xl font-bold text-[#674529]'>
                        {factory.quantity || 0}
                      </p>
                      <p className='text-xs text-gray-500'>{factory.unit || historyData.unit || 'kg'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 최근 이동 위치 */}
          {historyData.recentMovements && historyData.recentMovements.length > 0 && (
            <div className='rounded-xl border border-gray-200 bg-white p-6'>
              <h3 className='mb-4 text-lg font-semibold text-gray-800'>최근 이동 경로</h3>
              <div className='flex items-center space-x-2 overflow-x-auto pb-2'>
                {historyData.recentMovements.map((movement, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <div className='flex-shrink-0 rounded-lg bg-gray-100 px-4 py-2'>
                      <div className='flex items-center space-x-2'>
                        <MapPin className='h-4 w-4 text-[#674529]' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {movement.factoryName || movement.factory?.name || '-'}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {movement.date?.split('T')[0] || movement.occurredAt?.split('T')[0] || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {index < historyData.recentMovements.length - 1 && (
                      <div className='flex-shrink-0 text-gray-400'>→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 이력 타임라인 */}
          <div className='rounded-xl border border-gray-200 bg-white p-6'>
            <h3 className='mb-6 text-lg font-semibold text-gray-800'>물류 이력</h3>

            <div className='space-y-6'>
              {historyData.history && historyData.history.length > 0 ? (
                historyData.history.map((item, index) => (
                  <div key={item.id} className='relative'>
                    {/* 타임라인 라인 */}
                    {index < historyData.history.length - 1 && (
                      <div className='absolute left-6 top-12 h-full w-0.5 bg-gray-200' />
                    )}

                    {/* 이력 카드 */}
                    <div className='flex space-x-4'>
                      {/* 아이콘 */}
                      <div className='relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white border-2 border-gray-200'>
                        <Package className='h-5 w-5 text-[#674529]' />
                      </div>

                      {/* 내용 */}
                      <div className='flex-1 rounded-lg border border-gray-200 bg-gray-50 p-4'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-3'>
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(item.typeRaw)}`}
                              >
                                {item.type}
                              </span>
                              <span className='text-sm font-medium text-gray-900'>
                                {item.quantity} {item.unit}
                              </span>
                            </div>

                            <div className='mt-3 grid grid-cols-2 gap-4'>
                              {item.fromFactory && (
                                <div className='flex items-start space-x-2'>
                                  <MapPin className='mt-0.5 h-4 w-4 text-gray-400' />
                                  <div>
                                    <p className='text-xs text-gray-500'>출발</p>
                                    <p className='text-sm font-medium text-gray-700'>
                                      {item.fromFactory.name}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {item.toFactory && (
                                <div className='flex items-start space-x-2'>
                                  <MapPin className='mt-0.5 h-4 w-4 text-gray-400' />
                                  <div>
                                    <p className='text-xs text-gray-500'>도착</p>
                                    <p className='text-sm font-medium text-gray-700'>
                                      {item.toFactory.name}
                                    </p>
                                  </div>
                                </div>
                              )}

                              <div className='flex items-start space-x-2'>
                                <User className='mt-0.5 h-4 w-4 text-gray-400' />
                                <div>
                                  <p className='text-xs text-gray-500'>담당자</p>
                                  <p className='text-sm font-medium text-gray-700'>
                                    {item.actorName || '-'}
                                  </p>
                                </div>
                              </div>

                              <div className='flex items-start space-x-2'>
                                <Calendar className='mt-0.5 h-4 w-4 text-gray-400' />
                                <div>
                                  <p className='text-xs text-gray-500'>일시</p>
                                  <p className='text-sm font-medium text-gray-700'>
                                    {item.occurredAt?.replace('T', ' ').substring(0, 19) || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {item.note && (
                              <div className='mt-3 rounded bg-white p-2'>
                                <p className='text-xs text-gray-500'>메모</p>
                                <p className='text-sm text-gray-700'>{item.note}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className='py-8 text-center text-gray-500'>이력이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {!historyData && !error && !isLoading && (
        <div className='rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center'>
          <History className='mx-auto h-16 w-16 text-gray-400' />
          <p className='mt-4 text-lg font-medium text-gray-600'>바코드 이력을 조회하세요</p>
          <p className='mt-2 text-sm text-gray-500'>
            바코드 번호를 입력하여 전체 물류 이력을 확인할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
};

export default BarcodeHistoryTab;

