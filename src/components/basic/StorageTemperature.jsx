import { Thermometer, X, Plus } from 'lucide-react';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStorageConditions, updateStorageCondition } from '../../store/modules/basic/actions';
=======
import { storageConditionsAPI } from '../../api';
>>>>>>> origin/label-print

const StorageTemperature = () => {
  const dispatch = useDispatch();

<<<<<<< HEAD
  // 리덕스 스토어에서 보관 조건 데이터 가져오기
  const { data: storageConditions, loading } = useSelector((state) => state.basic.storageConditions);
  const { data: storageOperation } = useSelector((state) => state.basic.storageOperation);
=======
  // 보관 조건 목록 불러오기
  const fetchConditions = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await storageConditionsAPI.getStorageConditions();
      const data = response.data?.data || response.data || [];
      setStorageConditions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('보관 조건 조회 실패:', error);
      setErrorMsg(error.response?.data?.message || '보관 조건 정보를 불러오지 못했습니다.');
      setStorageConditions([]);
    } finally {
      setLoading(false);
    }
  };
>>>>>>> origin/label-print

  // 컴포넌트 마운트 시 보관 조건 목록 조회
  useEffect(() => {
    dispatch(fetchStorageConditions.request());
  }, [dispatch]);

  // 보관 조건 업데이트 성공 시 목록 다시 조회
  useEffect(() => {
    if (storageOperation) {
      dispatch(fetchStorageConditions.request());
    }
  }, [storageOperation, dispatch]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStorageId, setCurrentStorageId] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState('');

  const handleOpenModal = (storageId) => {
    setCurrentStorageId(storageId);
    setIsModalOpen(true);
    setNewItem('');
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStorageId(null);
    setNewItem('');
    setError('');
  };

  const handleAddItem = () => {
    if (!newItem.trim()) {
      setError('품목명을 입력해주세요');
      return;
    }
<<<<<<< HEAD

    // 현재 보관 조건 찾기
    const currentStorage = storageConditions.find((s) => s.id === currentStorageId);
    if (currentStorage) {
      const updatedStorage = {
        ...currentStorage,
        items: [...currentStorage.items, newItem.trim()],
      };

      // 리덕스 액션 dispatch
      dispatch(updateStorageCondition.request({
        id: currentStorageId,
        data: updatedStorage,
      }));
    }

    handleCloseModal();
  };

  const handleRemoveItem = (storageId, itemIndex) => {
    // 해당 보관 조건 찾기
    const currentStorage = storageConditions.find((s) => s.id === storageId);
    if (currentStorage) {
      const updatedStorage = {
        ...currentStorage,
        items: currentStorage.items.filter((_, index) => index !== itemIndex),
      };

      // 리덕스 액션 dispatch
      dispatch(updateStorageCondition.request({
        id: storageId,
        data: updatedStorage,
      }));
=======
    setModalLoading(true);
    try {
      const response = await storageConditionsAPI.createStorageCondition({
        name: newConditionName.trim(),
      });
      
      if (response.data?.ok || response.data?.data) {
        // 정상 추가: 다시 목록 가져옴
        fetchConditions();
        closeModal();
      } else {
        setErrorMsg(response.data?.message || '추가 실패');
      }
    } catch (error) {
      console.error('보관조건 추가 실패:', error);
      setErrorMsg(error.response?.data?.message || '서버 오류 (추가 실패)');
    } finally {
      setModalLoading(false);
>>>>>>> origin/label-print
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className='rounded-xl bg-white p-6 shadow-sm'>
        <div className='p-4 text-center text-sm text-gray-600'>불러오는 중...</div>
      </div>
    );
  }

  return (
    <>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {storageConditions.map((storage) => (
          <div key={storage.id} className='rounded-xl bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-center gap-2'>
              <Thermometer className='h-5 w-5 text-[#674529]' />
              <h2 className='text-base text-[#674529]'>{storage.title}</h2>
            </div>

            <div className='space-y-4'>
              {/* 온도 범위 */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  온도 범위
                </label>
                <div className='rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900'>
                  {storage.temperature}
                </div>
              </div>

              {/* 습도 범위 */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  습도 범위
                </label>
                <div className='rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900'>
                  {storage.humidity}
                </div>
              </div>

              {/* 적용 품목 */}
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  적용 품목
                </label>
                <div className='flex flex-wrap items-center gap-2'>
                  {storage.items.map((item, index) => (
                    <span
                      key={index}
                      className='inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700'
                    >
                      {item}
                      <X
                        className='h-3 w-3 cursor-pointer hover:opacity-80'
                        onClick={() => handleRemoveItem(storage.id, index)}
                      />
                    </span>
                  ))}
                  <button
                    onClick={() => handleOpenModal(storage.id)}
                    className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300'
                    aria-label='품목 추가'
                  >
                    <Plus className='h-4 w-4 text-gray-600' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 품목 추가 모달 */}
      {isModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
          onClick={handleCloseModal}
        >
          <div
            className='w-full max-w-md rounded-2xl bg-white p-6 shadow-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-6 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Plus className='h-5 w-5 text-[#674529]' />
                <h3 className='text-lg font-semibold text-[#674529]'>품목 추가</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className='rounded-lg p-1 transition-colors hover:bg-gray-100'
                aria-label='닫기'
              >
                <X className='h-5 w-5 text-gray-500' />
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <label className='mb-2 block text-sm font-medium text-gray-700'>
                  품목명
                </label>
                <input
                  type='text'
                  value={newItem}
                  onChange={(e) => {
                    setNewItem(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder='품목명을 입력하세요'
                  className={`w-full rounded-xl border ${
                    error ? 'border-red-300' : 'border-gray-100'
                  } bg-gray-100 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#674529] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#674529]/20`}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleAddItem();
                  }}
                />
                {error && <p className='mt-1 text-xs text-red-500'>{error}</p>}
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={handleCloseModal}
                  className='flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95'
                >
                  취소
                </button>
                <button
                  onClick={handleAddItem}
                  className='flex-1 rounded-xl bg-[#674529] px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#553821] hover:shadow-md active:scale-95'
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StorageTemperature;