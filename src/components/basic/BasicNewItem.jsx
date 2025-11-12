import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { itemsAPI, factoriesAPI } from '../../api';

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code) newErrors.code = '품목 코드를 입력해주세요';
    if (!formData.name) newErrors.name = '품목명을 입력해주세요';
    if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
    if (!formData.factoryId) newErrors.factoryId = '담당공장을 선택해주세요';
    if (!formData.storageConditionId) newErrors.storageConditionId = '보관조건을 선택해주세요';
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

  const normCategory = (v) => {
    const m = {
      원재료: 'RawMaterial',
      반재료: 'SemiFinished',
      반제품: 'SemiFinished',
      완제품: 'Finished',
      소모품: 'Supply',
    };
    return m[v] || v;
  };

  const normUnit = (v) => {
    const m = { kg: 'kg', g: 'g', ea: 'EA', box: 'BOX', pcs: 'PCS', EA: 'EA', BOX: 'BOX', PCS: 'PCS' };
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
        category: normCategory(formData.category),
        factoryId: Number(formData.factoryId),
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
    }
  };

  const factorySelect = useMemo(() => {
    if (factoryOptions.length === 0) return <option value="">공장 없음</option>;
    return (
      <>
        <option value="">공장 선택</option>
        {factoryOptions.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name} {f.type ? `(${f.type})` : ''}
          </option>
        ))}
      </>
    );
  }, [factoryOptions]);

  const storageSelect = (
    <>
      <option value="">보관조건 선택</option>
      <option value="냉동">냉동</option>
      <option value="냉장">냉장</option>
      <option value="실온">실온</option>
    </>
  );

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
          {/* 코드 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">품목코드</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              maxLength={10}
              placeholder="RAW0001"
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
              <option value="">카테고리 선택</option>
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
          {/* 유통기한(일) – 참고용 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">유통기한 (일)</label>
            <input
              type="number"
              value={formData.shelfLife}
              onChange={(e) => handleInputChange('shelfLife', e.target.value)}
              placeholder="예: 7"
              className="w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm"
              disabled={loading}
            />
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
              <option value="">단위</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="EA">EA</option>
              <option value="BOX">BOX</option>
              <option value="PCS">PCS</option>
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
