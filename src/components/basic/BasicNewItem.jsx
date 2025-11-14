import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
<<<<<<< HEAD
<<<<<<< HEAD
import { createItem } from '../../store/modules/basic/actions';
import {
  selectItemOperation,
  selectItemOperationLoading,
  selectItemOperationError,
} from '../../store/modules/basic/selectors';
=======

const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';

// 안전 파서: 응답이 배열이든 {data: []}든 배열을 뽑아줌
const pickRows = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  // { ok:true, data:{ rows:[...] } } 같은 형태도 대비
  if (Array.isArray(res?.data?.rows)) return res.data.rows;
  return [];
};

// 공장/보관조건 레코드를 표준화
const toFactoryOption = (raw) => ({
  id: raw?.id ?? raw?.factory_id ?? raw?.FactoryId ?? raw?.ID,
  name: raw?.name ?? raw?.title ?? raw?.factory_name ?? '-',
  type: raw?.type ?? raw?.FactoryType ?? raw?.category ?? '',
});
>>>>>>> cbd6d9ee436f68a7a9dc5ebefa28877a8d40d452
=======
import { itemsAPI, factoriesAPI } from '../../api';
>>>>>>> origin/label-print

const BasicNewItem = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    factoryId: '',
    storageConditionId: '',
    shelfLife: '',
    shortage: '',
    unit: '',
    wholesalePrice: '',
  });

  const [errors, setErrors] = useState({});
<<<<<<< HEAD
  const factoryOptions = [
    { id: 1, name: '1공장' },
    { id: 2, name: '2공장' },
  ];
  const storageOptions = ['냉동', '냉장', '실온'];

  useEffect(() => {
    if (itemOperationError) {
      alert(itemOperationError || '등록 중 오류가 발생했습니다.');
    }
  }, [itemOperationError]);
=======
  const [factoryOptions, setFactoryOptions] = useState([]);

  // 공장 목록 로드
  useEffect(() => {
    const loadFactories = async () => {
      try {
        const response = await factoriesAPI.getFactories();
        const data = response.data?.data || response.data || [];
        setFactoryOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('공장 목록 로드 실패:', error);
        setFactoryOptions([]);
      }
    };
    loadFactories();
  }, []);
