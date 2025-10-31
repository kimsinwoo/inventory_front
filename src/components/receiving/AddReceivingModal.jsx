import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { itemService, factoryService } from '../../services';

const AddReceivingModal = ({ isOpen, onClose, onSubmit }) => {
  const [itemList, setItemList] = useState([]);
  const [factoryList, setFactoryList] = useState([]);
  const [formData, setFormData] = useState({
    itemId: '',
    factoryId: '',
    quantity: '',
    unit: 'kg',
    lotNumber: '',
    wholesalePrice: '',
    note: '',
    expectedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      fetchItemList();
      fetchFactoryList();
    }
  }, [isOpen]);

  async function fetchItemList() {
    try {
      const response = await itemService.getAll({ page: 1, limit: 1000 });
      const data = response.data?.rows || response.data || [];
      setItemList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
      setItemList([]);
    }
  }

  async function fetchFactoryList() {
    try {
      const response = await factoryService.getAll({ page: 1, limit: 100 });
      const data = response.data?.rows || response.data || [];
      setFactoryList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
      setFactoryList([]);
    }
  }

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
      itemId: '',
      factoryId: '',
      quantity: '',
      unit: 'kg',
      lotNumber: '',
      wholesalePrice: '',
      note: '',
      expectedDate: new Date().toISOString().split('T')[0],
    });
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
              {/* 품목 선택 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  품목 선택 <span className='text-red-500'>*</span>
                </label>
                <select
                  name='itemId'
                  value={formData.itemId}
                  onChange={handleChange}
                  required
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                >
                  <option value=''>품목을 선택하세요</option>
                  {itemList.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.code || item.id}] {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 공장 선택 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  공장 선택 <span className='text-red-500'>*</span>
                </label>
                <select
                  name='factoryId'
                  value={formData.factoryId}
                  onChange={handleChange}
                  required
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                >
                  <option value=''>공장을 선택하세요</option>
                  {factoryList.map((factory) => (
                    <option key={factory.id} value={factory.id}>
                      {factory.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 수량 및 단위 */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    수량 <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='number'
                    step='0.01'
                    name='quantity'
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                    placeholder='수량 입력'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    단위
                  </label>
                  <select
                    name='unit'
                    value={formData.unit}
                    onChange={handleChange}
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  >
                    <option value='kg'>kg</option>
                    <option value='g'>g</option>
                    <option value='L'>L</option>
                    <option value='ml'>ml</option>
                    <option value='개'>개</option>
                  </select>
                </div>
              </div>

              {/* LOT 번호 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  LOT 번호
                </label>
                <input
                  type='text'
                  name='lotNumber'
                  value={formData.lotNumber}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='자동 생성'
                />
              </div>

              {/* 도매가 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  도매가
                </label>
                <input
                  type='number'
                  step='0.01'
                  name='wholesalePrice'
                  value={formData.wholesalePrice}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='도매가 입력'
                />
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

              {/* 비고 */}
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  비고
                </label>
                <input
                  type='text'
                  name='note'
                  value={formData.note}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
                  placeholder='비고 입력'
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
