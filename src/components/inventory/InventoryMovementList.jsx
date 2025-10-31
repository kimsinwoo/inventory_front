import { useEffect, useState } from 'react';
import {
  Clock,
  Search,
  Filter,
  Calendar,
  Package,
  MapPin,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { inventoryService, itemService, factoryService } from '../../services';

const typeBadge = (type) => {
  const typeMap = {
    입고: 'bg-blue-50 text-blue-600 border-blue-200',
    RECEIVE: 'bg-blue-50 text-blue-600 border-blue-200',
    출고: 'bg-red-50 text-red-600 border-red-200',
    ISSUE: 'bg-red-50 text-red-600 border-red-200',
    이동출고: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    TRANSFER_OUT: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    이동입고: 'bg-purple-50 text-purple-600 border-purple-200',
    TRANSFER_IN: 'bg-purple-50 text-purple-600 border-purple-200',
    생산: 'bg-green-50 text-green-600 border-green-200',
    PRODUCTION: 'bg-green-50 text-green-600 border-green-200',
  };
  return typeMap[type] || 'bg-gray-50 text-gray-600 border-gray-200';
};

const qtyColor = (q) => {
  const s = String(q).trim();
  if (s.startsWith('+')) return 'text-green-600';
  if (s.startsWith('-')) return 'text-red-600';
  return 'text-gray-900';
};

export default function InventoryMovementList({ factoryId = '' }) {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedFactory, setSelectedFactory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 확장된 행
  const [expandedRow, setExpandedRow] = useState(null);
  
  // 필터 옵션
  const [items, setItems] = useState([]);
  const [factories, setFactories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const transactionTypes = [
    { value: 'ALL', label: '전체' },
    { value: 'RECEIVE', label: '입고' },
    { value: 'ISSUE', label: '출고' },
    { value: 'TRANSFER_OUT', label: '이동출고' },
    { value: 'TRANSFER_IN', label: '이동입고' },
  ];

  useEffect(() => {
    fetchMovements();
    fetchItems();
    fetchFactories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rows, searchTerm, selectedType, selectedItem, selectedFactory, startDate, endDate]);

  // 외부에서 공장 지정 시 동기화
  useEffect(() => {
    if (factoryId !== undefined) {
      setSelectedFactory(factoryId || '');
    }
  }, [factoryId]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      if (selectedFactory || factoryId) {
        params.factoryId = parseInt(selectedFactory || factoryId);
      }
      const response = await inventoryService.getMovements(params);
      const data = response?.data || [];
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('재고 이동 이력 불러오기 실패:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemService.getAll();
      setItems(response.data || []);
    } catch (err) {
      console.error('품목 목록 조회 실패:', err);
    }
  };

  const fetchFactories = async () => {
    try {
      const response = await factoryService.getAll();
      setFactories(response.data || []);
    } catch (err) {
      console.error('공장 목록 조회 실패:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...rows];

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (row) =>
          row.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.item?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 유형 필터
    if (selectedType && selectedType !== 'ALL') {
      filtered = filtered.filter((row) => row.typeRaw === selectedType);
    }

    // 품목 필터
    if (selectedItem) {
      filtered = filtered.filter((row) => row.item?.id === parseInt(selectedItem));
    }

    // 공장 필터
    if (selectedFactory) {
      filtered = filtered.filter(
        (row) =>
          row.fromFactory?.id === parseInt(selectedFactory) ||
          row.toFactory?.id === parseInt(selectedFactory)
      );
    }

    // 날짜 필터
    if (startDate) {
      filtered = filtered.filter((row) => {
        const rowDate = row.time?.split(' ')[0] || row.createdAt?.split('T')[0];
        return rowDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((row) => {
        const rowDate = row.time?.split(' ')[0] || row.createdAt?.split('T')[0];
        return rowDate <= endDate;
      });
    }

    setFilteredRows(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedItem('');
    setSelectedFactory('');
    setStartDate('');
    setEndDate('');
  };

  const handleExport = () => {
    // CSV 내보내기
    const headers = ['시간', '유형', '품목코드', '품목명', '바코드/LOT', '수량', '출발지', '도착지', '담당자', '비고'];
    const csvData = filteredRows.map((row) => [
      row.time || row.createdAt,
      row.type,
      row.item?.code || '-',
      row.item?.name || '-',
      row.barcode || row.lotNumber || '-',
      `${row.quantity} ${row.unit}`,
      row.fromFactory?.name || '-',
      row.toFactory?.name || '-',
      row.actorName || '-',
      row.note || '-',
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `재고이력_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className='space-y-6'>
      {/* 검색 및 필터 헤더 */}
      <div className='rounded-xl bg-white p-6 shadow-sm'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Clock className='h-5 w-5 text-[#674529]' />
            <h2 className='text-lg font-semibold text-[#674529]'>재고 이력 추적</h2>
          </div>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center space-x-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
            >
              <Filter className='h-4 w-4' />
              <span>필터</span>
              {showFilters ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
            </button>
            <button
              onClick={handleExport}
              className='flex items-center space-x-2 rounded-lg bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#553821]'
            >
              <Download className='h-4 w-4' />
              <span>내보내기</span>
            </button>
          </div>
        </div>

        {/* 검색바 */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='품목명, 품목코드, 바코드, LOT 번호로 검색...'
            className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
          />
        </div>

        {/* 필터 영역 */}
        {showFilters && (
          <div className='mt-4 grid grid-cols-5 gap-4 rounded-lg bg-gray-50 p-4'>
            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>유형</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              >
                {transactionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>품목</label>
              <select
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              >
                <option value=''>전체</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>공장/창고</label>
              <select
                value={selectedFactory}
                onChange={(e) => setSelectedFactory(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              >
                <option value=''>전체</option>
                {factories.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>시작일</label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              />
            </div>

            <div>
              <label className='mb-1 block text-xs font-medium text-gray-700'>종료일</label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-2 focus:ring-[#674529]/20'
              />
            </div>

            <div className='col-span-5 flex justify-end'>
              <button
                onClick={resetFilters}
                className='text-sm text-gray-600 underline hover:text-gray-900'
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}

        {/* 결과 카운트 */}
        <div className='mt-4 text-sm text-gray-600'>
          총 <span className='font-semibold text-[#674529]'>{filteredRows.length}</span>건의 이력
        </div>
      </div>

      {/* 이력 테이블 */}
      <div className='rounded-xl bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 bg-gray-50'>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>시간</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>유형</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>품목</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>바코드/LOT</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>수량</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>출발지</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>도착지</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>담당자</th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-700'>상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className='px-4 py-8 text-center text-sm text-gray-500' colSpan={9}>
                    불러오는 중...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className='px-4 py-8 text-center text-sm text-gray-500' colSpan={9}>
                    이력이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <>
                    <tr
                      key={index}
                      className='border-b border-gray-100 transition-colors hover:bg-gray-50'
                    >
                      <td className='px-4 py-3 text-xs text-gray-900'>
                        {row.time?.replace('T', ' ').substring(0, 19) || 
                         row.createdAt?.replace('T', ' ').substring(0, 19) || '-'}
                      </td>
                      <td className='px-4 py-3'>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${typeBadge(row.typeRaw || row.type)}`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='text-xs font-medium text-gray-900'>{row.item?.name || '-'}</div>
                        <div className='text-xs text-gray-500'>{row.item?.code || '-'}</div>
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-700'>
                        {row.barcode || row.lotNumber || '-'}
                      </td>
                      <td className='px-4 py-3'>
                        <span className={`text-xs font-semibold ${qtyColor(row.quantity)}`}>
                          {row.quantity} {row.unit}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-700'>
                        {row.fromFactory?.name || '-'}
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-700'>
                        {row.toFactory?.name || '-'}
                      </td>
                      <td className='px-4 py-3 text-xs text-gray-700'>{row.actorName || '-'}</td>
                      <td className='px-4 py-3'>
                        <button
                          onClick={() => toggleRow(index)}
                          className='text-[#674529] hover:text-[#553821]'
                        >
                          {expandedRow === index ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* 확장된 상세 정보 */}
                    {expandedRow === index && (
                      <tr className='bg-gray-50'>
                        <td colSpan={9} className='px-4 py-4'>
                          <div className='grid grid-cols-3 gap-6 text-xs'>
                            <div className='space-y-3'>
                              <div className='flex items-start space-x-2'>
                                <Package className='mt-0.5 h-4 w-4 text-gray-400' />
                                <div>
                                  <p className='text-gray-500'>품목 상세</p>
                                  <p className='font-medium text-gray-900'>
                                    {row.item?.name || '-'} ({row.item?.code || '-'})
                                  </p>
                                  <p className='text-gray-600'>
                                    카테고리: {row.item?.categoryLabel || row.item?.category || '-'}
                                  </p>
                                </div>
                              </div>

                              {row.barcode && (
                                <div className='flex items-start space-x-2'>
                                  <Package className='mt-0.5 h-4 w-4 text-gray-400' />
                                  <div>
                                    <p className='text-gray-500'>바코드</p>
                                    <p className='font-mono font-medium text-gray-900'>{row.barcode}</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className='space-y-3'>
                              <div className='flex items-start space-x-2'>
                                <MapPin className='mt-0.5 h-4 w-4 text-gray-400' />
                                <div>
                                  <p className='text-gray-500'>위치 정보</p>
                                  {row.fromFactory && (
                                    <p className='text-gray-900'>
                                      출발: {row.fromFactory.name} ({row.fromFactory.type || '-'})
                                    </p>
                                  )}
                                  {row.toFactory && (
                                    <p className='text-gray-900'>
                                      도착: {row.toFactory.name} ({row.toFactory.type || '-'})
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className='flex items-start space-x-2'>
                                <User className='mt-0.5 h-4 w-4 text-gray-400' />
                                <div>
                                  <p className='text-gray-500'>담당자</p>
                                  <p className='font-medium text-gray-900'>{row.actorName || '-'}</p>
                                </div>
                              </div>
                            </div>

                            <div className='space-y-3'>
                              <div className='flex items-start space-x-2'>
                                <Calendar className='mt-0.5 h-4 w-4 text-gray-400' />
                                <div>
                                  <p className='text-gray-500'>일시</p>
                                  <p className='font-medium text-gray-900'>
                                    {row.time?.replace('T', ' ') || row.createdAt?.replace('T', ' ') || '-'}
                                  </p>
                                </div>
                              </div>

                              {row.note && (
                                <div className='flex items-start space-x-2'>
                                  <FileText className='mt-0.5 h-4 w-4 text-gray-400' />
                                  <div>
                                    <p className='text-gray-500'>비고</p>
                                    <p className='text-gray-900'>{row.note}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
