import { useState, useEffect, useMemo } from 'react';
import { Package, Edit, Trash2, Factory, Save, X } from 'lucide-react';
import Pagination from '../common/Pagination';
<<<<<<< HEAD
<<<<<<< HEAD
import { fetchItems, updateItem, deleteItem } from '../../store/modules/basic/actions';
import {
  selectItems,
  selectItemsLoading,
  selectItemOperation,
  selectItemOperationLoading,
} from '../../store/modules/basic/selectors';
=======

const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';
>>>>>>> cbd6d9ee436f68a7a9dc5ebefa28877a8d40d452

const BasicItemList = () => {
  const dispatch = useDispatch();

  // Redux 상태 조회
  const items = useSelector(selectItems) || [];
  const itemsLoading = useSelector(selectItemsLoading);
  const itemOperation = useSelector(selectItemOperation);
  const itemOperationLoading = useSelector(selectItemOperationLoading);
=======
import { itemsAPI } from '../../api';

const BasicItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
>>>>>>> origin/label-print

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 컴포넌트 마운트 시 품목 목록 조회
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await itemsAPI.getItems();
        const data = response.data?.data || response.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('품목 목록 로드 실패:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, []);

  // 품목 수정/삭제 성공 시 목록 다시 조회
  useEffect(() => {
    if (itemOperation && !itemOperationLoading) {
      dispatch(fetchItems.request());
      setEditingItemId(null);
      setEditForm({});
    }
  }, [itemOperation, itemOperationLoading, dispatch]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const handleDelete = (itemId) => {
    if (!window.confirm('정말로 이 품목을 삭제하시겠습니까?')) return;
<<<<<<< HEAD
    dispatch(deleteItem.request(itemId));

    // 현재 페이지의 마지막 항목 삭제 시 페이지 조정
    if ((currentPage - 1) * itemsPerPage >= items.length - 1) {
      setCurrentPage((p) => Math.max(1, p - 1));
=======
    try {
      await itemsAPI.deleteItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
      alert('품목이 삭제되었습니다.');
    } catch (error) {
      console.error('품목 삭제 실패:', error);
      alert(error.response?.data?.message || '품목 삭제에 실패했습니다.');
>>>>>>> origin/label-print
    }
  };

  const handleEditStart = (item) => {
    setEditingItemId(item.id);
    setEditForm({
<<<<<<< HEAD
      name: item.name,
      category: item.category,
      factoryId: item.factoryId || item.Factory?.id || '',
      storageConditionId: item.storageConditionId || item.StorageCondition?.name || '',
      shelfLife: item.shelfLife || item.shelf_life || '',
      wholesalePrice: item.wholesalePrice ?? item.wholesale_price ?? '',
      unit: item.unit,
=======
      code: item.code || '',
      name: item.name || '',
      category: item.category || '',
      unit: item.unit || '',
      wholesalePrice: item.wholesale_price ?? item.wholesalePrice ?? "",
>>>>>>> origin/label-print
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

<<<<<<< HEAD
  const handleEditSave = (item) => {
    const payload = {
      name: editForm.name.trim(),
      category: editForm.category,
      factoryId: Number(editForm.factoryId),
      storageConditionId: editForm.storageConditionId,
      shelfLife: Number(editForm.shelfLife),
      wholesalePrice: Number(editForm.wholesalePrice) || 0,
      unit: editForm.unit,
    };

    dispatch(updateItem.request({ id: item.id, data: payload }));
  };

  const getFactoryName = (item) => {
    const factoryId = item?.factoryId || item?.Factory?.id;
    if (factoryId === 1) return '1공장';
    if (factoryId === 2) return '2공장';
    return item?.Factory?.name || item?.factory?.name || '-';
=======
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

      const response = await itemsAPI.updateItem(item.id, payload);
      
      if (response.data?.ok || response.data?.data) {
        // 성공 처리 - 목록 새로고침
        const itemsResponse = await itemsAPI.getItems();
        const data = itemsResponse.data?.data || itemsResponse.data || [];
        setItems(Array.isArray(data) ? data : []);
        
        setEditingItemId(null);
        setEditForm({});
        alert('품목이 성공적으로 수정되었습니다.');
      } else {
        throw new Error(response.data?.message || "수정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error('품목 수정 실패:', error);
      alert(error.response?.data?.message || error.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setEditLoading(false);
    }
>>>>>>> origin/label-print
  };

  const getStorageName = (item) =>
    item?.StorageCondition?.name || item?.storageCondition?.name || item?.storageConditionId || '-';

  const getWholesalePrice = (item) =>
    item.wholesalePrice ?? item.wholesale_price ?? item.default_wholesale_price ?? null;

  const getTotalQty = (item) =>
    item.total_quantity ?? item.totalQuantity ?? item.aggregate_stock ?? null;

  const categoryOptions = ['원재료', '반재료', '완제품', '소모품'];
  const unitOptions = ['kg', 'g', 'ea', 'box', 'pallet'];
  const factoryOptions = ['1공장', '2공장'];
  const storageOptions = ['냉동', '냉장', '실온'];

  return (
    <div className='rounded-xl bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center gap-2'>
        <Package className='h-5 w-5 text-[#674529]' />
        <h2 className='text-base text-[#674529]'>등록된 품목 목록</h2>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full table-fixed'>
          <colgroup>
            <col style={{ width: '9%' }} />  {/* 품목코드 */}
            <col style={{ width: '20%' }} /> {/* 품목명 */}
            <col style={{ width: '9%' }} />  {/* 카테고리 */}
            <col style={{ width: '9%' }} />  {/* 담당공장 */}
            <col style={{ width: '9%' }} />  {/* 보관조건 */}
            <col style={{ width: '9%' }} />  {/* 유통기한 */}
            <col style={{ width: '9%' }} />  {/* 도매가 */}
            <col style={{ width: '9%' }} />  {/* 수량 */}
            <col style={{ width: '9%' }} />  {/* 단위 */}
            <col style={{ width: '8%' }} />  {/* 작업 */}
          </colgroup>
          <thead className='border-b border-gray-200'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>품목코드</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>품목명</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>카테고리</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>담당공장</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>보관조건</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>유통기한(일)</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-900'>도매가(원)</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>수량</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>단위</th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-900'>작업</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {itemsLoading ? (
              <tr>
                <td colSpan={10} className='px-4 py-8 text-center text-sm text-gray-400'>불러오는 중...</td>
              </tr>
            ) : pageData.length > 0 ? (
              pageData.map((item) => {
                const price = getWholesalePrice(item);
                const qty = getTotalQty(item);
                const editing = editingItemId === item.id;
                return (
                  <tr key={item.id} className='transition-colors hover:bg-gray-50/50'>
                    {/* 품목코드 - 읽기전용 (10자 미만) */}
                    <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                      {item.code}
                    </td>
                    {/* 품목명 -(50자 이하) */}
                    <td className='px-4 py-4 text-sm text-gray-900'>
                      {editing ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => handleEditChange("name", e.target.value)}
                          maxLength={50}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={itemOperationLoading}
                        />
                      ) : (
                        <div className="truncate" title={item.name}>{item.name}</div>
                      )}
                    </td>
                    {/* 카테고리 -(select) */}
                    <td className='px-4 py-4'>
                      {editing ? (
                        <select
                          value={editForm.category}
                          onChange={e => handleEditChange("category", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={itemOperationLoading}
                        >
                          {categoryOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700'>
                          {item.category}
                        </span>
                      )}
                    </td>
                    {/* 담당공장 -(select - 1공장, 2공장) */}
                    <td className='px-4 py-4'>
                      {editing ? (
                        <select
                          value={editForm.factoryId}
                          onChange={e => handleEditChange("factoryId", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={itemOperationLoading}
                        >
                          <option value="" disabled hidden>선택</option>
                          {factoryOptions.map((opt, idx) => (
                            <option key={opt} value={idx + 1}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <span className='inline-flex items-center gap-1 text-sm text-gray-700'>
                          <div className='text-[#724323]'><Factory className='h-3 w-3' /></div>
                          <span>{getFactoryName(item)}</span>
                        </span>
                      )}
                    </td>
                    {/* 보관조건 -(4글자) */}
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      {editing ? (
                        <select
                          value={editForm.storageConditionId}
                          onChange={e => handleEditChange("storageConditionId", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={itemOperationLoading}
                        >
                          <option value="" disabled hidden>선택</option>
                          {storageOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        getStorageName(item)
                      )}
                    </td>
                    {/* 유통기한 -(숫자 3글자) */}
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      {editing ? (
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={editForm.shelfLife}
                          onChange={e => handleEditChange("shelfLife", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-right"
                          disabled={itemOperationLoading}
                        />
                      ) : (
                        item.shelfLife || item.shelf_life || '-'
                      )}
                    </td>
                    {/* 도매가 */}
                    <td className='px-4 py-4 text-right text-sm text-gray-700'>
                      {editing ? (
                        <input
                          type="number"
                          min={0}
                          value={editForm.wholesalePrice}
                          onChange={e => handleEditChange("wholesalePrice", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs text-right"
                          disabled={itemOperationLoading}
                        />
                      ) : (
                        price == null ? '-' : Number(price).toLocaleString()
                      )}
                    </td>
                    {/* 수량 - 읽기전용 */}
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      {qty == null ? '-' : Number(qty).toLocaleString()}
                    </td>
                    {/* 단위 -(select - kg, g, ea, box, pallet) */}
                    <td className='px-4 py-4 text-sm text-gray-700'>
                      {editing ? (
                        <select
                          value={editForm.unit}
                          onChange={e => handleEditChange("unit", e.target.value)}
                          className="w-full rounded border border-gray-200 px-2 py-1 text-xs"
                          disabled={itemOperationLoading}
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
                              disabled={itemOperationLoading}
                              title="저장"
                              onClick={() => handleEditSave(item)}
                            >
                              <Save className='h-4 w-4' />
                            </button>
                            <button
                              className='p-1 text-gray-500 hover:text-gray-700'
                              disabled={itemOperationLoading}
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
                              disabled={editingItemId !== null || itemOperationLoading}
                              title="수정"
                            >
                              <Edit className='h-4 w-4' />
                            </button>
                            <button
                              className='text-gray-500 transition-colors hover:text-red-600'
                              onClick={() => handleDelete(item.id)}
                              title="삭제"
                              disabled={editingItemId !== null || itemOperationLoading}
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
              <tr><td colSpan={10} className='px-4 py-8 text-center text-sm text-gray-400'>데이터가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default BasicItemList;
