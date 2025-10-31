import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { temperatureService } from '../../services';

const TemperatureInput = ({ onTemperatureAdded }) => {
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    hour: '',
    minute: '',
    storageType: '냉장고',
    temperature: '',
    inspector: '',
  });

  const storageTypes = ['냉장고', '냉동고', '상온'];

  // 시간 옵션 (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  // 분 옵션 (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!filters.temperature || !filters.inspector) {
      alert('온도와 검수자는 필수 입력 항목입니다.');
      return;
    }

    try {
      // 시간 조합
      const hour = filters.hour || '00';
      const minute = filters.minute || '00';
      const time = `${hour}:${minute}`;

      await temperatureService.create({
        date: filters.date,
        time,
        storageType: filters.storageType,
        temperature: filters.temperature,
        inspector: filters.inspector,
      });

      alert('온도 기록이 등록되었습니다!');

      // 폼 초기화
      setFilters({
        date: new Date().toISOString().split('T')[0],
        hour: '',
        minute: '',
        storageType: '냉장고',
        temperature: '',
        inspector: '',
      });

      // 부모 컴포넌트에 알림
      if (onTemperatureAdded) {
        onTemperatureAdded();
      }
    } catch (error) {
      console.error('온도 기록 등록 실패:', error);
      alert(error.customMessage || '온도 기록 등록에 실패했습니다.');
    }
  };

  return (
    <div className='mb-6 rounded-xl bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center space-x-2'>
        <Filter className='h-5 w-5 text-[#674529]' />
        <h3 className='text-lg text-[#674529]'>재고 등록</h3>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-6'>
        {/* 날짜 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-[#000]'>
            날짜
          </label>
          <input
            type='date'
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className='w-full cursor-pointer rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] outline-none transition-all'
          />
        </div>

        {/* 시간 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-[#000]'>
            시간
          </label>
          <div className='flex items-center space-x-1'>
            <div className='relative flex-1'>
              <select
                value={filters.hour}
                onChange={(e) => handleFilterChange('hour', e.target.value)}
                className='w-full cursor-pointer appearance-none rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] outline-none transition-all'
              >
                <option value=''>00</option>
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#674529]' />
            </div>
            <span className='text-[#000]'>:</span>
            <div className='relative flex-1'>
              <select
                value={filters.minute}
                onChange={(e) => handleFilterChange('minute', e.target.value)}
                className='w-full cursor-pointer appearance-none rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] outline-none transition-all'
              >
                <option value=''>00</option>
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#674529]' />
            </div>
          </div>
        </div>

        {/* 보관 유형 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-[#000]'>
            보관 유형
          </label>
          <div className='relative'>
            <select
              value={filters.storageType}
              onChange={(e) => handleFilterChange('storageType', e.target.value)}
              className='w-full cursor-pointer appearance-none rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] outline-none transition-all'
            >
              {storageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#674529]' />
          </div>
        </div>

        {/* 온도 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-[#000]'>
            온도
          </label>
          <input
            type='text'
            value={filters.temperature}
            onChange={(e) => handleFilterChange('temperature', e.target.value)}
            placeholder='온도 입력'
            className='w-full rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] placeholder-gray-400 outline-none transition-all'
          />
        </div>

        {/* 검수자 */}
        <div>
          <label className='mb-2 block text-sm font-medium text-[#000]'>
            검수자
          </label>
          <input
            type='text'
            value={filters.inspector}
            onChange={(e) => handleFilterChange('inspector', e.target.value)}
            placeholder='검수자'
            className='w-full rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] placeholder-gray-400 outline-none transition-all'
          />
        </div>

        {/* 등록 버튼 */}
        <div className='flex items-end'>
          <button
            onClick={handleSubmit}
            className='w-full rounded-xl bg-[#724323] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#5a3419]'
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemperatureInput;