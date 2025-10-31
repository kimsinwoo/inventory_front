import { useState, useRef, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Package, Upload, FileText, Plus, Trash2, Download, CheckCircle, TruckIcon, PackageCheck } from 'lucide-react';
import { shippingService, transactionService, inventoryService, itemService, factoryService } from '../services';
import AlertModal from '../components/common/AlertModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ============ 유틸 함수 ============
function cls(...classes) {
  return classes.filter(Boolean).join(' ');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ============ B2C: 엑셀 업로드 & CJ 내보내기 ============
function B2CExport() {
  const [selfFile, setSelfFile] = useState(null);
  const [coupangFile, setCoupangFile] = useState(null);
  const [smartFile, setSmartFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [outboundList, setOutboundList] = useState([]);

  // Shipping Files 관리
  const [sfFile, setSfFile] = useState(null);
  const [sfIssueType, setSfIssueType] = useState('B2C');
  const [sfSource, setSfSource] = useState('selfmall');
  const [sfGroups, setSfGroups] = useState([]);
  const [sfSelectedGroup, setSfSelectedGroup] = useState('');
  const [sfGroupIdInput, setSfGroupIdInput] = useState('');
  const [sfFileIdInput, setSfFileIdInput] = useState('');

  // B2C 출고 리스트 조회
  useEffect(() => {
    fetchB2COrders();
    fetchGroups();
  }, []);

  async function fetchB2COrders() {
    try {
      const response = await shippingService.getOrders({ issueType: 'B2C' });
      const orders = response.data || response || [];
      setOutboundList(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error('B2C 출고 리스트 조회 실패:', err);
      setOutboundList([]);
    }
  }

  async function fetchGroups() {
    try {
      const res = await shippingService.getGroups({ issueType: sfIssueType });
      const data = res?.data || res || [];
      setSfGroups(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('파일 그룹 목록 조회 실패:', e);
      setSfGroups([]);
    }
  }

  async function handleExport() {
    setBusy(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    if (selfFile) form.append('files', selfFile);
    if (coupangFile) form.append('files', coupangFile);
    if (smartFile) form.append('files', smartFile);

    // 선택적 — 마감 태그 고정
    form.append('cutoff_self', '[자사몰 15:00마감]');
    form.append('cutoff_coupang', '[쿠팡 16:00마감]');
    form.append('cutoff_smart', '[스마트스토어 17:00마감]');
    form.append('issueType', 'B2C');

    try {
      const response = await shippingService.uploadOrders(form);
      setResult(response);
      alert('주문이 업로드되었습니다!');
      
      // 출고 리스트 새로고침
      fetchB2COrders();
      
      // 파일 초기화
      setSelfFile(null);
      setCoupangFile(null);
      setSmartFile(null);
    } catch (e) {
      console.error('CJ 내보내기 오류:', e);
      setError(e.customMessage || e.message || '내보내기 실패');
    } finally {
      setBusy(false);
    }
  }

  // ====== Shipping Files API 연동 ======
  async function handleSfUpload() {
    if (!sfFile) {
      alert('업로드할 파일을 선택하세요.');
      return;
    }
    try {
      setBusy(true);
      const res = await shippingService.upload({ issueType: sfIssueType, source: sfSource, file: sfFile });
      const gid = res?.groupId || res?.data?.groupId;
      if (gid) {
        setSfSelectedGroup(String(gid));
        setSfGroupIdInput(String(gid));
      }
      alert('파일이 업로드되었습니다.');
      setSfFile(null);
      fetchGroups();
    } catch (e) {
      console.error('업로드 실패:', e);
      alert(e?.response?.data?.message || e?.message || '업로드 실패');
    } finally {
      setBusy(false);
    }
  }

  async function handleSfSave() {
    const gid = sfSelectedGroup || sfGroupIdInput;
    if (!gid) {
      alert('groupId를 선택하거나 입력하세요.');
      return;
    }
    try {
      await shippingService.save({ groupId: parseInt(gid) });
      alert('저장되었습니다.');
      fetchGroups();
    } catch (e) {
      console.error('저장 실패:', e);
      alert(e?.response?.data?.message || e?.message || '저장 실패');
    }
  }

  async function handleSfDownload(format = 'cj') {
    const gid = sfSelectedGroup || sfGroupIdInput;
    if (!gid) {
      alert('groupId를 선택하거나 입력하세요.');
      return;
    }
    try {
      const res = await shippingService.download({ groupId: parseInt(gid), format });
      downloadBlob(res.data, `shipping_${gid}_${format}.xlsx`);
    } catch (e) {
      console.error('다운로드 실패:', e);
      alert(e?.response?.data?.message || e?.message || '다운로드 실패');
    }
  }

  async function handleSfDeleteFile() {
    if (!sfFileIdInput) {
      alert('삭제할 파일 ID를 입력하세요.');
      return;
    }
    try {
      await shippingService.deleteFile(parseInt(sfFileIdInput));
      alert('파일이 삭제되었습니다.');
      fetchGroups();
    } catch (e) {
      console.error('파일 삭제 실패:', e);
      alert(e?.response?.data?.message || e?.message || '삭제 실패');
    }
  }

  // B2C 출고 리스트 엑셀 다운로드
  async function handleExportB2CList() {
    if (outboundList.length === 0) {
      alert('다운로드할 출고 내역이 없습니다.');
      return;
    }

    try {
      const orderIds = outboundList.map(order => order.id);
      const response = await shippingService.exportToCJLogistics(orderIds);
      downloadBlob(response.data, `B2C_출고리스트_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert('B2C 출고 리스트가 다운로드되었습니다.');
    } catch (err) {
      console.error('B2C 출고 리스트 다운로드 실패:', err);
      alert('출고 리스트 다운로드에 실패했습니다.');
    }
  }

  const hasAny = useMemo(
    () => Boolean(selfFile || coupangFile || smartFile),
    [selfFile, coupangFile, smartFile]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <Upload className="h-5 w-5 text-[#674529]" />
          <h3 className="text-lg font-semibold text-[#674529]">B2C 주문 엑셀 업로드</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FilePicker
            label="자사몰 (선택)"
            onPick={setSelfFile}
            file={selfFile}
            accept=".xlsx,.xls"
          />
          <FilePicker
            label="쿠팡 (선택)"
            onPick={setCoupangFile}
            file={coupangFile}
            accept=".xlsx,.xls"
          />
          <FilePicker
            label="스마트스토어 (선택)"
            onPick={setSmartFile}
            file={smartFile}
            accept=".xlsx,.xls"
          />
        </div>
        <p className="mt-3 text-sm text-gray-500">
          ※ 하루에도 특정 채널이 없을 수 있습니다. 업로드한 파일만 병합합니다.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            className={cls(
              'rounded-xl border px-4 py-2 font-medium transition-colors',
              hasAny
                ? 'border-[#724323] bg-[#724323] text-white hover:bg-[#5a3419]'
                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            )}
            disabled={!hasAny || busy}
            onClick={handleExport}
          >
            {busy ? '내보내는 중...' : 'CJ 업로드 파일 만들기'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-[#674529]" />
            <h4 className="font-semibold text-[#674529]">결과</h4>
          </div>

          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {result.summary?.orders_parsed !== undefined && (
              <li>읽은 원시 라인: {result.summary.orders_parsed}</li>
            )}
            {result.summary?.orders_aggregated !== undefined && (
              <li>주문(주문번호 기준): {result.summary.orders_aggregated}</li>
            )}
          </ul>

          <div className="flex gap-3">
            {result.downloadUrl && (
              <a
                className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                href={result.downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                CJ 엑셀 다운로드
              </a>
            )}
            {result.errorReportUrl && (
              <a
                className="rounded-lg bg-gray-700 px-3 py-2 text-white hover:bg-gray-800"
                href={result.errorReportUrl}
                target="_blank"
                rel="noreferrer"
              >
                오류 리포트
              </a>
            )}
            {!result.downloadUrl && result.ok && (
              <span className="rounded-lg bg-emerald-100 px-3 py-2 text-emerald-700">
                엑셀 다운로드 완료
              </span>
            )}
            {!result.ok && result.message && (
              <span className="rounded-lg bg-red-100 px-3 py-2 text-red-700">
                {result.message}
              </span>
            )}
          </div>

          <div className="mt-2 border-t pt-2">
            <a
              className="text-[#724323] hover:underline"
              href="/receiving?tab=nav2"
              rel="noreferrer"
            >
              출고 관리 페이지로 이동
            </a>
          </div>
        </div>
      )}

      {/* B2C 출고 리스트 */}
      {outboundList.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-[#674529]" />
              <h4 className="font-semibold text-[#674529]">B2C 출고 리스트</h4>
              <span className="text-sm text-gray-500">({outboundList.length}건)</span>
            </div>
            <button
              onClick={handleExportB2CList}
              className="flex items-center space-x-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>엑셀 다운로드</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">주문번호</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">받는분</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">연락처</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">주소</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">품목</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">수량</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">플랫폼</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">송장번호</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {outboundList.map((order, index) => (
                  <tr key={order.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{order.orderNumber || order.id || '-'}</td>
                    <td className="px-4 py-3">{order.receiverName || '-'}</td>
                    <td className="px-4 py-3">{order.receiverPhone || '-'}</td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {order.address || '-'}
                    </td>
                    <td className="px-4 py-3">{order.itemName || '-'}</td>
                    <td className="px-4 py-3">{order.quantity || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        {order.platform || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.trackingNumber || '-'}</td>
                    <td className="px-4 py-3">
                      {order.status === 'completed' ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>완료</span>
                        </span>
                      ) : (
                        <span className="text-gray-600">대기</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ 파일 선택 컴포넌트 ============
function FilePicker({ label, file, onPick, accept }) {
  const inputRef = useRef(null);
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 hover:bg-gray-100"
        >
          파일 선택
        </button>
        <div className="max-w-[240px] truncate text-sm text-gray-700">
          {file ? file.name : '선택된 파일 없음'}
        </div>
        {file && (
          <button
            type="button"
            className="rounded-md bg-gray-100 px-2 py-1 text-gray-600 hover:bg-gray-200"
            onClick={() => onPick(null)}
          >
            제거
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
          onPick(f);
          if (inputRef.current) inputRef.current.value = ''; // 동일 파일 재선택 허용
        }}
      />
    </div>
  );
}

// ============ B2B: 직접 입력 ============
function B2BForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      customerName: '',
      receiverPhone: '',
      address1: '',
      items: [{ itemName: '', quantity: 1 }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const [busy, setBusy] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [b2bOrders, setB2bOrders] = useState([]);

  // B2B 출고 리스트 조회
  useEffect(() => {
    fetchB2BOrders();
  }, []);

  async function fetchB2BOrders() {
    try {
      const response = await shippingService.getOrders({ issueType: 'B2B' });
      const orders = response.data || response || [];
      setB2bOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error('B2B 출고 리스트 조회 실패:', err);
      setB2bOrders([]);
    }
  }

  // B2B 출고 리스트 엑셀 다운로드
  async function handleExportB2BList() {
    if (b2bOrders.length === 0) {
      alert('다운로드할 출고 내역이 없습니다.');
      return;
    }

    try {
      const orderIds = b2bOrders.map(order => order.id);
      const response = await shippingService.exportToCJLogistics(orderIds);
      downloadBlob(response.data, `B2B_출고리스트_${new Date().toISOString().split('T')[0]}.xlsx`);
      alert('B2B 출고 리스트가 다운로드되었습니다.');
    } catch (err) {
      console.error('B2B 출고 리스트 다운로드 실패:', err);
      alert('출고 리스트 다운로드에 실패했습니다.');
    }
  }

  async function onSubmit(values) {
    setBusy(true);
    setServerMsg(null);

    // 유효성 검사
    if (!values.customerName || !values.receiverPhone) {
      setServerMsg('거래처명과 연락처는 필수입니다.');
      setBusy(false);
      return;
    }

    if (!values.address1) {
      setServerMsg('주소는 필수입니다.');
      setBusy(false);
      return;
    }

    if (values.items.length === 0) {
      setServerMsg('품목을 1개 이상 추가하세요.');
      setBusy(false);
      return;
    }

    for (const item of values.items) {
      if (!item.itemName || item.quantity < 1) {
        setServerMsg('모든 품목의 이름과 수량을 확인하세요.');
        setBusy(false);
        return;
      }
    }

    try {
      const form = new FormData();
      form.append('batchName', values.customerName);
      form.append('issueType', 'B2B');
      
      // 임시 데이터 파일 생성 (실제로는 백엔드에서 처리)
      const orderData = {
        customerName: values.customerName,
        receiverPhone: values.receiverPhone,
        address1: values.address1,
        items: values.items,
      };
      
      const blob = new Blob([JSON.stringify(orderData)], { type: 'application/json' });
      form.append('files', blob, 'order.json');
      
      await shippingService.uploadOrders(form);

      setServerMsg('저장 완료. 출고 리스트에 추가되었습니다.');
      alert('B2B 출고 주문이 등록되었습니다.');
      reset();

      // 출고 리스트 새로고침
      fetchB2BOrders();
    } catch (e) {
      console.error('B2B 주문 저장 오류:', e);
      setServerMsg(e.customMessage || e.message || '저장 실패');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* 기본 정보 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#674529]">B2B 주문 입력</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField 
            control={control} 
            name="customerName" 
            label="거래처명" 
            placeholder="예) ABC유통" 
            error={errors.customerName}
            required
          />
          <TextField 
            control={control} 
            name="receiverPhone" 
            label="연락처" 
            placeholder="010-1234-5678" 
            error={errors.receiverPhone}
            required
          />
          <TextField 
            control={control} 
            name="address1" 
            label="주소" 
            placeholder="도로명 주소" 
            error={errors.address1}
            required
          />
        </div>
      </div>

      {/* 품목 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold text-[#674529]">품목</h4>
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 hover:bg-gray-100"
            onClick={() => append({ itemName: '', quantity: 1 })}
          >
            <Plus className="h-4 w-4 inline-block mr-1" /> 행 추가
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-3">품목명</th>
                <th className="w-32 py-2 pr-3">수량</th>
                <th className="w-20 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b last:border-0">
                  <td className="py-2 pr-3">
                    <Controller
                      control={control}
                      name={`items.${index}.itemName`}
                      render={({ field }) => (
                        <input 
                          {...field} 
                          className="w-full rounded-lg border px-3 py-2" 
                          placeholder="예) 비건펫피자" 
                        />
                      )}
                    />
                    {errors.items?.[index]?.itemName && (
                      <div className="mt-1 text-xs text-red-600">
                        {errors.items[index].itemName.message}
                      </div>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <Controller
                      control={control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min={1}
                          step={1}
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      )}
                    />
                    {errors.items?.[index]?.quantity && (
                      <div className="mt-1 text-xs text-red-600">
                        {errors.items[index].quantity.message}
                      </div>
                    )}
                  </td>
                  <td className="py-2">
                    <button 
                      type="button" 
                      onClick={() => remove(index)} 
                      className="rounded bg-gray-100 px-2 py-1 hover:bg-gray-200"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 inline-block" /> 삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex items-center justify-end gap-3">
        <button 
          type="submit" 
          className={cls(
            'rounded-xl px-4 py-2 font-medium text-white transition-colors',
            busy
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-[#724323] hover:bg-[#5a3419]'
          )}
          disabled={busy}
        >
          {busy ? '저장 중...' : '저장'}
        </button>
        {serverMsg && (
          <span
            className={cls(
              'text-sm',
              serverMsg.includes('완료') ? 'text-green-600' : 'text-red-600'
            )}
          >
            {serverMsg}
          </span>
        )}
      </div>

      {/* B2B 출고 리스트 */}
      {b2bOrders.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-[#674529]" />
              <h4 className="font-semibold text-[#674529]">B2B 출고 리스트</h4>
              <span className="text-sm text-gray-500">({b2bOrders.length}건)</span>
            </div>
            <button
              onClick={handleExportB2BList}
              className="flex items-center space-x-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>엑셀 다운로드</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">거래처</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">연락처</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">주소</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">품목</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">수량</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">등록일</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {b2bOrders.map((order, index) => (
                  <tr key={order.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{order.customerName || order.batchName || '-'}</td>
                    <td className="px-4 py-3">{order.receiverPhone || '-'}</td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {order.address1 || order.address || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {order.items?.length > 0 ? (
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              {item.itemName} (x{item.quantity})
                            </div>
                          ))}
                        </div>
                      ) : (
                        order.itemName || '-'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || order.quantity || 0}
                    </td>
                    <td className="px-4 py-3">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {order.status === 'completed' ? (
                        <span className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>완료</span>
                        </span>
                      ) : (
                        <span className="text-gray-600">대기</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </form>
  );
}

// ============ 텍스트 필드 컴포넌트 ============
function TextField({ control, name, label, placeholder, error, required }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <input 
            {...field} 
            className="mt-1 w-full rounded-lg border px-3 py-2" 
            placeholder={placeholder} 
          />
        )}
      />
      {error && (
        <div className="mt-1 text-xs text-red-600">{error.message}</div>
      )}
    </div>
  );
}

// ============ 재고 입고 관리 ============
function InventoryReceiving() {
  const [items, setItems] = useState([]);
  const [itemList, setItemList] = useState([]); // 품목 목록
  const [factoryList, setFactoryList] = useState([]); // 공장 목록
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    factoryId: '',
    quantity: '',
    unit: 'kg',
    lotNumber: '',
    wholesalePrice: '',
    note: '',
  });
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (message, type = 'info', title = '알림') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  useEffect(() => {
    fetchReceivingList();
    fetchItemList();
    fetchFactoryList();
  }, []);

  async function fetchItemList() {
    try {
      const response = await itemService.getAll({ page: 1, limit: 1000 });
      const data = response.data?.rows || response.data || [];
      setItemList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
      setItemList([]);
    }
  }

  async function fetchFactoryList() {
    try {
      const response = await factoryService.getAll({ page: 1, limit: 100 });
      const data = response.data?.rows || response.data || [];
      setFactoryList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
      setFactoryList([]);
    }
  }

  async function fetchReceivingList() {
    setLoading(true);
    try {
      const response = await transactionService.getAll({ type: 'RECEIVE', page: 1, limit: 50 });
      const data = response.data?.rows || response.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('입고 내역 조회 실패:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReceive(e) {
    e.preventDefault();
    
    if (!formData.itemId || !formData.factoryId || !formData.quantity) {
      showAlert('필수 항목을 모두 입력해주세요.', 'error', '입력 오류');
      return;
    }

    try {
      const receivingData = {
        itemId: parseInt(formData.itemId),
        factoryId: parseInt(formData.factoryId),
        storageConditionId: 1,
        lotNumber: formData.lotNumber || `LOT${Date.now()}`,
        wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        receivedAt: new Date().toISOString(),
        firstReceivedAt: new Date().toISOString(),
        note: formData.note || '정상 입고',
      };

      await transactionService.createReceive(receivingData);
      showAlert('입고가 완료되었습니다.', 'success', '입고 완료');
      
      // 폼 초기화
      setFormData({
        itemId: '',
        factoryId: '',
        quantity: '',
        unit: 'kg',
        lotNumber: '',
        wholesalePrice: '',
        note: '',
      });
      
      // 목록 새로고침
      fetchReceivingList();
    } catch (error) {
      console.error('입고 처리 실패:', error);
      showAlert('입고 처리 중 오류가 발생했습니다.', 'error', '입고 실패');
    }
  }

  return (
    <div className="space-y-6">
      {/* 입고 등록 폼 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <PackageCheck className="h-5 w-5 text-[#674529]" />
          <h3 className="text-lg font-semibold text-[#674529]">재고 입고 등록</h3>
        </div>
        
        <form onSubmit={handleReceive} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                품목 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">품목을 선택하세요</option>
                {itemList.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.code || item.id}] {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                공장 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.factoryId}
                onChange={(e) => setFormData({ ...formData, factoryId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">공장을 선택하세요</option>
                {factoryList.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="수량 입력"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                단위
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="개">개</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LOT 번호
              </label>
              <input
                type="text"
                value={formData.lotNumber}
                onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="자동 생성"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                도매가
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="도매가 입력"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비고
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="비고 입력"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-[#724323] px-6 py-2 font-medium text-white hover:bg-[#5a3419]"
            >
              입고 등록
            </button>
          </div>
        </form>
      </div>

      {/* 입고 내역 목록 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-[#674529]" />
            <h4 className="font-semibold text-[#674529]">입고 내역</h4>
            <span className="text-sm text-gray-500">({items.length}건)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">입고 내역이 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">품목 ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">공장 ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">수량</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">LOT</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">입고일</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">{item.itemId || item.item_id}</td>
                    <td className="px-4 py-3">{item.factoryId || item.factory_id}</td>
                    <td className="px-4 py-3">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3">{item.lotNumber || item.lot_number}</td>
                    <td className="px-4 py-3">
                      {item.receivedAt || item.received_at
                        ? new Date(item.receivedAt || item.received_at).toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3">{item.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}

// ============ 재고 출고 관리 ============
function InventoryIssuing() {
  const [items, setItems] = useState([]);
  const [itemList, setItemList] = useState([]); // 품목 목록
  const [factoryList, setFactoryList] = useState([]); // 공장 목록
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    factoryId: '',
    quantity: '',
    unit: 'kg',
    issueType: 'SHIPPING',
    note: '',
  });
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (message, type = 'info', title = '알림') => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, title: '', message: '', type: 'info' });
  };

  useEffect(() => {
    fetchIssuingList();
    fetchItemList();
    fetchFactoryList();
  }, []);

  async function fetchItemList() {
    try {
      const response = await itemService.getAll({ page: 1, limit: 1000 });
      const data = response.data?.rows || response.data || [];
      setItemList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('품목 목록 조회 실패:', error);
      setItemList([]);
    }
  }

  async function fetchFactoryList() {
    try {
      const response = await factoryService.getAll({ page: 1, limit: 100 });
      const data = response.data?.rows || response.data || [];
      setFactoryList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('공장 목록 조회 실패:', error);
      setFactoryList([]);
    }
  }

  async function fetchIssuingList() {
    setLoading(true);
    try {
      const response = await transactionService.getAll({ type: 'ISSUE', page: 1, limit: 50 });
      const data = response.data?.rows || response.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('출고 내역 조회 실패:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleIssue(e) {
    e.preventDefault();
    
    if (!formData.itemId || !formData.factoryId || !formData.quantity) {
      showAlert('필수 항목을 모두 입력해주세요.', 'error', '입력 오류');
      return;
    }

    try {
      const issuingData = {
        itemId: parseInt(formData.itemId),
        factoryId: parseInt(formData.factoryId),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        issueType: formData.issueType,
        note: formData.note || '정상 출고',
      };

      await transactionService.createIssue(issuingData);
      showAlert('출고가 완료되었습니다.', 'success', '출고 완료');
      
      // 폼 초기화
      setFormData({
        itemId: '',
        factoryId: '',
        quantity: '',
        unit: 'kg',
        issueType: 'SHIPPING',
        note: '',
      });
      
      // 목록 새로고침
      fetchIssuingList();
    } catch (error) {
      console.error('출고 처리 실패:', error);
      showAlert('출고 처리 중 오류가 발생했습니다.', 'error', '출고 실패');
    }
  }

  return (
    <div className="space-y-6">
      {/* 출고 등록 폼 */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center space-x-2">
          <TruckIcon className="h-5 w-5 text-[#674529]" />
          <h3 className="text-lg font-semibold text-[#674529]">재고 출고 등록</h3>
        </div>
        
        <form onSubmit={handleIssue} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                품목 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.itemId}
                onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">품목을 선택하세요</option>
                {itemList.map((item) => (
                  <option key={item.id} value={item.id}>
                    [{item.code || item.id}] {item.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                공장 선택 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.factoryId}
                onChange={(e) => setFormData({ ...formData, factoryId: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                required
              >
                <option value="">공장을 선택하세요</option>
                {factoryList.map((factory) => (
                  <option key={factory.id} value={factory.id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                수량 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="수량 입력"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                단위
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="개">개</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                출고 유형
              </label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="SHIPPING">배송</option>
                <option value="PRODUCTION">생산</option>
                <option value="RETURN">반품</option>
                <option value="DISPOSAL">폐기</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비고
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="비고 입력"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-[#724323] px-6 py-2 font-medium text-white hover:bg-[#5a3419]"
            >
              출고 등록
            </button>
          </div>
        </form>
      </div>

      {/* 출고 내역 목록 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-[#674529]" />
            <h4 className="font-semibold text-[#674529]">출고 내역</h4>
            <span className="text-sm text-gray-500">({items.length}건)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">로딩 중...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">출고 내역이 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">품목 ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">공장 ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">수량</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">출고 유형</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">출고일</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">{item.itemId || item.item_id}</td>
                    <td className="px-4 py-3">{item.factoryId || item.factory_id}</td>
                    <td className="px-4 py-3">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cls(
                        'rounded px-2 py-1 text-xs',
                        item.issueType === 'SHIPPING' || item.issue_type === 'SHIPPING'
                          ? 'bg-blue-100 text-blue-700'
                          : item.issueType === 'PRODUCTION' || item.issue_type === 'PRODUCTION'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      )}>
                        {item.issueType || item.issue_type || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.issuedAt || item.issued_at
                        ? new Date(item.issuedAt || item.issued_at).toLocaleString()
                        : '-'}
                    </td>
                    <td className="px-4 py-3">{item.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}

// ============ 메인 페이지 ============
export default function ShippingManagementPage({ subPage }) {
  const [tab, setTab] = useState(subPage === 'nav1' ? 'B2B' : subPage === 'nav2' ? 'B2C' : subPage === 'nav3' ? 'RECEIVING' : 'ISSUING');

  useEffect(() => {
    if (subPage === 'nav1') setTab('B2B');
    else if (subPage === 'nav2') setTab('B2C');
    else if (subPage === 'nav3') setTab('RECEIVING');
    else if (subPage === 'nav4') setTab('ISSUING');
  }, [subPage]);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#674529]">배송/입출고 관리</h1>
        <div className="mt-1 text-sm text-gray-500">
          현재 페이지: {
            tab === 'B2B' ? 'B2B 출고' : 
            tab === 'B2C' ? 'B2C 출고' : 
            tab === 'RECEIVING' ? '재고 입고' : 
            '재고 출고'
          }
        </div>
      </header>

      {/* 탭 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          className={cls(
            'rounded-xl border px-4 py-2 font-medium transition-colors',
            tab === 'B2B'
              ? 'border-[#724323] bg-[#724323] text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
          onClick={() => setTab('B2B')}
        >
          B2B 출고
        </button>
        <button
          className={cls(
            'rounded-xl border px-4 py-2 font-medium transition-colors',
            tab === 'B2C'
              ? 'border-[#724323] bg-[#724323] text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
          onClick={() => setTab('B2C')}
        >
          B2C 출고
        </button>
        <button
          className={cls(
            'rounded-xl border px-4 py-2 font-medium transition-colors',
            tab === 'RECEIVING'
              ? 'border-[#724323] bg-[#724323] text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
          onClick={() => setTab('RECEIVING')}
        >
          재고 입고
        </button>
        <button
          className={cls(
            'rounded-xl border px-4 py-2 font-medium transition-colors',
            tab === 'ISSUING'
              ? 'border-[#724323] bg-[#724323] text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          )}
          onClick={() => setTab('ISSUING')}
        >
          재고 출고
        </button>
      </div>

      {tab === 'B2B' && <B2BForm />}
      {tab === 'B2C' && <B2CExport />}
      {tab === 'RECEIVING' && <InventoryReceiving />}
      {tab === 'ISSUING' && <InventoryIssuing />}
    </div>
  );
}
