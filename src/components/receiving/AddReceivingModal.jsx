import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { itemsAPI, factoriesAPI, storageConditionsAPI } from '../../api';

const AddReceivingModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    unit: '',
    expectedQuantity: '',
    expectedDate: new Date().toISOString().split('T')[0],
    selectedItemId: '', // 선택된 품목의 고유 식별자
    factoryId: '', // 공장 ID
    supplierName: '', // 공급업체명
    barcode: '', // 바코드
    wholesalePrice: '', // 도매가
    storageConditionId: '', // 보관 조건 ID
    notes: '', // 메모
  });
  const [itemsList, setItemsList] = useState([]);
  const [factoriesList, setFactoriesList] = useState([]);
  const [storageConditionsList, setStorageConditionsList] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingFactories, setIsLoadingFactories] = useState(false);
  const [isLoadingStorageConditions, setIsLoadingStorageConditions] = useState(false);

  // 품목 목록, 공장 목록, 보관 조건 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadItems();
      loadFactories();
      loadStorageConditions();
    }
  }, [isOpen]);

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      const response = await itemsAPI.getItems({});
      const data = response.data?.data || response.data || [];
      setItemsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('품목 목록 로드 실패:', error);
      setItemsList([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const loadFactories = async () => {
    try {
      setIsLoadingFactories(true);
      const response = await factoriesAPI.getFactories();
      const data = response.data?.data || response.data || [];
      setFactoriesList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('공장 목록 로드 실패:', error);
      setFactoriesList([]);
    } finally {
      setIsLoadingFactories(false);
    }
  };

  const loadStorageConditions = async () => {
    try {
      setIsLoadingStorageConditions(true);
      const response = await storageConditionsAPI.getStorageConditions();
      const data = response.data?.data || response.data || [];
      setStorageConditionsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('보관 조건 목록 로드 실패:', error);
      setStorageConditionsList([]);
    } finally {
      setIsLoadingStorageConditions(false);
    }
  };

  const handleItemChange = (e) => {
    const selectedValue = e.target.value;
    
    if (!selectedValue) {
      setFormData((prev) => ({
        ...prev,
        selectedItemId: '',
        itemName: '',
        itemCode: '',
        unit: '',
      }));
      return;
    }

    // itemsList에서 찾기 (백엔드 데이터)
    const selectedItem = itemsList.find(item => {
      const itemId = item.id?.toString();
      const itemCode = item.code || item.itemCode;
      const itemName = item.name || item.itemName;
      return itemId === selectedValue || itemCode === selectedValue || itemName === selectedValue;
    });

    if (selectedItem) {
      const itemId = selectedItem.id?.toString() || selectedItem.code || selectedItem.itemCode || selectedItem.name || selectedItem.itemName || selectedValue;
      setFormData((prev) => ({
        ...prev,
        selectedItemId: itemId,
        itemName: selectedItem.name || selectedItem.itemName || '',
        itemCode: selectedItem.code || selectedItem.itemCode || '',
        unit: selectedItem.unit || 'Kg',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedItemId: '',
        itemName: '',
        itemCode: '',
        unit: '',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 백엔드 API를 통해 입고 대기 항목 저장
      const receivingData = {
        itemCode: formData.itemCode,
        itemName: formData.itemName,
        expectedQuantity: parseFloat(formData.expectedQuantity),
        unit: formData.unit,
        expectedDate: formData.expectedDate,
        factoryId: formData.factoryId,
        supplierName: formData.supplierName,
        barcode: formData.barcode,
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
        storageConditionId: formData.storageConditionId ? parseInt(formData.storageConditionId) : undefined,
        notes: formData.notes,
        selectedItemId: formData.selectedItemId,
      };

      await onSubmit(receivingData);
      
      // 폼 초기화
      setFormData({
        itemName: '',
        itemCode: '',
        unit: '',
        expectedQuantity: '',
        expectedDate: new Date().toISOString().split('T')[0],
        selectedItemId: '',
        factoryId: '',
        supplierName: '',
        barcode: '',
        wholesalePrice: '',
        storageConditionId: '',
        notes: '',
      });
    } catch (error) {
      console.error('입고 목록 추가 실패:', error);
      alert(error.response?.data?.message || '입고 목록 추가에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-2xl rounded-xl bg-white shadow-xl'>
        {/* 모달 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>
            입고 목록 추가
          </h2>
          <button
            onClick={onClose}
            className='rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* 모달 본문 */}
        <form onSubmit={handleSubmit}>
          <div className='max-h-[70vh] overflow-y-auto px-6 py-4'>
            <div className='grid gap-4'>
              {/* 품목명 선택 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  품목명 <span className='text-red-500'>*</span>
                </label>
                <select
                  name='itemName'
                  value={formData.selectedItemId}
                  onChange={handleItemChange}
                  required
                  disabled={isLoadingItems}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529] disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>
                    {isLoadingItems ? '품목 목록 로딩 중...' : '품목을 선택하세요'}
                  </option>
                  {itemsList.map((item) => {
                    // 백엔드 데이터: id가 있으면 id를 value로, 없으면 code 또는 name 사용
                    const itemValue = item.id?.toString() || item.code || item.itemCode || item.name || item.itemName;
                    const itemName = item.name || item.itemName || '';
                    const itemCode = item.code || item.itemCode || '';
                    return (
                      <option 
                        key={item.id || item.code || item.itemCode || item.name} 
                        value={itemValue}
                      >
                        {itemName} {itemCode ? `(${itemCode})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 품목코드 (자동 표시) */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  품목코드
                </label>
                <input
                  type='text'
                  value={formData.itemCode}
                  readOnly
                  className='w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600'
                  placeholder=''
                />
              </div>

              {/* 주문량 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  주문량 <span className='text-red-500'>*</span>
                </label>
                <div className='flex space-x-2'>
                  <input
                    type='number'
                    name='expectedQuantity'
                    value={formData.expectedQuantity}
                    onChange={handleChange}
                    required
                    className='flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                    placeholder='50'
                  />
                  <input
                    type='text'
                    value={formData.unit}
                    readOnly
                    className='w-16 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-center text-sm text-gray-600'
                    placeholder='단위'
                  />
                </div>
              </div>

              {/* 입고예정일 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  입고예정일 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  name='expectedDate'
                  value={formData.expectedDate}
                  onChange={handleChange}
                  required
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                />
              </div>

              {/* 공장 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  공장 <span className='text-red-500'>*</span>
                </label>
                <select
                  name='factoryId'
                  value={formData.factoryId}
                  onChange={handleChange}
                  required
                  disabled={isLoadingFactories}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529] disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>
                    {isLoadingFactories ? '공장 목록 로딩 중...' : '공장을 선택하세요'}
                  </option>
                  {factoriesList.map((factory) => (
                    <option key={factory.id} value={factory.id}>
                      {factory.name || factory.code || `공장 ${factory.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* 공급업체명 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  공급업체명
                </label>
                <input
                  type='text'
                  name='supplierName'
                  value={formData.supplierName}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='공급업체명을 입력하세요'
                />
              </div>

              {/* 바코드 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  바코드
                </label>
                <input
                  type='text'
                  name='barcode'
                  value={formData.barcode}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='바코드를 입력하세요'
                />
              </div>

              {/* 도매가 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  도매가
                </label>
                <input
                  type='number'
                  name='wholesalePrice'
                  value={formData.wholesalePrice}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='도매가를 입력하세요'
                  min='0'
                  step='0.01'
                />
              </div>

              {/* 보관 조건 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  보관 조건
                </label>
                <select
                  name='storageConditionId'
                  value={formData.storageConditionId}
                  onChange={handleChange}
                  disabled={isLoadingStorageConditions}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529] disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>
                    {isLoadingStorageConditions ? '보관 조건 로딩 중...' : '보관 조건을 선택하세요'}
                  </option>
                  {storageConditionsList.map((condition) => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name || condition.condition_name || `보관 조건 ${condition.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* 메모 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  메모
                </label>
                <textarea
                  name='notes'
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='메모를 입력하세요'
                />
              </div>
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className='flex items-center justify-end space-x-3 border-t border-gray-200 px-6 py-4'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
            >
              취소
            </button>
            <button
              type='submit'
              className='rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#553821]'
            >
              대기 목록 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReceivingModal;
