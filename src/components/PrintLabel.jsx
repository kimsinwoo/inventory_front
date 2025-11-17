// import React, { useEffect, useMemo, useState } from 'react';
// import { X, Printer, Package, Barcode } from 'lucide-react';
// import { labelAPI } from '../api';

// const SIZES = [
//   { value: 'large', label: 'Large (100mm)' },
//   { value: 'medium', label: 'Medium (80mm)' },
//   { value: 'small', label: 'Small (40mm)' },
//   { value: 'verysmall', label: 'VerySmall (26mm)' },
// ];

// // 🔥 이 파일이 실제로 로드되는지 확인용
// console.log('🔥 PrintLabel 컴포넌트 파일 로드됨');

// // rawPdf → base64 문자열로 변환 (배열/CSV 문자열/이미 base64 모두 지원)
// function normalizePdfBase64(rawPdf) {
//   console.log('📦 [normalizePdfBase64] 입력 타입:', typeof rawPdf);

//   if (rawPdf == null) {
//     throw new Error('pdfBase64 데이터가 비어 있습니다.');
//   }

//   const toBase64FromByteArray = (bytes) => {
//     const uint8 = new Uint8Array(bytes);
//     let binary = '';
//     for (let i = 0; i < uint8.length; i += 1) {
//       binary += String.fromCharCode(uint8[i]);
//     }
//     return window.btoa(binary);
//   };

//   if (Array.isArray(rawPdf)) {
//     console.log('📦 [normalizePdfBase64] 숫자 배열로 인식');
//     const bytes = rawPdf.map((n) => Number(n));
//     return toBase64FromByteArray(bytes);
//   }

//   if (typeof rawPdf === 'string') {
//     const trimmed = rawPdf.trim();
//     const looksLikeCsvNumbers = /^[0-9]+(,[0-9]+)*$/.test(trimmed);

//     if (looksLikeCsvNumbers) {
//       console.log('📦 [normalizePdfBase64] "37,80,68,..." 형태 CSV 숫자 문자열로 인식');
//       const parts = trimmed.split(',');
//       const bytes = parts.map((n) => Number(n));
//       return toBase64FromByteArray(bytes);
//     }

//     console.log('📦 [normalizePdfBase64] 이미 base64 문자열이라고 가정');
//     return trimmed;
//   }

//   throw new Error('지원하지 않는 pdfBase64 포맷입니다.');
// }

// // 1) 4000 백엔드에서 pdfBase64 받아오기
// async function fetchLabelPdfBase64({ templateId, labelType, printCount }) {
//   console.log('▶ [PrintLabel] /label/pdf 요청 payload:', {
//     templateId,
//     labelType,
//     printCount,
//   });

//   const pdfResponse = await labelAPI.printSavedLabelPdf({
//     templateId,
//     labelType,    // large / medium / small / verysmall
//     printCount,
//   });

//   console.log('✅ [PrintLabel] /label/pdf 응답:', pdfResponse);

//   const pdfResponseData = pdfResponse?.data;

//   // 백엔드 응답 구조 여러 경우 지원
//   const rawPdf =
//     pdfResponseData?.data?.pdfBase64 ??
//     pdfResponseData?.pdfBase64 ??
//     pdfResponseData?.pdf ??
//     null;

//   console.log(
//     '📦 [PrintLabel] rawPdf 타입:',
//     typeof rawPdf,
//     '값 일부:',
//     rawPdf ? String(rawPdf).slice(0, 80) : null,
//   );

//   const pdfBase64 = normalizePdfBase64(rawPdf);

//   console.log('✅ [PrintLabel] 최종 pdfBase64 길이:', pdfBase64.length);

//   return pdfBase64;
// }

// // 2) 4310 프린터 에이전트로 전송
// async function sendToLocalPrinter({ pdfBase64, printerName, printCount }) {
//   const payload = {
//     pdfBase64,
//     printerName,
//     printCount,
//   };

//   console.log('▶ [PrintLabel] /print payload:', {
//     ...payload,
//     pdfBase64: `${pdfBase64.slice(0, 30)}...`,
//   });

//   const printResponse = await labelAPI.printLabel(payload);
//   console.log('✅ [PrintLabel] /print 응답:', printResponse);

//   const printData = printResponse?.data;
//   const ok = typeof printData?.ok === 'boolean' ? printData.ok : true;
//   const message =
//     typeof printData?.message === 'string' && printData.message.length > 0
//       ? printData.message
//       : `${printCount}개 인쇄 요청이 완료되었습니다.`;

//   if (!ok) {
//     throw new Error(message);
//   }

//   return message;
// }

// const PrintLabel = ({ isOpen, onClose, onPrinted }) => {
//   console.log('🎯 PrintLabel 렌더링, isOpen =', isOpen);

//   const [templates, setTemplates] = useState([]);
//   const [loadingTemplates, setLoadingTemplates] = useState(false);
//   const [selectedTemplateId, setSelectedTemplateId] = useState('');

