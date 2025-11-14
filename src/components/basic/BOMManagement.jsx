<<<<<<< HEAD
import { useCallback, useEffect } from 'react';
import BOMRegistration from './BOMRegistration';
import BOMList from './BOMList';
<<<<<<< HEAD
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoms, createBom, deleteBom } from '../../store/modules/basic/actions';
=======

const API = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://223.130.143.87/api';
>>>>>>> cbd6d9ee436f68a7a9dc5ebefa28877a8d40d452
=======
import { useCallback, useEffect, useState } from 'react';
import BOMRegistration from './BOMRegistration';
import BOMList from './BOMList';
import { bomsAPI } from '../../api';
>>>>>>> origin/label-print

const BOMManagement = () => {
  const dispatch = useDispatch();

<<<<<<< HEAD
  // 리덕스 스토어에서 BOM 관련 상태 가져오기
  const { data: bomList, loading, error } = useSelector((state) => state.basic.boms);
  const { data: bomOperation, loading: operationLoading } = useSelector((state) => state.basic.bomOperation);

  // 컴포넌트 마운트 시 BOM 목록 조회
  useEffect(() => {
    dispatch(fetchBoms.request());
  }, [dispatch]);

  // BOM 생성 성공 시 목록 다시 조회
  useEffect(() => {
    if (bomOperation) {
      dispatch(fetchBoms.request());
=======
  const fetchList = useCallback(async (keyword = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await bomsAPI.getBoms({
        search: keyword,
        page: 1,
        limit: 1000,
      });

      const data = response.data?.data || response.data || [];
      const rows = Array.isArray(data) ? data : [];

      const mapped = rows.map((r) => ({
        id: r.id,
        bomName: r.name || r.bomName,
        updatedDate: String(r.updated_at || r.updatedAt || r.created_at || '')
          .slice(0, 10),
        // 상세는 클릭 시 개별 조회
        materials: [],
      }));
      setBomList(mapped);
    } catch (error) {
      console.error('BOM 목록 로드 실패:', error);
      setError(error.response?.data?.message || 'BOM 목록을 불러오지 못했습니다.');
      setBomList([]);
    } finally {
      setLoading(false);
>>>>>>> origin/label-print
    }
  }, [bomOperation, dispatch]);

<<<<<<< HEAD
  // BOM 삭제 핸들러
  const handleDelete = useCallback((id) => {
    dispatch(deleteBom.request(id));
  }, [dispatch]);
=======
  useEffect(() => { fetchList(); }, [fetchList]);

  const getBomDetails = useCallback(async (id) => {
    try {
      const response = await bomsAPI.getBom(id);
      const b = response.data?.data || response.data || {};
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
    } catch (error) {
      console.error('BOM 상세 조회 실패:', error);
      throw error;
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await bomsAPI.deleteBom(id);
      await fetchList(search);
    } catch (error) {
      console.error('BOM 삭제 실패:', error);
      alert(error.response?.data?.message || '삭제 실패');
    }
  }, [fetchList, search]);
>>>>>>> origin/label-print

  // BOM 검색 핸들러 (현재는 클라이언트 사이드 필터링)
  const handleSearch = useCallback((keyword) => {
    // 현재는 클라이언트 사이드 필터링이 BOMList 컴포넌트에서 처리됨
    console.log('검색어:', keyword);
  }, []);

<<<<<<< HEAD
  // BOM 저장 핸들러
  const handleSaveBOM = useCallback((newBOM) => {
    const payload = {
      name: newBOM.bomName,
      bomName: newBOM.bomName,
      description: newBOM.description || '',
      materials: (newBOM.materials || []).map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        amount: Number(m.amount),
        unit: m.unit,
      })),
      components: (newBOM.materials || []).map((m, i) => ({
        itemCode: m.code,
        item: {
          code: m.code,
          name: m.name,
          unit: m.unit,
        },
        quantity: Number(m.amount),
        unit: m.unit,
        sortOrder: i + 1,
      })),
    };

    dispatch(createBom.request(payload));
  }, [dispatch]);

  // BOM 목록을 BOMList 컴포넌트 형식에 맞게 변환
  const formattedBomList = (bomList || []).map((bom) => ({
    id: bom.id,
    bomName: bom.name || bom.bomName,
    updatedDate: String(bom.updated_at || bom.updatedAt || '').slice(0, 10),
    materials: bom.materials || [],
  }));
=======
  const handleSaveBOM = useCallback(async (newBOM) => {
    try {
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
      await bomsAPI.createBom(payload);
      await fetchList(search);
    } catch (error) {
      console.error('BOM 저장 실패:', error);
      alert(error.response?.data?.message || 'BOM 저장에 실패했습니다.');
    }
  }, [fetchList, search]);
>>>>>>> origin/label-print

  return (
    <div className="space-y-6">
      <BOMRegistration onSave={handleSaveBOM} loading={operationLoading} />
      <BOMList
        bomList={formattedBomList}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default BOMManagement;
