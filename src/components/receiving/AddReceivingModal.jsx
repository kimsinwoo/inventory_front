import { X } from 'lucide-react';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { itemsAPI } from '../../api';
=======
import { useState, useEffect, useMemo } from 'react';
import { itemsAPI, factoriesAPI, storageConditionsAPI } from '../../api';

// 카테고리 값과 라벨 매핑
const CATEGORY_OPTIONS = [
  { value: '', label: '카테고리 선택' },
  { value: 'Finished', label: '완제품' },
  { value: 'SemiFinished', label: '반제품' },
  { value: 'RawMaterial', label: '원재료' },
  { value: 'Supply', label: '소모품' },
];
>>>>>>> origin/label-print

const AddReceivingModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    category: '', // 추가: 품목 카테고리
    itemName: '',
    itemCode: '',
    unit: '',
    expectedQuantity: '',
    expectedDate: new Date().toISOString().split('T')[0],
    selectedItemId: '', // 선택된 품목의 고유 식별자
<<<<<<< HEAD
=======
    factoryId: '', // 공장 ID
    supplierName: '', // 공급업체명
    barcode: '', // 바코드
    wholesalePrice: '', // 도매가
    storageConditionId: '', // 보관 조건 ID
    notes: '', // 메모
>>>>>>> origin/label-print
  });
  const [itemsList, setItemsList] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // 품목 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadItems();
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

<<<<<<< HEAD
  const handleItemChange = (e) => {
    const selectedValue = e.target.value;
    
=======
  const [itemsList, setItemsList] = useState([]);
  const [factoriesList, setFactoriesList] = useState([]);
  const [storageConditionsList, setStorageConditionsList] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingFactories, setIsLoadingFactories] = useState(false);
  const [isLoadingStorageConditions, setIsLoadingStorageConditions] = useState(false);

  // 품목, 공장, 보관 조건 목록 로드
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

  // 카테고리 변경
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      category: value,
      selectedItemId: '', // 카테고리 바꿀 때 품목 초기화
      itemName: '',
      itemCode: '',
      unit: '',
    }));
  };

  // 카테고리에 따른 품목 필터
  const filteredItemsList = useMemo(() => {
    if (!formData.category) return [];
    return Array.isArray(itemsList)
      ? itemsList.filter(item => item.category === formData.category)
      : [];
  }, [itemsList, formData.category]);

  // 품목 선택
  const handleItemChange = (e) => {
    const selectedValue = e.target.value;
>>>>>>> origin/label-print
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

<<<<<<< HEAD
    // itemsList에서 찾기 (백엔드 데이터)
    const selectedItem = itemsList.find(item => {
      const itemId = item.id?.toString();
      const itemCode = item.code || item.itemCode;
      const itemName = item.name || item.itemName;
      return itemId === selectedValue || itemCode === selectedValue || itemName === selectedValue;
    });

    if (selectedItem) {
      const itemId = selectedItem.id?.toString() || selectedItem.code || selectedItem.itemCode || selectedItem.name || selectedItem.itemName || selectedValue;
=======
    // filteredItemsList에서 찾기 (선택된 카테고리에 한정)
    const selectedItem = filteredItemsList.find(item => {
      const itemId = item.id?.toString();
      const itemCode = item.code || item.itemCode;
      const itemName = item.name || item.itemName;
      return (
        itemId === selectedValue ||
        itemCode === selectedValue ||
        itemName === selectedValue
      );
    });

    if (selectedItem) {
      const itemId =
        selectedItem.id?.toString() ||
        selectedItem.code ||
        selectedItem.itemCode ||
        selectedItem.name ||
        selectedItem.itemName ||
        selectedValue;
>>>>>>> origin/label-print
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
<<<<<<< HEAD
    
    try {
      // 백엔드 API를 통해 입고 대기 항목 저장
=======
    try {
>>>>>>> origin/label-print
      const receivingData = {
        itemCode: formData.itemCode,
        itemName: formData.itemName,
        expectedQuantity: parseFloat(formData.expectedQuantity),
        unit: formData.unit,
        expectedDate: formData.expectedDate,
<<<<<<< HEAD
        status: 'pending', // 대기 상태
      };

      await onSubmit(receivingData);
      
      // 폼 초기화
      setFormData({
=======
        factoryId: formData.factoryId,
        supplierName: formData.supplierName,
        barcode: formData.barcode,
        wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice) : undefined,
        storageConditionId: formData.storageConditionId ? parseInt(formData.storageConditionId) : undefined,
        notes: formData.notes,
        selectedItemId: formData.selectedItemId,
        category: formData.category,
      };

      await onSubmit(receivingData);

      // 폼 초기화
      setFormData({
        category: '',
>>>>>>> origin/label-print
        itemName: '',
        itemCode: '',
        unit: '',
        expectedQuantity: '',
        expectedDate: new Date().toISOString().split('T')[0],
        selectedItemId: '',
<<<<<<< HEAD
=======
        factoryId: '',
        supplierName: '',
        barcode: '',
        wholesalePrice: '',
        storageConditionId: '',
        notes: '',
>>>>>>> origin/label-print
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

              {/* 카테고리 선택 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  품목 카테고리 <span className='text-red-500'>*</span>
                </label>
                <select
                  name='category'
                  value={formData.category}
                  onChange={handleCategoryChange}
                  required
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529] disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

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
<<<<<<< HEAD
                  disabled={isLoadingItems}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529] disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>
                    {isLoadingItems ? '품목 목록 로딩 중...' : '품목을 선택하세요'}
                  </option>
                  {itemsList.map((item) => {
                    // 백엔드 데이터: id가 있으면 id를 value로, 없으면 code 또는 name 사용
=======
                  disabled={isLoadingItems || !formData.category}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529] disabled:bg-gray-100 disabled:cursor-not-allowed'
                >
                  <option value=''>
                    {isLoadingItems
                      ? '품목 목록 로딩 중...'
                      : !formData.category
                        ? '먼저 카테고리를 선택하세요'
                        : filteredItemsList.length === 0
                          ? '해당 카테고리에 품목이 없습니다'
                          : '품목을 선택하세요'}
                  </option>
                  {filteredItemsList.map((item) => {
>>>>>>> origin/label-print
                    const itemValue = item.id?.toString() || item.code || item.itemCode || item.name || item.itemName;
                    const itemName = item.name || item.itemName || '';
                    const itemCode = item.code || item.itemCode || '';
                    return (
<<<<<<< HEAD
                      <option 
                        key={item.id || item.code || item.itemCode || item.name} 
=======
                      <option
                        key={item.id || item.code || item.itemCode || item.name}
>>>>>>> origin/label-print
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