//   const [printers, setPrinters] = useState([]);
//   const [isLoadingPrinters, setIsLoadingPrinters] = useState(false);
//   const [selectedPrinter, setSelectedPrinter] = useState('');

//   const [size, setSize] = useState('large');
//   const [printCount, setPrintCount] = useState(1);
//   const [isPrinting, setIsPrinting] = useState(false);

//   // 프린터 목록 로드 (모달 열릴 때)
//   useEffect(() => {
//     if (!isOpen) return;

//     const fetchPrinters = async () => {
//       try {
//         setIsLoadingPrinters(true);
//         console.log('▶ [PrintLabel] 프린터 목록 요청');
//         const response = await labelAPI.getPrinters();
//         console.log('✅ [PrintLabel] 프린터 목록 응답:', response);

//         const list = Array.isArray(response.data)
//           ? response.data
//           : response.data?.data ?? response.data?.printers ?? [];

//         setPrinters(list);

//         if (list.length > 0) {
//           const firstItem = list[0];
//           const first =
//             typeof firstItem === 'string'
//               ? firstItem
//               : firstItem?.name ?? firstItem?.id ?? '';
//           setSelectedPrinter(first);
//           console.log('✅ [PrintLabel] 선택된 기본 프린터:', first);
//         }
//       } catch (err) {
//         console.error('프린터 목록 가져오기 실패:', err);
//       } finally {
//         setIsLoadingPrinters(false);
//       }
//     };

//     fetchPrinters();
//   }, [isOpen]);

//   // 템플릿 목록 로드 (모달 열릴 때) - /label/templates
//   useEffect(() => {
//     if (!isOpen) return;

//     const fetchTemplates = async () => {
//       try {
//         setLoadingTemplates(true);
//         console.log('▶ [PrintLabel] 템플릿 목록 요청');
//         const response = await labelAPI.getTemplates({ page: 1, limit: 200 });
//         console.log('✅ [PrintLabel] 템플릿 목록 응답:', response);

//         const resData = response.data;
//         const rows = Array.isArray(resData)
//           ? resData
//           : Array.isArray(resData?.data)
//           ? resData.data
//           : Array.isArray(resData?.templates)
//           ? resData.templates
//           : [];

//         setTemplates(rows);

//         if (rows.length > 0) {
//           const firstId =
//             rows[0]?.id ??
//             rows[0]?.templateId ??
//             rows[0]?.labelId ??
//             '';
//           setSelectedTemplateId(firstId);
//           console.log('✅ [PrintLabel] 기본 선택 템플릿 ID:', firstId);
//         }
//       } catch (err) {
//         console.error('템플릿 목록 가져오기 실패:', err);
//         setTemplates([]);
//       } finally {
//         setLoadingTemplates(false);
//       }
//     };

//     fetchTemplates();
//   }, [isOpen]);

//   const selectedTemplate = useMemo(
//     () =>
//       templates.find(
//         (t) =>
//           (t.id ?? t.templateId ?? t.labelId) === selectedTemplateId,
//       ),
//     [templates, selectedTemplateId],
//   );

//   const handlePrint = async () => {
//     if (!selectedTemplateId) {
//       alert('라벨 템플릿을 선택해주세요.');
//       return;
//     }
//     if (!selectedPrinter) {
//       alert('프린터를 선택해주세요.');
//       return;
//     }
//     if (!printCount || printCount < 1) {
//       alert('인쇄 개수는 1개 이상이어야 합니다.');
//       return;
//     }

//     try {
//       setIsPrinting(true);

//       // 1) 백엔드에서 PDF Base64 생성
//       const pdfBase64 = await fetchLabelPdfBase64({
//         templateId: selectedTemplateId,
//         labelType: size,
//         printCount,
//       });

//       console.log(pdfBase64)

//       // 2) 로컬 프린터 에이전트로 전송
//       // const message = await sendToLocalPrinter({
//       //   pdfBase64,
//       //   printerName: selectedPrinter,
//       //   printCount,
//       // });

//       alert(message);

//       if (onPrinted) {
//         onPrinted({
//           templateId: selectedTemplateId,
//           printerName: selectedPrinter,
//           printCount,
//           size,
//         });
//       }
//       if (onClose) {
//         onClose();
//       }
//     } catch (err) {
//       console.error('❌ [PrintLabel] 라벨 인쇄 실패:', err);

//       const errorMessage =
//         typeof err?.response?.data?.message === 'string'
//           ? err.response.data.message
//           : typeof err?.message === 'string'
//           ? err.message
//           : '알 수 없는 오류';

