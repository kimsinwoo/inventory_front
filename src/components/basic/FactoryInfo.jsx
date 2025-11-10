import axios from 'axios';
import { Factory as FactoryIcon, X, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// 환경 변수에서 API URL 가져오기 (기본값 없음 - .env 필수)
const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;

// 선택 가능한 공장 유형(원하면 여기 배열만 수정하면 됨)
const FACTORY_TYPES = ['1PreProcessing', '2Manufacturing'];

const FactoryInfo = () => {
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);

  // 공정 추가 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFactoryId, setCurrentFactoryId] = useState(null);
  const [newProcess, setNewProcess] = useState('');
  const [error, setError] = useState('');

  // 공장 추가 모달
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFactory, setNewFactory] = useState({ type: '', name: '', address: '' });
  const [otherType, setOtherType] = useState('');   // 기타(직접입력)용
  const [createErr, setCreateErr] = useState({});

  const fetchFactories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/factories`);
      setFactories(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (e) {
      console.error('fetchFactories error:', e);
      setFactories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFactories(); }, []);

  // ===== 공정 추가 모달 =====
  const handleOpenModal = (factoryId) => {
    setCurrentFactoryId(factoryId);
    setIsModalOpen(true);
    setNewProcess('');
    setError('');
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFactoryId(null);
    setNewProcess('');
    setError('');
  };

  const handleAddProcess = async () => {
    if (!newProcess.trim()) {
      setError('공정명을 입력해주세요');
      return;
    }
    try {
      const procsRes = await axios.get(`${API}/processes`);
      const exist = (procsRes.data?.data || []).find((p) => p.name === newProcess.trim());
      let processId = exist?.id;
      if (!processId) {
        const created = await axios.post(`${API}/processes`, { name: newProcess.trim() });
        processId = created.data?.data?.id;
      }
      if (!processId) throw new Error('공정 ID를 찾을 수 없습니다.');
      await axios.post(`${API}/factories/${currentFactoryId}/processes`, { processIds: [processId] });
      await fetchFactories();
      handleCloseModal();
    } catch (e) {
      console.error('handleAddProcess error:', e);
      setError(e?.response?.data?.message || '공정을 추가하는 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveProcess = async (factoryId, processId) => {
    try {
      await axios.delete(`${API}/factories/${factoryId}/processes/${processId}`);
      await fetchFactories();
    } catch (e) {
      console.error('handleRemoveProcess error:', e);
      alert('공정을 제거하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteFactory = async (factoryId) => {
    if (!window.confirm('공장을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API}/factories/${factoryId}`);
      await fetchFactories();
    } catch (e) {
      const msg = e?.response?.status === 409
        ? e?.response?.data?.message || '참조 중인 데이터가 있어 삭제할 수 없습니다.'
        : (e?.response?.data?.message || '삭제 실패');
      alert(msg);
    }
  };

  // ===== 공장 추가 모달 =====
  const openCreate = () => {
    setIsCreateOpen(true);
    setNewFactory({ type: '', name: '', address: '' });
    setOtherType('');
    setCreateErr({});
  };
  const closeCreate = () => {
    setIsCreateOpen(false);
    setNewFactory({ type: '', name: '', address: '' });
    setOtherType('');
    setCreateErr({});
  };
  const setNF = (field, val) => {
    setNewFactory((prev) => ({ ...prev, [field]: val }));
    if (createErr[field]) setCreateErr((p) => ({ ...p, [field]: '' }));
  };

  const isOtherSelected = newFactory.type === '_other';

  const validateNewFactory = () => {
    const err = {};
    if (!newFactory.type || (isOtherSelected && !otherType.trim())) {
      err.type = '유형을 선택하거나 직접 입력하세요';
    }
    if (!newFactory.name.trim()) err.name = '공장명을 입력해주세요';
    if (!newFactory.address.trim()) err.address = '주소를 입력해주세요';
    setCreateErr(err);
    return Object.keys(err).length === 0;
  };

  const handleCreateFactory = async () => {
    if (!validateNewFactory()) return;
    try {
      const typeToSend = isOtherSelected ? otherType.trim() : newFactory.type.trim();
      await axios.post(`${API}/factories`, {
        type: typeToSend,
        name: newFactory.name.trim(),
        address: newFactory.address.trim(),
      });
      await fetchFactories();
      closeCreate();
    } catch (e) {
      console.error('create factory error:', e);
      const msg = e?.response?.data?.message || '공장 생성에 실패했습니다.';
      setCreateErr((p) => ({ ...p, _global: msg }));
    }
  };

  if (loading) return <div className="p-4 text-sm text-gray-600">공장 정보를 불러오는 중...</div>;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#674529]">공장 정보</h1>
        <button
          onClick={openCreate}
          className="rounded-xl bg-[#674529] px-4 py-2 text-sm font-medium text-white hover:bg-[#553821]"
        >
          공장 추가
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {factories.map((factory) => (
          <div key={factory.id} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FactoryIcon className="h-5 w-5 text-[#674529]" />
                <h2 className="text-base text-[#674529]">{factory.type}</h2>
              </div>
              <button
                onClick={() => handleDeleteFactory(factory.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                title="공장 삭제"
              >
                <Trash2 className="h-4 w-4" /> 삭제
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">공장명</label>
                <input type="text" value={factory.name || ''} readOnly className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-gray-900" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">주소</label>
                <input type="text" value={factory.address || ''} readOnly className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-gray-900" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">담당 공정</label>
                <div className="flex flex-wrap items-center gap-2">
                  {(factory.processes || []).map((process) => (
                    <span key={process.id} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${factory.id === 1 ? 'bg-[#a3c478] text-white' : 'bg-[#f9b679] text-white'}`}>
                      {process.name}
                      <button
                        onClick={() => handleRemoveProcess(factory.id, process.id)}
                        className="ml-1 rounded p-0.5 hover:bg-black/10"
                        title="공정 제거"
                        aria-label="공정 제거"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => handleOpenModal(factory.id)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                    aria-label="공정 추가"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {factories.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-sm text-gray-500 shadow-sm">
            등록된 공장이 없습니다.
          </div>
        )}
      </div>

      {/* 공정 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#674529]" />
                <h3 className="text-lg font-semibold text-[#674529]">공정 추가</h3>
              </div>
              <button onClick={handleCloseModal} className="rounded-lg p-1 transition-colors hover:bg-gray-100" aria-label="닫기">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">공정명</label>
                <input
                  type="text"
                  value={newProcess}
                  onChange={(e) => { setNewProcess(e.target.value); if (error) setError(''); }}
                  placeholder="공정명을 입력하세요"
                  className={`w-full rounded-xl border ${error ? 'border-red-300' : 'border-gray-100'} bg-gray-100 px-4 py-2.5 text-sm text-gray-900`}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddProcess(); }}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCloseModal} className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  취소
                </button>
                <button onClick={handleAddProcess} className="flex-1 rounded-xl bg-[#674529] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#553821]">
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 공장 추가 모달 */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeCreate}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#674529]" />
                <h3 className="text-lg font-semibold text-[#674529]">공장 추가</h3>
              </div>
              <button onClick={closeCreate} className="rounded-lg p-1 transition-colors hover:bg-gray-100" aria-label="닫기">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {createErr._global && (
              <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {createErr._global}
              </div>
            )}

            <div className="space-y-4">
              {/* 공장 유형: 선택 + 기타(직접입력) */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">공장 유형</label>
                <select
                  value={newFactory.type}
                  onChange={(e) => setNF('type', e.target.value)}
                  className={`w-full rounded-xl border ${createErr.type ? 'border-red-300' : 'border-gray-100'} bg-gray-100 px-4 py-2.5 text-sm`}
                >
                  <option value="">유형 선택</option>
                  {FACTORY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="_other">기타 (직접입력)</option>
                </select>
                {isOtherSelected && (
                  <input
                    type="text"
                    value={otherType}
                    onChange={(e) => setOtherType(e.target.value)}
                    placeholder="직접 입력"
                    className="mt-2 w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm"
                  />
                )}
                {createErr.type && <p className="mt-1 text-xs text-red-500">{createErr.type}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">공장명</label>
                <input
                  type="text"
                  value={newFactory.name}
                  onChange={(e) => setNF('name', e.target.value)}
                  placeholder="예: 애니콩 의성 공장"
                  className={`w-full rounded-xl border ${createErr.name ? 'border-red-300' : 'border-gray-100'} bg-gray-100 px-4 py-2.5 text-sm`}
                />
                {createErr.name && <p className="mt-1 text-xs text-red-500">{createErr.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">주소</label>
                <input
                  type="text"
                  value={newFactory.address}
                  onChange={(e) => setNF('address', e.target.value)}
                  placeholder="주소를 입력하세요"
                  className={`w-full rounded-xl border ${createErr.address ? 'border-red-300' : 'border-gray-100'} bg-gray-100 px-4 py-2.5 text-sm`}
                />
                {createErr.address && <p className="mt-1 text-xs text-red-500">{createErr.address}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={closeCreate} className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  취소
                </button>
                <button onClick={handleCreateFactory} className="flex-1 rounded-xl bg-[#674529] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#553821]">
                  생성
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FactoryInfo;
