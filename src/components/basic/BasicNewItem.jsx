import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

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

const BasicNewItem = () => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',
    factoryId: '',
    storageConditionId: '',
    shelfLife: '',
    shortage: '',
    unit: '',
    wholesalePrice: '', // 도매가(원)
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [factoryOptions, setFactoryOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [fRes] = await Promise.all([
          axios.get(`${API}/factories`),
        ]);

        const factories = pickRows(fRes).map(toFactoryOption).filter((x) => x.id);

        setFactoryOptions(factories);

        // 옵션이 하나뿐이면 자동 선택
        if (factories.length === 1) {
          setFormData((prev) => ({ ...prev, factoryId: String(factories[0].id) }));
        }
      } catch (e) {
        console.error('초기 데이터 조회 실패', e);
        setLoadError(
          e?.response?.data?.message ||
            '공장/보관조건을 불러오지 못했습니다. API 경로나 CORS 설정을 확인하세요.'
        );
        setFactoryOptions([]);
      } finally {
        setLoading(false);
      }
    })();
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
    if (submitting) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await axios.post(`${API}/items`, {
        code: formData.code.trim(),
        name: formData.name.trim(),
        category: normCategory(formData.category),
        factoryId: Number(formData.factoryId),
        storageConditionId: formData.storageConditionId,
        shortage: Number(formData.shortage),
        unit: normUnit(formData.unit),
        wholesalePrice: Number(formData.wholesalePrice),
      });
      alert('품목이 성공적으로 등록되었습니다!');
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
    } catch (e) {
      console.error('품목 등록 실패', e);
      alert(e?.response?.data?.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const factorySelect = useMemo(() => {
    if (loading) return <option value="">불러오는 중…</option>;
    if (loadError) return <option value="">{loadError}</option>;
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
  }, [loading, loadError, factoryOptions]);

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
            disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#674529] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#553821] hover:shadow-md active:scale-95 disabled:opacity-60"
            >
              <span>{submitting ? '등록중…' : '등록'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicNewItem;