//       alert(`인쇄 실패: ${errorMessage}`);
//     } finally {
//       setIsPrinting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//       <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
//         {/* 헤더 */}
//         <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center space-x-2">
//             <Package className="h-5 w-5 text-[#674529]" />
//             <h2 className="text-lg font-semibold text-[#674529]">
//               라벨 프린트
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* 본문 */}
//         <div className="px-6 py-5">
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             {/* 좌측: 선택 영역 */}
//             <div className="space-y-4">
//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   저장된 라벨 템플릿 선택
//                 </label>
//                 <select
//                   value={selectedTemplateId}
//                   onChange={(e) => setSelectedTemplateId(e.target.value)}
//                   disabled={loadingTemplates || templates.length === 0}
//                   className="w-full rounded-xl border border-gray-300 px-4 py-2.5 transition-colors focus:border-[#674529] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {loadingTemplates ? (
//                     <option>라벨 템플릿 로딩 중...</option>
//                   ) : templates.length === 0 ? (
//                     <option>저장된 템플릿이 없습니다</option>
//                   ) : (
//                     templates.map((t, idx) => {
//                       const id =
//                         t.id ??
//                         t.templateId ??
//                         t.labelId ??
//                         `idx-${idx}`;
//                       const name =
//                         t.item_name ??
//                         t.itemName ??
//                         t.productName ??
//                         '라벨 템플릿';
//                       return (
//                         <option key={id} value={id}>
//                           {`${name} (#${id})`}
//                         </option>
//                       );
//                     })
//                   )}
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     라벨 크기
//                   </label>
//                   <select
//                     value={size}
//                     onChange={(e) => setSize(e.target.value)}
//                     className="w-full rounded-xl border border-gray-300 px-4 py-2.5 transition-colors focus:border-[#674529] focus:outline-none"
//                   >
//                     {SIZES.map((s) => (
//                       <option key={s.value} value={s.value}>
//                         {s.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="mb-2 block text-sm font-semibold text-gray-700">
//                     인쇄 개수
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     value={printCount}
//                     onChange={(e) => {
//                       const next = Number.parseInt(e.target.value, 10);
//                       setPrintCount(Number.isNaN(next) ? 1 : next);
//                     }}
//                     className="w-full rounded-xl border border-gray-300 px-4 py-2.5 transition-colors focus:border-[#674529] focus:outline-none"
//                     placeholder="인쇄할 개수"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="mb-2 block text-sm font-semibold text-gray-700">
//                   프린터 선택
//                 </label>
//                 <select
//                   value={selectedPrinter}
//                   onChange={(e) => setSelectedPrinter(e.target.value)}
//                   disabled={isLoadingPrinters || printers.length === 0}
//                   className="w-full rounded-xl border border-gray-300 px-4 py-2.5 transition-colors focus:border-[#674529] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {isLoadingPrinters ? (
//                     <option>프린터 목록 로딩 중...</option>
//                   ) : printers.length === 0 ? (
//                     <option>사용 가능한 프린터가 없습니다</option>
//                   ) : (
//                     printers.map((p, idx) => {
//                       const name =
//                         typeof p === 'string'
//                           ? p
//                           : p.name ?? p.id ?? `프린터 ${idx + 1}`;
//                       const suffix =
//                         typeof p === 'object' && p.driver
//                           ? ` (${p.driver})`
//                           : '';
//                       return (
//                         <option key={idx} value={name}>
//                           {name}
//                           {suffix}
//                         </option>
//                       );
//                     })
//                   )}
//                 </select>
//               </div>
//             </div>

//             {/* 우측: 미리보기 정보 */}
//             <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
//               <div className="space-y-2 text-sm text-gray-700">
//                 <div className="font-semibold text-[#674529]">
//                   선택 정보
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Barcode className="h-4 w-4 text-gray-500" />
//                   <span>템플릿 ID: {selectedTemplateId || '-'}</span>
//                 </div>
//                 <div>
//                   라벨 크기:{' '}
//                   {SIZES.find((s) => s.value === size)?.label}
//                 </div>
//                 <div>인쇄 개수: {printCount}</div>
//                 <div>프린터: {selectedPrinter || '-'}</div>
//                 <hr className="my-3" />
//                 <div className="text-xs text-gray-500">
//                   * 저장된 라벨 템플릿 정보 기준으로 서버에서 PDF를 생성한 후
//                   로컬 프린터 에이전트로 전송합니다.
//                 </div>
//                 {selectedTemplate && (
//                   <div className="mt-2 space-y-1 text-xs text-gray-600">
//                     <div>
//                       품목명:{' '}
//                       {selectedTemplate.item_name ??
//                         selectedTemplate.itemName ??
//                         selectedTemplate.productName ??
//                         '-'}
//                     </div>
//                     <div>
//                       보관조건:{' '}
//                       {selectedTemplate.storage_condition ??
//                         selectedTemplate.storageCondition ??
//                         '-'}
//                     </div>
//                     <div>
//                       등록번호:{' '}
//                       {selectedTemplate.registration_number ??
//                         selectedTemplate.registrationNumber ??
//                         '-'}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* 푸터 */}
//         <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
//           <button
//             onClick={onClose}
//             className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
//           >
//             취소
//           </button>
//           <button
//             onClick={handlePrint}
//             disabled={isPrinting || !selectedTemplateId || !selectedPrinter}
//             className="inline-flex items-center rounded-xl bg-[#674529] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#5a3d22] disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <Printer className="mr-2 h-4 w-4" />
//             {isPrinting ? '인쇄 중...' : '프린트하기'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PrintLabel;
