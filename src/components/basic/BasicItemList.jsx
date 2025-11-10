import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Package, Edit, Trash2, Factory } from 'lucide-react';
import Pagination from '../common/Pagination';

const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';

const BasicItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/items`);
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        setItems(rows);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('정말로 이 품목을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API}/items/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      if ((currentPage - 1) * itemsPerPage >= items.length - 1) {
        setCurrentPage((p) => Math.max(1, p - 1));
      }
    } catch (err) {
      alert(err?.response?.data?.message || '삭제에 실패했습니다.');
    }
  };

  const getFactoryName = (item) =>
    item?.Factory?.name || item?.factory?.name || '-';
  const getStorageName = (item) =>
    item?.StorageCondition?.name || item?.storageCondition?.name || '-';

  const getWholesalePrice = (item) =>
    item.wholesale_price ?? item.default_wholesale_price ?? item.wholesalePrice ?? null;

  const getTotalQty = (item) =>
    item.total_quantity ?? item.totalQuantity ?? item.aggregate_stock ?? null;

  return (
    <div className='rounded-xl bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2'>
        <Package className='h-5 w-5 text-[#674529]' />
        <h2 className='text-base text-[#674529]'>등록된 품목 목록</h2>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='border-b border-gray-200'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>품목코드</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>품목명</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>카테고리</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>담당공장</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>보관조건</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-900'>도매가(원)</th>{/* ✅ */}
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-900'>전체수량</th>{/* ✅ */}
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>단위</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>작업</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {loading ? (
              <tr>
                <td colSpan={9} className='px-4 py-8 text-center text-sm text-gray-400'>불러오는 중...</td>
              </tr>
            ) : pageData.length > 0 ? (
              pageData.map((item) => {
                const price = getWholesalePrice(item);
                const qty = getTotalQty(item);
                return (
                  <tr key={item.id} className='transition-colors hover:bg-gray-50/50'>
                    <td className='px-4 py-4 text-sm font-medium text-gray-900'>{item.code}</td>
                    <td className='px-4 py-4 text-sm text-gray-900'>{item.name}</td>
                    <td className='px-4 py-4'>
                      <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700'>
                        {item.category}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <span className='inline-flex items-center gap-1 text-sm text-gray-700'>
                        <div className='text-[#724323]'><Factory /></div>
                        <span>{getFactoryName(item)}</span>
                      </span>
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-700'>{getStorageName(item)}</td>
                    <td className='px-4 py-4 text-right text-sm text-gray-700'>
                      {price == null ? '-' : Number(price).toLocaleString()}
                    </td>
                    <td className='px-4 py-4 text-right text-sm text-gray-700'>
                      {qty == null ? '-' : qty}
                    </td>
                    <td className='px-4 py-4 text-sm text-gray-700'>{item.unit}</td>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        <button className='text-gray-500 transition-colors hover:text-[#674529]'>
                          <Edit className='h-4 w-4' />
                        </button>
                        <button
                          className='text-gray-500 transition-colors hover:text-red-600'
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={9} className='px-4 py-8 text-center text-sm text-gray-400'>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default BasicItemList;
