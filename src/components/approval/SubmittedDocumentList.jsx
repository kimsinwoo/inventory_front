import { useState, useEffect } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { approvalAPI } from '../../api';

const SubmittedDocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await approvalAPI.getInbox();
      const data = response.data?.data || response.data || [];
      const docsList = Array.isArray(data) ? data : [];
      
      // API 데이터를 컴포넌트 형식에 맞게 변환
      const formattedDocs = docsList.map((doc) => {
        const statusMap = {
          'PENDING': { text: '결재중', color: 'bg-[#ffedd4] text-[#f65814]' },
          'APPROVED': { text: '승인완료', color: 'bg-[#d4edda] text-[#28a745]' },
          'REJECTED': { text: '반려', color: 'bg-[#f8d7da] text-[#dc3545]' },
        };
        
        const statusInfo = statusMap[doc.status?.toUpperCase()] || { text: doc.status || '결재중', color: 'bg-[#ffedd4] text-[#f65814]' };
        
        // approvalSteps 변환
        const approvalSteps = doc.approval_steps || doc.approvalSteps || [];
        const formattedSteps = approvalSteps.map((step, index) => {
          let stepStatus = 'waiting';
          if (step.status === 'APPROVED' || step.status === 'approved' || step.approved) {
            stepStatus = 'completed';
          } else if (step.status === 'REJECTED' || step.status === 'rejected' || step.rejected) {
            stepStatus = 'rejected';
          } else if (step.status === 'PENDING' || step.status === 'pending' || step.pending) {
            stepStatus = 'pending';
          }
          return { step: index + 1, status: stepStatus };
        });
        
        return {
          id: doc.id,
          docNumber: doc.document_number || doc.documentNumber || `DOC-${doc.id}`,
          title: doc.title || doc.document_title || '문서 제목 없음',
          type: doc.type || doc.document_type || '기타',
          status: statusInfo.text,
          statusColor: statusInfo.color,
          createdDate: doc.created_at ? doc.created_at.split('T')[0] : doc.created_date || '',
          approvalSteps: formattedSteps.length > 0 ? formattedSteps : [
            { step: 1, status: doc.status === 'APPROVED' ? 'completed' : doc.status === 'REJECTED' ? 'rejected' : 'pending' },
          ],
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

  return (
    <div className='overflow-hidden rounded-xl bg-white shadow-sm'>
      <div className='border-b border-gray-200 bg-[#FEF3E8] px-6 py-4'>
        <div className='flex items-center space-x-2'>
          <FileText className='h-5 w-5 text-[#674529]' />
          <h3 className='text-base font-semibold text-[#674529]'>
            전체 결재 문서
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
                <td colSpan={7} className='px-4 py-8 text-center text-sm text-gray-500'>
                  불러오는 중...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} className='px-4 py-8 text-center text-sm text-gray-500'>
                  문서가 없습니다.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
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
                    {doc.createdDate}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center space-x-2'>
                      {doc.approvalSteps.map((stepData, index) => (
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
                            {stepData.step}
                          </div>
                          {index < doc.approvalSteps.length - 1 && (
                            <div className='mx-1 text-gray-400'>→</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center space-x-2'>
                      <button 
                        onClick={async () => {
                          try {
                            const response = await approvalAPI.getApproval(doc.id);
                            const detail = response.data?.data || response.data;
                            alert(`문서 상세 정보:\n제목: ${detail.title || 'N/A'}\n작성자: ${detail.author?.name || 'N/A'}\n상태: ${detail.status || 'N/A'}`);
                          } catch (error) {
                            console.error('문서 상세 조회 실패:', error);
                            alert('문서 상세 정보를 불러올 수 없습니다.');
                          }
                        }}
                        className='text-gray-500 transition-colors hover:text-[#674529]'
                      >
                        <Eye className='h-5 w-5' />
                      </button>
                      {doc.status === '승인완료' && (
                        <button className='text-gray-500 transition-colors hover:text-[#674529]'>
                          <Download className='h-5 w-5' />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubmittedDocumentList;