import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Package, Trash2, Plus, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';

const BOMRegistration = ({ onSaved }) => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [rawAndSemi, setRawAndSemi] = useState([]); // [{id, code, name, unit, category}]
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | RAW | SEMI

  const [bomName, setBomName] = useState('');
  const [description, setDescription] = useState('');

  const [currentLines, setCurrentLines] = useState([]); // table rows
  const [newLine, setNewLine] = useState(null);         // editing row

  // 자재 목록 로드 (원재료 + 반제품)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await axios.get(`${API}/items`, { params: { limit: 1000 } });
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        const pick = rows
          .filter(r => r.category === 'RawMaterial' || r.category === 'SemiFinished')
          .map(r => ({
            id: r.id,
            code: r.code,
            name: r.name,
            unit: r.unit || 'EA',
            category: r.category,
          }));
        setRawAndSemi(pick);
      } catch (e) {
        console.error('GET /items failed', e);
        setErr('자재 목록을 불러오지 못했습니다.');
        setRawAndSemi([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rawAndSemi.filter(m => {
      if (typeFilter === 'RAW' && m.category !== 'RawMaterial') return false;
      if (typeFilter === 'SEMI' && m.category !== 'SemiFinished') return false;
      return (m.code + m.name).toLowerCase().includes(q);
    });
  }, [rawAndSemi, search, typeFilter]);

  const handleAddLine = () => {
    const nextId = currentLines.length > 0 ? Math.max(...currentLines.map(i => i._rid)) + 1 : 1;
    // 편집행 시작 (필수: itemId-or-itemCode, quantity, unit / 선택: lossRate)
    setNewLine({
      _rid: nextId,         // 로컬 렌더링용 키
      itemId: null,         // 또는 itemCode 사용 가능
      code: '',             // 화면 표시용
      name: '',             // 화면 표시용
      unit: 'g',
      quantity: '',
      lossRate: '',         // 0~1
    });
  };

  const onSelectMaterial = (itemIdStr) => {
    const itemId = Number(itemIdStr) || null;
    const item = rawAndSemi.find(m => m.id === itemId);
    if (item && newLine) {
      setNewLine({
        ...newLine,
        itemId: item.id,
        code: item.code,
        name: item.name,
        unit: item.unit || newLine.unit,
      });
    }
  };

  const confirmNewLine = () => {
    if (!newLine?.itemId) return alert('자재를 선택해 주세요.');
    const qty = Number(newLine.quantity);
    if (!(qty > 0)) return alert('수량을 0보다 큰 숫자로 입력해 주세요.');
    if (!newLine.unit) return alert('단위를 선택해 주세요.');
    const loss = newLine.lossRate === '' ? '' : Number(newLine.lossRate);
    if (!(loss === '' || (loss >= 0 && loss <= 1))) return alert('손실률은 0~1 사이의 숫자여야 합니다.');

    setCurrentLines(prev => [...prev, {
      _rid: newLine._rid,
      itemId: newLine.itemId,  // 서버로 보낼 핵심
      unit: newLine.unit,
      quantity: qty,
      lossRate: loss === '' ? undefined : loss,
      // 화면 표시용
      code: newLine.code,
      name: newLine.name,
    }]);
    setNewLine(null);
  };

  const removeLine = (_rid) => {
    setCurrentLines(currentLines.filter(i => i._rid !== _rid));
  };

  const handleSave = async () => {
    if (!bomName.trim()) return alert('BOM 명을 입력해주세요.');
    if (currentLines.length === 0) return alert('구성품목을 최소 1개 이상 추가해주세요.');

    const payload = {
      name: bomName.trim(),
      description: description?.trim() || undefined,
      lines: currentLines.map(l => ({
        itemId: l.itemId,           // 또는 itemCode 사용 가능
        quantity: l.quantity,
        unit: l.unit,
        ...(l.lossRate !== undefined ? { lossRate: l.lossRate } : {}),
      })),
    };

    try {
      const res = await axios.post(`${API}/boms`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      // 저장 성공 후 초기화
      setBomName('');
      setDescription('');
      setCurrentLines([]);
      setNewLine(null);
      alert('BOM이 성공적으로 저장되었습니다!');

      // 부모에게 알림(목록 새로고침 등)
      if (typeof onSaved === 'function') onSaved(res.data?.data);
    } catch (e) {
      console.error('POST /boms failed', e);
      alert(e?.response?.data?.message || 'BOM 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='rounded-xl bg-white p-6 shadow-sm'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Package className='h-5 w-5 text-[#674529]' />
          <h2 className='text-base text-[#674529]'>BOM 등록</h2>
        </div>
        <button
          onClick={handleSave}
          className='flex items-center gap-2 rounded-xl bg-[#674529] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#553821]'
        >
          BOM 저장
        </button>
      </div>

      {/* 기본정보 */}
      <div className='mb-4 grid grid-cols-1 gap-3 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>BOM 명</label>
          <input
            type='text'
            value={bomName}
            onChange={(e) => setBomName(e.target.value)}
            placeholder='BOM 명을 입력하세요'
            className='w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm'
          />
        </div>
        <div>
          <label className='mb-2 block text-sm font-medium text-gray-700'>설명 (선택)</label>
          <input
            type='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='설명을 입력하세요'
            className='w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm'
          />
        </div>
      </div>

      {/* 검색/필터 */}
      <div className='mb-4 flex gap-2'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='코드/이름 검색'
          className='w-56 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm'
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className='w-44 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm'
        >
          <option value='ALL'>전체</option>
          <option value='RAW'>원재료만</option>
          <option value='SEMI'>반제품만</option>
        </select>
      </div>

      {/* 테이블 */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='border-b border-gray-200'>
            <tr>
              <th className='w-[14%] px-4 py-3 text-left text-sm font-medium text-gray-900'>자재 코드</th>
              <th className='w-[34%] px-4 py-3 text-left text-sm font-medium text-gray-900'>자재명</th>
              <th className='w-[14%] px-4 py-3 text-left text-sm font-medium text-gray-900'>수량</th>
              <th className='w-[14%] px-4 py-3 text-left text-sm font-medium text-gray-900'>단위</th>
              <th className='w-[14%] px-4 py-3 text-left text-sm font-medium text-gray-900'>손실률</th>
              <th className='w-[10%] px-4 py-3 text-center text-sm font-medium text-gray-900'>작업</th>
            </tr>
          </thead>
          <tbody>
            {currentLines.map((line) => (
              <tr key={line._rid} className='border-b border-gray-100'>
                <td className='px-4 py-3 text-sm text-gray-700'>{line.code}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{line.name}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{line.quantity}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{line.unit}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{line.lossRate ?? '-'}</td>
                <td className='px-4 py-3 text-center'>
                  <button
                    onClick={() => removeLine(line._rid)}
                    className='inline-flex items-center justify-center text-red-500 hover:text-red-700'
                    title='삭제'
                  >
                    <Trash2 className='h-5 w-5' />
                  </button>
                </td>
              </tr>
            ))}

            {/* 신규 라인 편집행 */}
            {newLine && (
              <tr className='border-b border-gray-100 bg-white'>
                <td className='px-4 py-3 text-sm text-gray-700'>
                  <input
                    type='text'
                    value={newLine.code}
                    readOnly
                    className='w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm text-gray-500 focus:outline-none'
                  />
                </td>
                <td className='px-4 py-3 text-sm text-gray-700'>
                  <select
                    value={newLine.itemId || ''}
                    onChange={(e) => onSelectMaterial(e.target.value)}
                    className='w-full rounded border border-gray-300 px-2 py-1 text-sm'
                  >
                    <option value=''>자재 선택</option>
                    {filtered.slice(0, 300).map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.category === 'RawMaterial' ? '원재료' : '반제품'}] {m.code} - {m.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className='px-4 py-3 text-sm text-gray-700'>
                  <input
                    type='number'
                    value={newLine.quantity}
                    onChange={(e) => setNewLine({ ...newLine, quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmNewLine(); }}
                    className='w-full rounded border border-gray-300 px-2 py-1 text-sm'
                    placeholder='수량'
                    min='0'
                    step='any'
                  />
                </td>
                <td className='px-4 py-3 text-sm text-gray-700'>
                  <select
                    value={newLine.unit}
                    onChange={(e) => setNewLine({ ...newLine, unit: e.target.value })}
                    className='w-full rounded border border-gray-300 px-2 py-1 text-sm'
                  >
                    <option value='g'>g</option>
                    <option value='kg'>kg</option>
                    <option value='EA'>EA</option>
                    <option value='BOX'>BOX</option>
                    <option value='PCS'>PCS</option>
                  </select>
                </td>
                <td className='px-4 py-3 text-sm text-gray-700'>
                  <input
                    type='number'
                    value={newLine.lossRate}
                    onChange={(e) => setNewLine({ ...newLine, lossRate: e.target.value === '' ? '' : Number(e.target.value) })}
                    className='w-full rounded border border-gray-300 px-2 py-1 text-sm'
                    placeholder='0~1 (선택)'
                    min='0'
                    max='1'
                    step='any'
                  />
                </td>
                <td className='px-4 py-3 text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      onClick={confirmNewLine}
                      className='inline-flex items-center justify-center text-green-500 hover:text-green-700'
                      title='확인'
                    >
                      <Plus className='h-5 w-5' />
                    </button>
                    <button
                      onClick={() => setNewLine(null)}
                      className='inline-flex items-center justify-center text-red-500 hover:text-red-700'
                      title='취소'
                    >
                      <X className='h-5 w-5' />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 라인 추가 버튼 */}
      <div className='mt-4 flex justify-end'>
        <button
          onClick={handleAddLine}
          disabled={!!newLine || loading || !!err}
          className='flex items-center gap-2 rounded-xl bg-[#674529] px-4 py-2 text-sm text-white hover:bg-[#553821] disabled:opacity-50'
        >
          <Plus className='h-4 w-4' />
          자재 추가
        </button>
      </div>
      {loading && <div className='mt-3 text-xs text-gray-600'>자재 목록 로딩 중...</div>}
      {err && <div className='mt-3 text-xs text-red-600'>{err}</div>}
    </div>
  );
};

export default BOMRegistration;
