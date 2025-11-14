import { useState, useEffect } from 'react';
import { FileText, Download, Filter, ChevronDown } from 'lucide-react';
import { approvalAPI } from '../../api';

const DocumentList = () => {
  const [filters, setFilters] = useState({
    type: '전체',
    status: '전체',
    searchTerm: '',
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        // approvalAPI에 getDocuments 메서드가 없으므로, inbox를 사용하거나 새로 추가 필요
        // 일단 inbox 사용
        const response = await approvalAPI.getInbox();
        const data = response.data?.data || response.data || [];
        const docsList = Array.isArray(data) ? data : [];
        
        // API 데이터를 컴포넌트 형식에 맞게 변환
        const formattedDocs = docsList.map((doc) => {
          const statusMap = {
            'PENDING': '결재중',
            'APPROVED': '승인완료',
            'REJECTED': '반려',
          };
          
          return {
            id: doc.id,
            docNumber: doc.document_number || doc.documentNumber || `DOC-${doc.id}`,
            title: doc.title || doc.document_title || '문서 제목 없음',
            type: doc.type || doc.document_type || '기타',
            status: statusMap[doc.status] || doc.status || '결재중',
            statusColor: doc.status === 'APPROVED' ? 'bg-[#d4edda] text-[#28a745]' : 
                        doc.status === 'REJECTED' ? 'bg-[#f8d7da] text-[#dc3545]' : 
                        'bg-[#ffedd4] text-[#f65814]',
            author: doc.author?.name || doc.author_name || doc.created_by || '작성자 없음',
            createdDate: doc.created_at ? doc.created_at.split('T')[0] : '',
            approvalSteps: doc.approval_steps || doc.approvalSteps || [],
          };
        });
        
        setDocuments(formattedDocs);
      } catch (error) {
        console.error('문서 목록 로드 실패:', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleReset = () => {
    setFilters({
      type: '전체',
      status: '전체',
      searchTerm: '',
    });
  };


  const documentTypes = ['전체', '생산 원료 보고서', '불량 보고서', '안전점검표'];
  const documentStatuses = ['전체', '결재중', '반려', '승인완료'];

  // 필터링 로직
  const filteredDocuments = documents.filter((doc) => {

    // 상태 필터
    if (filters.status !== '전체' && doc.status !== filters.status) {
      return false;
    }

    // 검색어 필터 (문서번호, 제목, 작성자)
    if (filters.searchTerm.trim()) {
      const search = filters.searchTerm.toLowerCase().trim();
      const docNumber = doc.docNumber.toLowerCase();
      const title = doc.title.toLowerCase();
      const type = doc.type.toLowerCase();
      const author = doc.author.toLowerCase();
      const createdDate = doc.createdDate.toLowerCase();

      if (!docNumber.includes(search) && !title.includes(search) && !type.includes(search) && !author.includes(search) && !createdDate.includes(search)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className='space-y-6'>
      {/* 필터 및 검색 섹션 */}
      <div className='rounded-xl bg-white p-6 shadow-sm'>
        <div className='mb-4 flex items-center space-x-2'>
          <h3 className='text-base font-semibold text-[#674529]'>필터 및 검색</h3>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>

          {/* 결재 상태 */}
          <div>
            <label className='mb-2 block text-sm font-medium text-[#000]'>
              결재 상태
            </label>
            <div className='relative'>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className='w-full cursor-pointer appearance-none rounded-xl border-0 bg-[#f3f3f5] px-4 py-2.5 text-[#000] outline-none transition-all'
              >
                {documentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#674529]' />
            </div>
          </div>

          {/* 검색 */}
          <div>
            <label className='mb-2 block text-sm font-medium text-[#000]'>
              검색
            </label>
            <input
              type='text'
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder='문서번호, 제목, 유형, 작성자, 작성일'
              className='w-full rounded-xl border border-gray-300 px-4 py-2.5 placeholder-gray-400 outline-none'
            />
          </div>

          {/* 초기화 버튼 */}
          <div className='flex items-end'>
            <button
              onClick={handleReset}
              className='w-full rounded-xl border border-gray-300 bg-white px-6 py-2.5 font-medium text-[#000] transition-colors hover:bg-gray-50'
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      {/* 문서 목록 */}
      <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
        <div className='border-b border-gray-200 bg-[#FEF3E8] px-6 py-4'>
          <div className='flex items-center space-x-2'>
            <FileText className='h-5 w-5 text-[#674529]' />
            <h3 className='text-base font-semibold text-[#674529]'>
              전체 결재 문서 ({filteredDocuments.length}건
              {documents.length !== filteredDocuments.length && ` / ${documents.length}건`})
            </h3>
          </div>
          <p className='mt-1 text-sm text-gray-600'>
            시스템에 등록된 모든 결재 문서 목록입니다
          </p>
        </div>

        <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                문서번호
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                제목
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                유형
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                상태
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                작성자
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                작성일
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                진행단계
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                작업
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {loading ? (
              <tr>
                <td colSpan={8} className='px-4 py-8 text-center text-sm text-gray-500'>
                  불러오는 중...
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={8} className='px-4 py-8 text-center text-sm text-gray-500'>
                  문서가 없습니다.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className='transition-colors hover:bg-gray-50/50'
                >
                  <td className='px-4 py-4 text-sm font-medium text-gray-900'>
                    {doc.docNumber}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-900'>{doc.title}</td>
                  <td className='px-4 py-4 text-sm text-gray-700'>{doc.type}</td>
                  <td className='px-4 py-4'>
                    <span
                      className={`inline-flex rounded px-3 py-1 text-xs font-medium ${doc.statusColor}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-700'>
                    {doc.author}
                  </td>
                  <td className='px-4 py-4 text-sm text-gray-700'>
                    {doc.createdDate}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center space-x-2'>
                      {doc.approvalSteps && doc.approvalSteps.length > 0 ? (
                        doc.approvalSteps.map((stepData, index) => (
                          <div
                            key={index}
                            className='flex items-center'
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                                stepData.status === 'completed'
                                  ? 'bg-[#d4edda] text-[#28a745]'
                                  : stepData.status === 'pending'
                                    ? 'bg-[#ffedd4] text-[#f65814]'
                                    : stepData.status === 'rejected'
                                      ? 'bg-[#f8d7da] text-[#dc3545]'
                                      : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {stepData.step || index + 1}
                            </div>
                            {index < doc.approvalSteps.length - 1 && (
                              <div className='mx-1 text-gray-400'>→</div>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className='text-xs text-gray-400'>진행단계 없음</span>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    {doc.status === '승인완료' && (
                      <button className='text-gray-500 transition-colors hover:text-[#674529]'>
                        <Download className='h-5 w-5' />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default DocumentList;
