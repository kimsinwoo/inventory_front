// src/pages/BOM/BOMRegistration.jsx
import { useState, useEffect } from 'react';
import { Package, Trash2, Plus, X, Check } from 'lucide-react';
import { itemsAPI, bomsAPI } from '../../api';

const BOMRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);

  const [allItems, setAllItems] = useState([]);
  const [productItems, setProductItems] = useState([]);   // Finished / SemiFinished
  const [materialItems, setMaterialItems] = useState([]); // Raw / Semi / Supply

  const [currentBOMName, setCurrentBOMName] = useState('');
  const [selectedProductItemId, setSelectedProductItemId] = useState('');
  const [currentMaterials, setCurrentMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setItemsLoading(true);
        const res = await itemsAPI.getItems({ limit: 9999 });
        console.log(res.data.data);

        // Fix: Ensure rows is always an array
        const rows = Array.isArray(res.data.data) ? res.data.data : [];
        setAllItems(rows);

        const prodList = rows.filter((item) => {
          return item.category === 'Finished' || item.category === 'SemiFinished';
        });
        setProductItems(prodList);

        console.log(prodList);

        const matList = rows.filter((item) => {
          return (
            item.category === 'RawMaterial' ||
            item.category === 'SemiFinished' ||
            item.category === 'Supply'
          );
        });
        setMaterialItems(matList);
      } catch (error) {
        console.error('❌ Items 로드 실패:', error);
        setAllItems([]);
        setProductItems([]);
        setMaterialItems([]);
      } finally {
        setItemsLoading(false);
      }
    };

    loadItems();
  }, []);

  const findItemById = (id) => {
    return allItems.find((item) => item.id === id);
  };

  // BOM 추가 버튼
  const handleAddMaterial = () => {
    if (itemsLoading) {
      alert('품목 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const newId =
      currentMaterials.length > 0
        ? Math.max(...currentMaterials.map((item) => item.id)) + 1
        : 1;

    setNewMaterial({
      id: newId,
      itemId: null,
      code: '',
      name: '',
      amount: '',
      unit: 'kg',
    });
  };

  // 원재료 선택
  const handleMaterialChange = (rawItemIdString) => {
    const rawItemId = Number(rawItemIdString);
    const item = findItemById(rawItemId);

    if (!item || !newMaterial) {
      return;
    }

    setNewMaterial({
      ...newMaterial,
      itemId: item.id,
      code: item.code,
      name: item.name,
      unit: item.unit,
    });
  };

  const handleAmountChange = (amount) => {
    if (!newMaterial) {
      return;
    }
    setNewMaterial({
      ...newMaterial,
      amount,
    });
  };

  const handleUnitChange = (unit) => {
    if (!newMaterial) {
      return;
    }
    setNewMaterial({
      ...newMaterial,
      unit,
    });
  };

  const handleCancelMaterial = () => {
    setNewMaterial(null);
  };

  const handleDeleteMaterial = (id) => {
    const filtered = currentMaterials.filter((item) => item.id !== id);
    setCurrentMaterials(filtered);
  };

  const handleConfirmMaterial = () => {
    if (!newMaterial) {
      return;
    }

    const hasItemId = typeof newMaterial.itemId === 'number';
    const hasAmount = newMaterial.amount !== '' && newMaterial.amount !== null;

    if (!hasItemId || !hasAmount || newMaterial.unit === '') {
      alert('원재료, 필요량, 단위를 모두 입력해주세요.');
      return;
    }

    const merged = [...currentMaterials, newMaterial];
    setCurrentMaterials(merged);
    setNewMaterial(null);
  };

  const handleSaveBOM = async () => {
    if (currentBOMName.trim().length === 0) {
      alert('BOM 명을 입력해주세요.');
      return;
    }

    if (!selectedProductItemId) {
      alert('대상 품목(완제품/반제품)을 선택해주세요.');
      return;
    }

    if (currentMaterials.length === 0) {
      alert('원재료를 최소 1개 이상 추가해주세요.');
      return;
    }

    const components = currentMaterials.map((material, index) => {
      const quantityValue = Number(material.amount);
      return {
        itemId: material.itemId,
        quantity: Number.isNaN(quantityValue) ? 0 : quantityValue,
        unit: material.unit,
        sortOrder: index + 1,
        lossRate: 0,
      };
    });

    // 선택한 대상 품목의 code를 찾아서 payload에 포함
    const selectedProductItem = productItems.find(
      (item) => String(item.id) === String(selectedProductItemId)
    );
    const selectedProductCode = selectedProductItem ? selectedProductItem.code : '';

    const payload = {
      name: currentBOMName.trim(),
      productItemId: Number(selectedProductItemId),
      productCode: selectedProductCode, // code 추가
      components,
    };

    try {
      setLoading(true);
      const res = await bomsAPI.createBom(payload);
      console.log('✅ BOM 생성 응답:', res.data);

      alert('BOM이 성공적으로 저장되었습니다.');

      setCurrentBOMName('');
      setSelectedProductItemId('');
      setCurrentMaterials([]);
      setNewMaterial(null);
    } catch (error) {
      console.error('❌ BOM 저장 실패:', error);
      const message = error.response?.data?.message || 'BOM 저장에 실패했습니다.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-[#674529]" />
          <h2 className="text-base text-[#674529]">BOM 등록</h2>
        </div>
        <button
          onClick={handleSaveBOM}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[#674529] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#553821] hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '저장 중...' : 'BOM 저장'}
        </button>
      </div>

      {/* 대상 품목 선택 */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            대상 품목 (완제품 / 반제품)
          </label>
          <select
            value={selectedProductItemId}
            onChange={(e) => setSelectedProductItemId(e.target.value)}
            className="w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#674529] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
            disabled={itemsLoading}
          >
            <option value="">대상 품목 선택</option>
            {productItems.map((item) => {
              const label = `${item.code} - ${item.name}`;
              return (
                <option key={item.id} value={item.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            BOM 명
          </label>
          <input
            type="text"
            value={currentBOMName}
            onChange={(e) => setCurrentBOMName(e.target.value)}
            placeholder="BOM 명을 입력하세요"
            className="w-full rounded-xl border border-gray-100 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-[#674529] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#674529]/20"
          />
        </div>
      </div>

      {/* 원재료 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="w-[12%] px-4 py-3 text-left text-sm font-medium text-gray-900">
                원재료 코드
              </th>
              <th className="w-[40%] px-4 py-3 text-left text-sm font-medium text-gray-900">
                원재료명
              </th>
              <th className="w-[15%] px-4 py-3 text-left text-sm font-medium text-gray-900">
                필요량
              </th>
              <th className="w-[15%] px-4 py-3 text-left text-sm font-medium text-gray-900">
                단위
              </th>
              <th className="w-[18%] px-4 py-3 text-center text-sm font-medium text-gray-900">
                작업
              </th>
            </tr>
          </thead>
          <tbody>
            {currentMaterials.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-sm text-gray-700">{item.code}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.amount}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteMaterial(item.id)}
                    className="inline-flex items-center justify-center text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}

            {/* 신규 원재료 추가 행 */}
            {newMaterial && (
              <tr className="border-b border-gray-100 bg-white">
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input
                    type="text"
                    value={newMaterial.code}
                    readOnly
                    className="w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm text-gray-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <select
                    value={newMaterial.itemId ?? ''}
                    onChange={(e) => handleMaterialChange(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="">원재료 선택</option>
                    {materialItems.map((material) => {
                      const label = `${material.code} - ${material.name}`;
                      return (
                        <option key={material.id} value={material.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <input
                    type="number"
                    value={newMaterial.amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirmMaterial();
                      }
                    }}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                    placeholder="필요량"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <select
                    value={newMaterial.unit}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="EA">EA</option>
                    <option value="box">box</option>
                    <option value="pallet">pallet</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handleConfirmMaterial}
                      className="inline-flex items-center justify-center text-green-500 hover:text-green-700"
                      title="확인"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCancelMaterial}
                      className="inline-flex items-center justify-center text-red-500 hover:text-red-700"
                      title="취소"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* BOM 추가 버튼 */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleAddMaterial}
          disabled={newMaterial !== null || itemsLoading}
          className="flex items-center gap-2 rounded-xl bg-[#674529] px-4 py-2 text-sm text-white transition-colors hover:bg-[#553821] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          원재료 추가
        </button>
      </div>
    </div>
  );
};

export default BOMRegistration;