>>>>>>> origin/label-print

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code) newErrors.code = '품목 코드를 입력해주세요';
    else if (formData.code.length >= 10) newErrors.code = '품목 코드는 10자 미만이어야 합니다';
    if (!formData.name) newErrors.name = '품목명을 입력해주세요';
    else if (formData.name.length > 50) newErrors.name = '품목명은 50자 이하여야 합니다';
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
    if (!formData.factoryId) newErrors.factoryId = '담당공장을 선택해주세요';
    if (!formData.storageConditionId) newErrors.storageConditionId = '보관조건을 선택해주세요';
    if (!formData.shelfLife) newErrors.shelfLife = '유통기한을 입력해주세요';
    else if (formData.shelfLife > 999) newErrors.shelfLife = '유통기한은 3자리 이하여야 합니다';
    if (!formData.shortage) newErrors.shortage = '최소 보유 개수를 입력해주세요';
    if (!formData.unit) newErrors.unit = '단위를 선택해주세요';
    if (
      formData.wholesalePrice === '' ||
      Number.isNaN(Number(formData.wholesalePrice))
    ) {
      newErrors.wholesalePrice = '도매가격(원)을 숫자로 입력해주세요';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normUnit = (v) => {
    const m = { kg: 'kg', g: 'g', ea: 'ea', box: 'box', pallet: 'pallet' };
    return m[String(v).trim().toLowerCase()] || v;
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await itemsAPI.createItem({
        code: formData.code.trim(),
        name: formData.name.trim(),
        category: formData.category,
        factoryId: Number(formData.factoryId),
<<<<<<< HEAD
        storageConditionId: formData.storageConditionId,
        shelfLife: Number(formData.shelfLife),
        shortage: Number(formData.shortage),
        unit: normUnit(formData.unit),
        wholesalePrice: Number(formData.wholesalePrice),
      })
    );

    if (itemOperation && !itemOperationLoading) {
      alert('품목이 성공적으로 등록되었습니다!');
      // 폼 초기화
      setFormData({
        code: '',
        name: '',
        category: '',
        factoryId: '',
        storageConditionId: '',
        shelfLife: '',
        shortage: '',
        unit: '',
        wholesalePrice: '',
      });
=======
        shortage: Number(formData.shortage) || 0,
        shelfLife: formData.shelfLife ? Number(formData.shelfLife) : undefined,
        unit: normUnit(formData.unit),
        wholesalePrice: Number(formData.wholesalePrice) || 0,
      });

      if (response.data?.ok || response.data?.data) {
        alert('품목이 성공적으로 등록되었습니다!');
        // 폼 초기화
        setFormData({
          code: '',
          name: '',
          category: '',
          factoryId: '',
          storageConditionId: '',
          shelfLife: '',
          shortage: '',
          unit: '',
          wholesalePrice: '',
        });
        setErrors({});
      } else {
        throw new Error(response.data?.message || '등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('품목 등록 실패:', error);
      alert(error.response?.data?.message || error.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
>>>>>>> origin/label-print
    }
  };

  const factorySelect = useMemo(() => {
    return (
      <>
        <option value="" disabled hidden>공장 선택</option>
        {factoryOptions.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </>
    );
  }, [factoryOptions]);

  const storageSelect = useMemo(() => {
    return (
      <>
        <option value="" disabled hidden>보관조건 선택</option>
        {storageOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </>
    );
  }, [storageOptions]);

  return (
    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <Plus className="h-5 w-5 text-[#674529]" />
        <h2 className="text-base text-[#674529]">신규 품목 등록</h2>
      </div>

      <div className="space-y-5">
        {/* 품목명 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">품목명</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            maxLength={50}
            placeholder="품목명 입력"
            className={`w-full rounded-xl border ${
              errors.name ? 'border-red-300' : 'border-gray-100'
            } bg-gray-100 px-4 py-2.5 text-sm`}
            disabled={loading}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* 코드 - 10자 미만 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">품목코드</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              maxLength={9}
              placeholder="예: RAW0001"
              className={`w-full rounded-xl border ${
                errors.code ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={loading}
            />
            {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
          </div>

          {/* 카테고리 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full rounded-xl border ${
                errors.category ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={loading}
            >
              <option value="" disabled hidden>카테고리 선택</option>
              <option value="원재료">원재료</option>
              <option value="반재료">반재료</option>
              <option value="완제품">완제품</option>
              <option value="소모품">소모품</option>
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>

          {/* 담당공장 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">담당공장</label>
            <select
              value={formData.factoryId}
              onChange={(e) => handleInputChange('factoryId', e.target.value)}
              className={`w-full rounded-xl border ${
                errors.factoryId ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={loading}
            >
              {factorySelect}
            </select>
            {errors.factoryId && <p className="mt-1 text-xs text-red-500">{errors.factoryId}</p>}
          </div>

          {/* 보관조건 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">보관조건</label>
            <select
              value={formData.storageConditionId}
              onChange={(e) => handleInputChange('storageConditionId', e.target.value)}
              className={`w-full rounded-xl border ${
                errors.storageConditionId ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={loading}
            >
              {storageSelect}
            </select>
            {errors.storageConditionId && (
              <p className="mt-1 text-xs text-red-500">{errors.storageConditionId}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* 유통기한(일) - 숫자 3글자 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">유통기한 (일)</label>
            <input
              type="number"
              min={0}
              max={999}
              value={formData.shelfLife}
              onChange={(e) => handleInputChange('shelfLife', e.target.value)}
              placeholder="예: 7"
<<<<<<< HEAD
              className={`w-full rounded-xl border ${
                errors.shelfLife ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={itemOperationLoading}
=======
              className="w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm"
              disabled={loading}
>>>>>>> origin/label-print
            />
            {errors.shelfLife && (
              <p className='mt-1 text-xs text-red-500'>{errors.shelfLife}</p>
            )}
          </div>

          {/* 최소 보유 개수 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">최소 보유 개수</label>
            <input
              type="number"
              value={formData.shortage}
              onChange={(e) => handleInputChange('shortage', e.target.value)}
              placeholder="예: 100"
              className={`w-full rounded-xl border ${
                errors.shortage ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={loading}
            />
            {errors.shortage && <p className="mt-1 text-xs text-red-500">{errors.shortage}</p>}
          </div>

          {/* 단위 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">단위</label>
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className={`w-full rounded-xl border ${
                errors.unit ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={loading}
            >
              <option value="" disabled hidden>단위</option>
              <option value='kg'>kg</option>
              <option value='g'>g</option>
              <option value='ea'>ea</option>
              <option value='box'>box</option>
              <option value='pallet'>pallet</option>
            </select>
            {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
          </div>

          {/* 도매가(원) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">도매가 (원)</label>
            <input
              type="number"
              value={formData.wholesalePrice}
              onChange={(e) => handleInputChange('wholesalePrice', e.target.value)}
              placeholder="예: 2500"
              className={`w-full rounded-xl border ${
                errors.wholesalePrice ? 'border-red-300' : 'border-gray-100'
              } bg-gray-100 px-4 py-2.5 text-sm`}
              disabled={loading}
            />
            {errors.wholesalePrice && (
              <p className="mt-1 text-xs text-red-500">{errors.wholesalePrice}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div />
          <div />
          <div />
          {/* 등록 버튼 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">&nbsp;</label>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#674529] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#553821] hover:shadow-md active:scale-95 disabled:opacity-60"
            >
              <span>{loading ? '등록중…' : '등록'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicNewItem;
