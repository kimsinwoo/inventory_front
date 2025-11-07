import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { items, getItemByName } from '../../data/items';
import { itemsAPI } from '../../api';

const AddShippingModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    unit: '',
    expectedQuantity: '',
    expectedDate: new Date().toISOString().split('T')[0],
    selectedItemId: '', // 선택된 품목의 고유 식별자
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
      // 백엔드 API 실패 시 로컬 데이터 사용
      setItemsList(items);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleItemChange = (e) => {
    const selectedValue = e.target.value;
    
    if (!selectedValue) {
      setFormData((prev) => ({
        ...prev,
        itemName: '',
        itemCode: '',
        unit: '',
      }));
      return;
    }

    // itemsList에서 찾기 (백엔드 데이터)
    let selectedItem = itemsList.find(item => {
      const itemId = item.id?.toString();
      const itemCode = item.code || item.itemCode;
      const itemName = item.name || item.itemName;
      return itemId === selectedValue || itemCode === selectedValue || itemName === selectedValue;
    });

    // itemsList에서 못 찾으면 로컬 데이터에서 찾기
    if (!selectedItem) {
      selectedItem = items.find(item => 
        item.code === selectedValue || item.name === selectedValue
      );
    }

    // 로컬 데이터의 getItemByName도 시도
    if (!selectedItem) {
      const localItem = getItemByName(selectedValue);
      if (localItem) {
        selectedItem = localItem;
      }
    }

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // 폼 초기화
    setFormData({
      itemName: '',
      itemCode: '',
      unit: '',
      expectedQuantity: '',
      expectedDate: new Date().toISOString().split('T')[0],
      selectedItemId: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-2xl rounded-xl bg-white shadow-xl'>
        {/* 모달 헤더 */}
        <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-[#674529]'>
            출고 목록 추가
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
                  {/* 백엔드 API 실패 시 로컬 데이터 표시 */}
                  {itemsList.length === 0 && !isLoadingItems && items.map((item) => (
                    <option key={item.code} value={item.name}>
                      {item.name}
                    </option>
                  ))}
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

              {/* 출고예정일 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  출고예정일 <span className='text-red-500'>*</span>
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

export default AddShippingModal;
