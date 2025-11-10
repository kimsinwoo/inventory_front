import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import BOMRegistration from './BOMRegistration';
import BOMList from './BOMList';

const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';

const BOMManagement = () => {
  const [bomList, setBomList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [search, setSearch] = useState('');

  const fetchList = useCallback(async (keyword = '') => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API}/boms`, {
        params: { search: keyword, page: 1, limit: 1000 },
      });

      const payload = res.data || {};
      const rows = Array.isArray(payload.rows)
        ? payload.rows
        : Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      const mapped = rows.map((r) => ({
        id: r.id,
        bomName: r.name || r.bomName,
        updatedDate: String(r.updated_at || r.updatedAt || r.created_at || '')
          .slice(0, 10),
        // 상세는 클릭 시 개별 조회
        materials: [],
      }));
      setBomList(mapped);
    } catch (e) {
      console.error('GET /boms failed', e);
      setError(e?.response?.data?.message || 'BOM 목록을 불러오지 못했습니다.');
      setBomList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const getBomDetails = useCallback(async (id) => {
    const res = await axios.get(`${API}/boms/${id}`);
    const b = res.data?.data || res.data || {};
    const materials = Array.isArray(b.components)
      ? b.components.map((c) => ({
          id: c.id,
          code: c.item?.code || c.itemCode,
          name: c.item?.name || c.name,
          amount: Number(c.quantity ?? c.amount ?? 0),
          unit: c.unit || c.item?.unit || 'EA',
        }))
      : [];
    return {
      id: b.id,
      bomName: b.name || b.bomName,
      updatedDate: String(b.updated_at || b.updatedAt || b.created_at || '')
        .slice(0, 10),
      materials,
    };
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await axios.delete(`${API}/boms/${id}`);
      await fetchList(search);
    } catch (e) {
      alert(e?.response?.data?.message || '삭제 실패');
    }
  }, [fetchList, search]);

  const handleSearch = useCallback((keyword) => {
    setSearch(keyword);
    fetchList(keyword);
  }, [fetchList]);

  const handleSaveBOM = useCallback(async (newBOM) => {
    const payload = {
      name: newBOM.bomName,
      description: newBOM.description || '',
      lines: (newBOM.materials || []).map((m, i) => ({
        itemCode: m.code,
        quantity: Number(m.amount),
        unit: m.unit,
        sortOrder: i + 1,
      })),
    };
    await axios.post(`${API}/boms`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    await fetchList(search);
  }, [fetchList, search]);

  return (
    <div className="space-y-6">
      <BOMRegistration onSave={handleSaveBOM} />
      <BOMList
        bomList={bomList}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        onSearch={handleSearch}
        onExpand={getBomDetails}
      />
    </div>
  );
};

export default BOMManagement;
