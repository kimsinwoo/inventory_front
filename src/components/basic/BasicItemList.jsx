import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Edit, Trash2, Factory, Save, X } from 'lucide-react';
import Pagination from '../common/Pagination';
import { selectItemDetail, selectItemDetailLoading } from '../../store/modules/basic/selectors';
import { deleteItem, fetchItems } from '../../store/modules/basic/actions';

const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';

const BasicItemList = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectItemDetail) || [];
  const loading = useSelector(selectItemDetailLoading);

  const [currentPage, setCurrentPage] = useState(1);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    dispatch(fetchItems.request());
  }, [dispatch]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage]);

  const handleDelete = async (itemId) => {
    if (!window.confirm('정말로 이 품목을 삭제하시겠습니까?')) return;
    dispatch(deleteItem.request(itemId));
  };

  const handleEditStart = (item) => {
    setEditingItemId(item.id);
    setEditForm({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      wholesalePrice: item.wholesale_price ?? item.default_wholesale_price ?? item.wholesalePrice ?? "",
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((f) => ({
      ...f,
      [field]: value,
    }));
  };

  const handleEditCancel = () => {
    setEditingItemId(null);
    setEditForm({});
  };

  // 참고 예시 REST API의 응답 데이터와 동작 흐름에 맞게 수정됨
  const handleEditSave = async (item) => {
    setEditLoading(true);
    try {
      const payload = {
        code: editForm.code,
        name: editForm.name,
        category: editForm.category,
        unit: editForm.unit,
        wholesalePrice: Number(editForm.wholesalePrice) || 0,
      };

      const endpoint = `${API}/items/${item.id}`;
      let usedMock = false;
      let responseData = null;
      let errorMsg = "";

      try {
        const res = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 404) {
            usedMock = true;
            errorMsg = '해당 ID의 품목을 찾을 수 없습니다 (404)';
          } else {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || "수정 중 오류가 발생했습니다.");
          }
        } else {
          // 응답이 { ok, message, data } 구조라고 가정 (참고 예시와 동일)
          const result = await res.json();
          if (!result.ok) {
            throw new Error(result.message || "수정 중 오류가 발생했습니다.");
          }
          responseData = result.data;
        }
      } catch (apiErr) {
        if (!errorMsg) {
          usedMock = true;
          errorMsg = (apiErr?.message || '서버와의 통신에 실패했습니다. (mock 데이터로만 수정)');
        }
      }

      if (usedMock) {
        setItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? {
                  ...i,
                  ...payload,
                  wholesale_price: payload.wholesalePrice,
                  wholesalePrice: payload.wholesalePrice,
                  default_wholesale_price: payload.wholesalePrice,
                }
              : i
          )
        );
        alert(
          `서버 저장에 실패했습니다.\n${errorMsg}\n변경 사항이 목록에만 반영되었습니다.`
        );
      } else {
        // 성공적으로 백엔드에서 수정된 데이터 반영 (응답 예시 구조 기준)
        setItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? {
                  ...i,
                  ...(responseData || payload),
                  wholesale_price:
                    responseData?.wholesalePrice ?? payload.wholesalePrice,
                  wholesalePrice:
                    responseData?.wholesalePrice ?? payload.wholesalePrice,
                  default_wholesale_price:
                    responseData?.wholesalePrice ?? payload.wholesalePrice,
                }
              : i
          )
        );
        alert('품목이 성공적으로 수정되었습니다');
      }
      setEditingItemId(null);
      setEditForm({});
    } catch (e) {
      alert(e?.message || '수정 실패');
    } finally {
      setEditLoading(false);
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

  const categoryOptions = ['원재료', '반제품', '완제품', '소모품'];
  const unitOptions = ['kg', 'g', 'EA', 'BOX', 'PCS'];

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
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-900'>도매가(원)</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-900'>전체수량</th>
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
                const editing = editingItemId === item.id;
                return (
                  <tr key={item.id} className='transition-colors hover:bg-gray-50/50'>
                    {/* 품목코드 */}
                    <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={e => handleEditChange("code", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={editLoading}
                        />
                      ) : (
                        item.code
                      )}
                    </td>
                    {/* 품목명 */}
                    <td className='px-4 py-4 text-sm text-gray-900'>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => handleEditChange("name", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={editLoading}
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    {/* 카테고리 */}
                    <td className='px-4 py-4'>
                      {editing ? (
                        <select
                          value={editForm.category}
                          onChange={e => handleEditChange("category", e.target.value)}
                          className="rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={editLoading}
                        >
                          {categoryOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700'>
                          {item.category}
                        </span>
                      )}
                    </td>
                    {/* 담당공장 */}
                    <td className='px-4 py-4'>
                      <span className='inline-flex items-center gap-1 text-sm text-gray-700'>
                        <div className='text-[#724323]'><Factory /></div>
                        <span>{getFactoryName(item)}</span>
                      </span>
                    </td>
                    {/* 보관조건 */}
                    <td className='px-4 py-4 text-sm text-gray-700'>{getStorageName(item)}</td>
                    {/* 도매가 */}
                    <td className='px-4 py-4 text-right text-sm text-gray-700'>
                      {editing ? (
                        <input
                          type="number"
                          min={0}
                          value={editForm.wholesalePrice}
                          onChange={e => handleEditChange("wholesalePrice", e.target.value)}
                          className="w-24 rounded border border-gray-200 px-2 py-1 text-xs text-right"
                          disabled={editLoading}
                        />
                      ) : (
                        price == null ? '-' : Number(price).toLocaleString()
                      )}
                    </td>
                    {/* 전체수량 */}
                    <td className='px-4 py-4 text-right text-sm text-gray-700'>
                      {qty == null ? '-' : qty}
                    </td>
                    {/* 단위 */}
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      {editing ? (
                        <select
                          value={editForm.unit}
                          onChange={e => handleEditChange("unit", e.target.value)}
                          className="rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={editLoading}
                        >
                          {unitOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        item.unit
                      )}
                    </td>
                    {/* 작업 */}
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-2'>
                        {editing ? (
                          <>
                            <button
                              className='p-1 text-green-600 hover:text-green-800'
                              disabled={editLoading}
                              title="저장"
                              onClick={() => handleEditSave(item)}
                            >
                              <Save className='h-4 w-4' />
                            </button>
                            <button
                              className='p-1 text-gray-500 hover:text-gray-700'
                              disabled={editLoading}
                              title="취소"
                              onClick={handleEditCancel}
                            >
                              <X className='h-4 w-4' />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className='text-gray-500 transition-colors hover:text-[#674529]'
                              onClick={() => handleEditStart(item)}
                              disabled={editingItemId !== null}
                              title="수정"
                            >
                              <Edit className='h-4 w-4' />
                            </button>
                            <button
                              className='text-gray-500 transition-colors hover:text-red-600'
                              onClick={() => handleDelete(item.id)}
                              title="삭제"
                              disabled={editingItemId !== null}
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </>
                        )}
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
