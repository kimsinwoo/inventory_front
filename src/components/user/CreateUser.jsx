import { useState } from 'react';
import { Users, UserPlus } from 'lucide-react';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    department: '',
    password: '',
    hire_date: '', // yyyy-mm-dd
    // accessLevel is not used for API but preserve if UI/UX want it
    accessLevel: '',
  });

  // 유효성 검사, 요청 상태 처리 등을 추가 가능
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // 필수 입력 체크 (username, password, full_name, phone_number, email, department, hire_date)
    if (
      !formData.username ||
      !formData.password ||
      !formData.full_name ||
      !formData.phone_number ||
      !formData.email ||
      !formData.department ||
      !formData.hire_date
    ) {
      setResultMsg('모든 필수항목을 입력해주세요.');
      return;
    }
    setLoading(true);
    setResultMsg('');
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email,
        hire_date: formData.hire_date,
        position: '4', // 임시 고정
        department: formData.department,
        role: '4', // 고정
      };

      // 환경 변수에서 API URL 가져오기 (기본값 없음 - .env 필수)
      const API_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL;
      const res = await fetch(`${API_URL}/auth/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        setResultMsg(errData.message ? `실패: ${errData.message}` : '사용자 생성 실패');
      } else {
        setResultMsg('사용자 생성 성공!');
        setFormData({
          username: '',
          email: '',
          full_name: '',
          phone_number: '',
          department: '',
          password: '',
          hire_date: '',
          accessLevel: '',
        });
      }
    } catch (err) {
      setResultMsg('에러 발생: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
      {/* 헤더 */}
      <div className='mb-4 flex items-center space-x-2'>
        <Users className='h-5 w-5 text-[#674529]' />
        <h2 className='text-base text-[#674529]'>신규 사용자 등록</h2>
      </div>

      {/* 폼 */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {/* 사용자명 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            사용자명*
          </label>
          <input
            type='text'
            name='username'
            value={formData.username}
            onChange={handleInputChange}
            placeholder='사용자명'
            className='w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
            autoComplete='off'
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            이메일*
          </label>
          <input
            type='email'
            name='email'
            value={formData.email}
            onChange={handleInputChange}
            placeholder='email@aniecong.com'
            className='w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
            autoComplete='off'
          />
        </div>

        {/* 이름 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            이름*
          </label>
          <input
            type='text'
            name='full_name'
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder='이름(실명)'
            className='w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
            autoComplete='off'
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            핸드폰번호*
          </label>
          <input
            type='tel'
            name='phone_number'
            value={formData.phone_number}
            onChange={handleInputChange}
            placeholder='010-xxxx-xxxx'
            className='w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
            autoComplete='off'
          />
        </div>

        {/* 입사일 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            입사일*
          </label>
          <input
            type='date'
            name='hire_date'
            value={formData.hire_date}
            onChange={handleInputChange}
            placeholder='2025-09-01'
            className='w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
          />
        </div>

        {/* 부서 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            부서*
          </label>
          <select
            name='department'
            value={formData.department}
            onChange={handleInputChange}
            className='w-full rounded bg-gray-100 py-2 pl-3 pr-8 text-sm text-gray-500 focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
          >
            <option value=''>부서 선택</option>
            <option value='관리부'>관리</option>
            <option value='생산부'>생산</option>
            <option value='품질부'>경영지원</option>
            <option value='제조'>제조</option>
            <option value='개발'>개발</option>
          </select>
        </div>

        {/* 비밀번호 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            비밀번호*
          </label>
          <input
            type='password'
            name='password'
            value={formData.password}
            onChange={handleInputChange}
            placeholder='비밀번호'
            className='w-full rounded bg-gray-100 px-3 py-2 text-sm focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
            autoComplete='new-password'
          />
        </div>

        {/* (참고) 담당공장 UI 남겨둠. API 요청에는 사용 안함 */}
        <div>
          <label className='mb-1 block text-sm font-medium text-gray-700'>
            담당 공장
          </label>
          <select
            name='accessLevel'
            value={formData.accessLevel}
            onChange={handleInputChange}
            className='w-full rounded bg-gray-100 py-2 pl-3 pr-8 text-sm text-gray-500 focus:border-[#674529] focus:outline-none focus:ring-1 focus:ring-[#674529]'
          >
            <option value=''>공장 선택</option>
            <option value='ALL'>ALL</option>
            <option value='P1'>P1</option>
            <option value='P2'>P2</option>
          </select>
        </div>

        {/* (참고) 역할/직책은 4로 고정되므로 출력 안함, 혹시 future-proof UI는 남겨둘 수 있음 */}
      </div>

      {/* 결과 메시지 */}
      {resultMsg && (
        <div className={`mt-3 text-sm ${resultMsg.includes('성공') ? 'text-green-600' : 'text-red-600'}`}>
          {resultMsg}
        </div>
      )}

      {/* 버튼 */}
      <div className='mt-4 flex justify-end'>
        <button
          onClick={handleSubmit}
          className='flex items-center space-x-2 rounded bg-[#674529] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#543620]'
          disabled={loading}
        >
          <UserPlus className='h-4 w-4' />
          <span>{loading ? '처리중...' : '사용자 생성'}</span>
        </button>
      </div>
    </div>
  );
};

export default CreateUser;
