import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { temperatureService } from '../../services';

const TemperatureList = ({ refreshTrigger }) => {
  const [temperatureData, setTemperatureData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    fetchTemperatureData();
  }, [currentDate, refreshTrigger]);

  const fetchTemperatureData = async () => {
    setLoading(true);
    try {
      const response = await temperatureService.getAll({ date: currentDate });
      const data = response.data || response || [];
      setTemperatureData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('온도 데이터 조회 실패:', error);
      setTemperatureData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const handleDelete = (id) => {
    // 삭제 로직 (API 호출)
    console.log('삭제:', id);
    if (window.confirm('정말 삭제하시겠습니까?')) {
      // 실제로는 API 호출 후 데이터 새로고침
      alert('삭제되었습니다.');
    }
  };

  // 현재 선택된 날짜와 등록일시가 일치하는 데이터만 필터링
  const filteredData = useMemo(() => {
    return temperatureData.filter((item) => {
      // registeredAt에서 날짜 부분만 추출 (YYYY-MM-DD)
      const itemDate = item.registeredAt.split(' ')[0];
      return itemDate === currentDate;
    });
  }, [temperatureData, currentDate]);

  return (
    <div className='rounded-xl bg-white p-6 shadow-sm'>
      {/* 날짜 네비게이션 */}
      <div className='mb-6 flex items-center justify-center space-x-4'>
        <button
          onClick={handlePreviousDay}
          className='rounded-lg p-2 transition-colors hover:bg-gray-100'
        >
          <ChevronLeft className='h-6 w-6 text-gray-600' />
        </button>
        <div className='text-xl font-medium text-[#000]'>{currentDate}</div>
        <button
          onClick={handleNextDay}
          className='rounded-lg p-2 transition-colors hover:bg-gray-100'
        >
          <ChevronRight className='h-6 w-6 text-gray-600' />
        </button>
      </div>

      {/* 데이터 테이블 */}
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse'>
          <thead>
            <tr className='border-b border-gray-200 bg-gray-50'>
              <th className='px-6 py-4 text-center text-sm font-medium text-[#000]'>
                시간
              </th>
              <th className='px-6 py-4 text-center text-sm font-medium text-[#000]'>
                보관 유형
              </th>
              <th className='px-6 py-4 text-center text-sm font-medium text-[#000]'>
                온도
              </th>
              <th className='px-6 py-4 text-center text-sm font-medium text-[#000]'>
                검수자
              </th>
              <th className='px-6 py-4 text-center text-sm font-medium text-[#000]'>
                등록일시
              </th>
              <th className='px-6 py-4 text-center text-sm font-medium text-[#000]'>

              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  className='border-b border-gray-100 transition-colors hover:bg-gray-50'
                >
                  <td className='px-6 py-4 text-center text-sm text-[#000]'>
                    {item.time}
                  </td>
                  <td className='px-6 py-4 text-center text-sm text-[#000]'>
                    {item.storageType}
                  </td>
                  <td className='px-6 py-4 text-center text-sm text-[#000]'>
                    {item.temperature}
                  </td>
                  <td className='px-6 py-4 text-center text-sm text-[#000]'>
                    {item.inspector}
                  </td>
                  <td className='px-6 py-4 text-center text-sm text-[#000]'>
                    {item.registeredAt}
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className='text-sm font-medium text-red-600 transition-colors hover:text-red-800'
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan='6'
                  className='px-6 py-12 text-center text-sm text-gray-500'
                >
                  온도 관리 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TemperatureList;